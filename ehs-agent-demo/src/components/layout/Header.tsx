import type { ReactNode } from 'react';
import { Activity, Info, Maximize2, Minimize2, PhoneOutgoing, ShieldCheck, Stethoscope } from 'lucide-react';
import { Badge } from './Badge';
import { Chip } from './Chip';
import { cn } from '@/lib/cn';
import { FALLBACK_REPLACES_INDEX } from '@/data/scenario';
import { useScenarioStore } from '@/lib/store/scenarioStore';

interface HeaderProps {
  /** Right-hand slot — presenter controls. */
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const presenterMode = useScenarioStore((s) => s.presenterMode);
  const viewMode = useScenarioStore((s) => s.viewMode);
  const branch = useScenarioStore((s) => s.branch);
  const index = useScenarioStore((s) => s.currentStepIndex);
  const showGloss = useScenarioStore((s) => s.showGloss);
  const { setPresenterMode, setViewMode, setAboutOpen, setShowGloss, triggerFallback } = useScenarioStore.getState();

  // Fallback is offered from step 8 (outreach sent) until the nurse gate, while on the main path.
  const fallbackAvailable =
    branch === 'main' && index >= FALLBACK_REPLACES_INDEX - 1 && index <= FALLBACK_REPLACES_INDEX + 1;

  async function togglePresenter() {
    const next = !presenterMode;
    setPresenterMode(next);
    try {
      if (next && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      else if (!next && document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* fullscreen may be blocked (iframe / headless) — presenter layout still applies */
    }
  }

  return (
    <header
      className={cn(
        'flex shrink-0 items-center gap-4 border-b border-surface-4 bg-surface-1',
        presenterMode ? 'h-12 px-4' : 'h-[60px] px-5',
      )}
    >
      {/*
       * PLACEHOLDER wordmark lockup echoing the ehs.gov.ae header (EHS | Emirates Health Services).
       * Replace with the real EHS logo file (+ MDS Solutions mark) before presenting.
       */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5" aria-label="Emirates Health Services (placeholder wordmark)">
          <span className="font-heading text-[1.55rem] font-bold leading-none tracking-tight text-accent">EHS</span>
          <span className="h-7 w-px bg-surface-4" />
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-arabic text-[0.6rem] text-accent" dir="rtl">
              مؤسسة الإمارات للخدمات الصحية
            </span>
            <span className="mt-0.5 whitespace-nowrap font-heading text-[0.66rem] font-semibold tracking-wide text-accent">
              Emirates Health Services
            </span>
          </span>
        </div>
        <span className="mx-1 h-7 w-px bg-surface-3" />
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <Activity className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <div className="flex flex-col leading-none">
            <h1 className="whitespace-nowrap text-page-title text-fg-0">Agent Orchestration &amp; Governance</h1>
            {!presenterMode ? (
              <span className="mt-1 whitespace-nowrap text-caption text-fg-2">
                Post-Discharge Care Continuity · watsonx orchestration &amp; governance
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="ml-2 hidden items-center gap-2 lg:flex">
        <Badge variant="neutral" dot>
          Simulated — no live calls
        </Badge>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="flex h-6 items-center gap-1 rounded px-1.5 text-caption text-fg-2 hover:bg-surface-3 hover:text-fg-0"
          title="About this demo"
        >
          <Info className="h-3.5 w-3.5" /> About
        </button>
      </div>

      {/* Persona view toggle */}
      <div className="ml-2 flex items-center gap-1 rounded-md border border-surface-4 bg-surface-2 p-0.5">
        <ViewButton active={viewMode === 'governance'} onClick={() => setViewMode('governance')} icon={<ShieldCheck />}>
          Governance
        </ViewButton>
        <ViewButton active={viewMode === 'clinical'} onClick={() => setViewMode('clinical')} icon={<Stethoscope />}>
          Clinical Ops
        </ViewButton>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {fallbackAvailable ? (
          <Chip onClick={triggerFallback} icon={<PhoneOutgoing />} title="Branch: patient doesn't reply → escalate to Hamda">
            No reply → Hamda
          </Chip>
        ) : null}
        {!presenterMode ? (
          <label
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-caption text-fg-2"
            title="Show English gloss under Arabic messages (dev build)"
          >
            <input type="checkbox" checked={showGloss} onChange={(e) => setShowGloss(e.target.checked)} className="accent-accent" />
            EN gloss
          </label>
        ) : null}
        {children}
        <button
          type="button"
          onClick={togglePresenter}
          title={presenterMode ? 'Exit presenter mode' : 'Presenter mode — full screen, hide dev chrome'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded border transition-colors',
            presenterMode
              ? 'border-accent/60 bg-accent/10 text-accent'
              : 'border-surface-4 bg-surface-2 text-fg-1 hover:text-fg-0',
          )}
        >
          {presenterMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </header>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-6 items-center gap-1.5 whitespace-nowrap rounded px-2 text-caption transition-colors [&>svg]:h-3 [&>svg]:w-3',
        active ? 'bg-accent text-white' : 'text-fg-2 hover:text-fg-0',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
