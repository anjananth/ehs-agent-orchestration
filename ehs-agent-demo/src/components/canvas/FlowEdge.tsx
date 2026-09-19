import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow';
import { gov, surface } from '@/styles/tokens';

export interface FlowEdgeData {
  /** null = quiescent; forward = source→target; reverse = target→source. */
  flow: 'forward' | 'reverse' | null;
  label?: string;
  /** Muted styling for edges to not-built placeholder nodes. */
  muted?: boolean;
}

/**
 * Edge with a static base stroke plus, when `flow` is set, an animated dashed
 * overlay and a travelling particle showing control/data direction.
 */
function FlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<FlowEdgeData>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  const flow = data?.flow ?? null;
  const muted = data?.muted ?? false;
  const active = flow !== null;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: active ? 'rgba(37,99,207,0.3)' : muted ? 'rgba(186,199,210,0.7)' : surface[4],
          strokeWidth: active ? 2 : 1.5,
          strokeDasharray: muted ? '4 4' : undefined,
          transition: 'stroke 300ms',
        }}
      />
      {active ? (
        <>
          <path
            d={path}
            fill="none"
            stroke={gov.info}
            strokeWidth={2}
            strokeDasharray="6 10"
            strokeLinecap="round"
            className="animate-dash"
            style={{ animationDirection: flow === 'reverse' ? 'reverse' : 'normal' }}
          />
          <circle r={3.5} fill={gov.info} style={{ filter: 'drop-shadow(0 0 3px rgba(37,99,207,0.7))' }}>
            <animateMotion
              dur="1.4s"
              repeatCount="indefinite"
              path={path}
              keyPoints={flow === 'reverse' ? '1;0' : '0;1'}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </>
      ) : null}
      {data?.label && !muted ? (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className={`pointer-events-none absolute rounded border px-1.5 py-0.5 text-[0.625rem] font-medium tracking-wide transition-colors ${
              active
                ? 'border-gov-info/50 bg-surface-1 text-gov-info'
                : 'border-surface-3 bg-surface-1/95 text-fg-2'
            }`}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const FlowEdge = memo(FlowEdgeComponent);
