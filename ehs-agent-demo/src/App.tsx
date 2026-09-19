import { useEffect } from 'react';
import { GitFork, MessageSquare, ScrollText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge, Panel } from '@/components/layout';
import { PresenterControls } from '@/components/layout/PresenterControls';
import { StepStrip } from '@/components/layout/StepStrip';
import { AboutModal } from '@/components/layout/AboutModal';
import { OrchestrationCanvas } from '@/components/canvas/OrchestrationCanvas';
import { CaseBundlePanel } from '@/components/canvas/CaseBundlePanel';
import { GovernancePanel } from '@/components/governance/GovernancePanel';
import { ApprovalModal } from '@/components/governance/ApprovalModal';
import { AuditFeed } from '@/components/governance/AuditFeed';
import { PatientChat } from '@/components/chat/PatientChat';
import { CASE_ID } from '@/data/case';
import { OUTREACH_DRAFT, CHAT_MESSAGES } from '@/data/messages';
import { selectCurrentStep, useScenarioStore } from '@/lib/store/scenarioStore';
import { cn } from '@/lib/cn';

/**
 * App shell. Every panel reads from the zustand scenario store.
 *   - `?step=N[&resolved=1]` deep-links to a step on load.
 *   - Governance view (default): canvas + audit panel + chat.
 *   - Clinical Ops view: case bundle + chat + canvas, audit log collapsed to a strip.
 */
export default function App() {
  const derived = useScenarioStore((s) => s.derived);
  const tick = useScenarioStore((s) => s.tick);
  const showGloss = useScenarioStore((s) => s.showGloss);
  const speed = useScenarioStore((s) => s.speed);
  const index = useScenarioStore((s) => s.currentStepIndex);
  const presenterMode = useScenarioStore((s) => s.presenterMode);
  const viewMode = useScenarioStore((s) => s.viewMode);
  const aboutOpen = useScenarioStore((s) => s.aboutOpen);
  const current = useScenarioStore(selectCurrentStep);
  const resolveHuman = useScenarioStore((s) => s.resolveHuman);
  const rejectHuman = useScenarioStore((s) => s.rejectHuman);
  const setAboutOpen = useScenarioStore((s) => s.setAboutOpen);
  const setPresenterMode = useScenarioStore((s) => s.setPresenterMode);
  const setViewMode = useScenarioStore((s) => s.setViewMode);
  const rejected = useScenarioStore((s) => (current ? s.rejected.includes(current.id) : false));

  // Deep-link + keep presenter mode in sync with the browser's fullscreen state (Esc exits).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const step = params.get('step');
    if (step !== null) useScenarioStore.getState().jumpTo(Number(step));
    if (params.get('resolved') === '1') {
      const s = useScenarioStore.getState();
      const gate = s.sequence[s.currentStepIndex]?.requiresHuman;
      if (gate) s.resolveHuman(gate);
    }
    if (params.get('view') === 'clinical') setViewMode('clinical');
    if (params.get('presenter') === '1') setPresenterMode(true);

    const onFs = () => {
      if (!document.fullscreenElement && useScenarioStore.getState().presenterMode) setPresenterMode(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [setPresenterMode, setViewMode]);

  const anyActive = Object.values(derived.nodeStatus).some((s) => s === 'active' || s === 'awaiting-approval');
  const doseFlagged = derived.checks.some((c) => c.id === 'chk-dose' && c.status === 'fail');
  const lastInbound = [...derived.messages].reverse().find((m) => m.direction === 'inbound');
  const bundleRetrieved = index >= 2;

  const canvasPanel = (
    <Panel
      flush
      title="Orchestration canvas"
      subtitle="watsonx Orchestrate"
      icon={<GitFork className="h-4 w-4" />}
      actions={
        <Badge variant={anyActive ? 'info' : 'neutral'} dot>
          {anyActive ? 'Live' : 'Idle'}
        </Badge>
      }
    >
      <OrchestrationCanvas
        statuses={derived.nodeStatus}
        activeEdges={derived.activeEdges}
        pulse={derived.pulse}
        pulseKey={tick}
        bundle={derived.bundle}
        highlightMedication={doseFlagged}
      />
    </Panel>
  );

  const chatPanel = (
    <Panel
      title="Patient channel"
      subtitle="Amal — Boston Health AI · Arabic, RTL"
      icon={<MessageSquare className="h-4 w-4" />}
      actions={
        derived.messages.length ? (
          <Badge variant="neutral">
            {derived.messages.length} message{derived.messages.length === 1 ? '' : 's'}
          </Badge>
        ) : null
      }
    >
      <PatientChat
        messages={derived.messages}
        typing={derived.typing}
        showGloss={showGloss && !presenterMode}
        speed={speed}
        stacked={viewMode === 'clinical'}
      />
    </Panel>
  );

  return (
    <div className="relative flex h-full flex-col bg-surface-0">
      <Header>
        <PresenterControls />
      </Header>

      {/* `relative` so the approval overlay covers the panels but never the presenter controls or step strip. */}
      <main
        className={cn(
          'relative grid min-h-0 flex-1',
          presenterMode ? 'gap-2 p-2' : 'gap-3 p-3',
          viewMode === 'governance'
            ? 'grid-cols-[minmax(0,3fr)_minmax(0,2fr)] grid-rows-[minmax(0,3fr)_minmax(0,2fr)]'
            : 'grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,1.6fr)] grid-rows-[minmax(0,1fr)_176px]',
        )}
      >
        {viewMode === 'governance' ? (
          <>
            {canvasPanel}
            <GovernancePanel
              className="row-span-2"
              caseId={CASE_ID}
              events={derived.events}
              checks={derived.checks}
              modelsInvoked={derived.modelsInvoked}
              riskScore={derived.riskScore}
              sealed={current?.id === 'audit-complete'}
            />
            {chatPanel}
          </>
        ) : (
          <>
            <CaseBundlePanel
              bundle={derived.bundle}
              riskScore={derived.riskScore}
              highlightMedication={doseFlagged}
              retrieved={bundleRetrieved}
            />
            {chatPanel}
            {canvasPanel}
            {/* Collapsed audit strip — click the title to switch back to the Governance view */}
            <Panel
              flush
              className="col-span-3"
              title={
                <button type="button" onClick={() => setViewMode('governance')} className="hover:text-fg-0" title="Open full governance view">
                  Audit trail · collapsed
                </button>
              }
              subtitle={`${derived.events.length} events · ${derived.checks.filter((c) => c.status === 'pass').length}/${derived.checks.length || 3} checks passing`}
              icon={<ScrollText className="h-4 w-4" />}
              actions={
                derived.modelsInvoked.length ? (
                  <Badge variant="info" dot>
                    {derived.modelsInvoked.length} models · all in-region
                  </Badge>
                ) : null
              }
            >
              <AuditFeed events={derived.events} compact className="h-full px-3 py-2" />
            </Panel>
          </>
        )}

        <ApprovalModal
          gate={derived.openApproval}
          draft={OUTREACH_DRAFT}
          checks={derived.checks}
          bundle={derived.bundle}
          riskScore={derived.riskScore}
          patientReplyAr={lastInbound?.textAr ?? undefined}
          patientReplyEn={lastInbound?.textEn ?? CHAT_MESSAGES.hamdaCallSystem.textEn}
          showGloss={showGloss && !presenterMode}
          rejected={rejected}
          onApprove={() => resolveHuman('approve-message')}
          onReject={() => rejectHuman('approve-message')}
          onAcknowledge={() => resolveHuman('nurse-acknowledge')}
        />
      </main>

      <StepStrip />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
