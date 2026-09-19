import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { AgentId, AgentStatus, DischargeBundle } from '@/types';
import { AGENTS } from '@/data/agents';
import { AgentNode, type AgentNodeData } from './AgentNode';
import { FlowEdge, type FlowEdgeData } from './FlowEdge';
import { EDGES, NODE_POSITIONS } from './layout';
import { NodeDetailDrawer } from './NodeDetailDrawer';

export interface OrchestrationCanvasProps {
  statuses: Record<AgentId, AgentStatus>;
  /** Directed pairs [from, to] that should animate. */
  activeEdges: Array<[AgentId, AgentId]>;
  /** Node to pulse; `pulseKey` changes force a re-pulse of the same node. */
  pulse?: AgentId | null;
  pulseKey?: number;
  bundle: DischargeBundle;
  highlightMedication?: boolean;
}

const nodeTypes = { agent: AgentNode };
const edgeTypes = { flow: FlowEdge };

/** Pick handle sides based on relative node positions so edges leave from the nearest face. */
function pickHandles(source: AgentId, target: AgentId) {
  const s = NODE_POSITIONS[source];
  const t = NODE_POSITIONS[target];
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  if (Math.abs(dx) > Math.abs(dy) * 1.2) {
    return dx > 0 ? { sourceHandle: 'r', targetHandle: 'l' } : { sourceHandle: 'ls', targetHandle: 'rt' };
  }
  return dy > 0 ? { sourceHandle: 'b', targetHandle: 't' } : { sourceHandle: 'ts', targetHandle: 'bt' };
}

function CanvasInner({ statuses, activeEdges, pulse, pulseKey = 0, bundle, highlightMedication }: OrchestrationCanvasProps) {
  const [selectedId, setSelectedId] = useState<AgentId | null>(null);
  const { fitView } = useReactFlow();
  const pulseCounters = useRef<Record<string, number>>({});
  const lastPulse = useRef<string>('');

  // Track per-node pulse counters so the same node can pulse on consecutive steps.
  const pulseStamp = `${pulse ?? ''}:${pulseKey}`;
  if (pulse && pulseStamp !== lastPulse.current) {
    lastPulse.current = pulseStamp;
    pulseCounters.current[pulse] = (pulseCounters.current[pulse] ?? 0) + 1;
  }

  const nodes = useMemo<Node<AgentNodeData>[]>(
    () =>
      (Object.keys(AGENTS) as AgentId[]).map((id) => {
        const agent = AGENTS[id];
        const status = agent.status === 'not-built' ? 'not-built' : statuses[id];
        return {
          id,
          type: 'agent',
          position: NODE_POSITIONS[id],
          draggable: status !== 'not-built',
          selectable: status !== 'not-built',
          data: {
            agent,
            status,
            pulseKey: pulseCounters.current[id] ?? 0,
            selected: selectedId === id,
          },
        };
      }),
    // pulseStamp is read via the ref above; include it so nodes rebuild when a pulse lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statuses, selectedId, pulseStamp],
  );

  const edges = useMemo<Edge<FlowEdgeData>[]>(
    () =>
      EDGES.map((e) => {
        const forward = activeEdges.some(([a, b]) => a === e.source && b === e.target);
        const reverse = activeEdges.some(([a, b]) => a === e.target && b === e.source);
        const muted = AGENTS[e.target].status === 'not-built';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'flow',
          ...pickHandles(e.source, e.target),
          data: { flow: forward ? 'forward' : reverse ? 'reverse' : null, label: e.label, muted },
          zIndex: forward || reverse ? 1 : 0,
        };
      }),
    [activeEdges],
  );

  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    if (AGENTS[node.id as AgentId].status === 'not-built') return;
    setSelectedId((cur) => (cur === node.id ? null : (node.id as AgentId)));
  }, []);

  // Refit on mount and on container resize so the projector layout stays centred.
  useEffect(() => {
    const id = window.setTimeout(() => fitView({ padding: 0.12, duration: 0 }), 0);
    const onResize = () => fitView({ padding: 0.12, duration: 200 });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [fitView]);

  const selected = selectedId ? AGENTS[selectedId] : null;

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.4}
        maxZoom={1.6}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        className="bg-surface-2"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#bac7d2" />
      </ReactFlow>

      <NodeDetailDrawer
        agent={selected}
        status={selected ? statuses[selected.id] : null}
        bundle={bundle}
        highlightMedication={highlightMedication}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export function OrchestrationCanvas(props: OrchestrationCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
