import { FolderHeart } from 'lucide-react';
import type { DischargeBundle, RiskScore } from '@/types';
import { Badge, Panel, SectionLabel } from '@/components/layout';
import { CaseBundleCard } from './CaseBundleCard';

interface CaseBundlePanelProps {
  bundle: DischargeBundle;
  riskScore: RiskScore | null;
  highlightMedication?: boolean;
  /** Bundle has been retrieved by the agent (step 3+). */
  retrieved: boolean;
  className?: string;
}

/**
 * Clinical Ops view: the case bundle foregrounded as its own panel. Same
 * card the canvas drawer uses, plus the risk score once it exists.
 */
export function CaseBundlePanel({ bundle, riskScore, highlightMedication, retrieved, className }: CaseBundlePanelProps) {
  return (
    <Panel
      className={className}
      title="Case bundle"
      subtitle="Cerner Millennium · FHIR R4"
      icon={<FolderHeart className="h-4 w-4" />}
      actions={
        retrieved ? (
          <Badge variant="pass" dot>
            Retrieved
          </Badge>
        ) : (
          <Badge variant="neutral" dot>
            Not yet retrieved
          </Badge>
        )
      }
    >
      {retrieved ? (
        <div className="flex flex-col gap-3">
          {riskScore ? (
            <div className="rounded-md border border-model-classical-ml/50 bg-surface-2/80 px-3 py-2">
              <SectionLabel trailing={riskScore.modelVersion}>30-day readmission risk</SectionLabel>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-2xl font-semibold text-fg-0">{riskScore.score.toFixed(2)}</span>
                <Badge variant={riskScore.band === 'high' ? 'fail' : riskScore.band === 'moderate' ? 'pending' : 'pass'} tone="solid">
                  {riskScore.band.toUpperCase()}
                </Badge>
              </div>
              <ul className="mt-1.5 space-y-0.5 text-log text-fg-2">
                {riskScore.drivers.map((d) => (
                  <li key={d}>– {d}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <CaseBundleCard bundle={bundle} highlightMedication={highlightMedication} />
        </div>
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed border-surface-4 px-6 text-center text-caption text-fg-3">
          The Care Continuity Agent pulls the Encounter, CarePlan, MedicationRequest and ServiceRequest at step 3.
        </div>
      )}
    </Panel>
  );
}
