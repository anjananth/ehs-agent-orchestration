import { CalendarClock, ClipboardList, FileText, Pill } from 'lucide-react';
import type { DischargeBundle } from '@/types';
import { Badge, SectionLabel } from '@/components/layout';
import { cn } from '@/lib/cn';

interface CaseBundleCardProps {
  bundle: DischargeBundle;
  /** Highlight the medication item — used when the dose policy fires. */
  highlightMedication?: boolean;
  compact?: boolean;
  className?: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Human-readable summary of the FHIR-lite discharge bundle — Encounter,
 * CarePlan, MedicationRequest, ServiceRequest. Not raw JSON: this is for a
 * business/clinical audience.
 */
export function CaseBundleCard({ bundle, highlightMedication = false, compact = false, className }: CaseBundleCardProps) {
  const { patient, encounter, carePlan, medicationRequests, serviceRequests } = bundle;
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Patient + encounter */}
      <Resource icon={<FileText className="h-3.5 w-3.5" />} type="Encounter" id={encounter.id}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[0.85rem] font-semibold text-fg-0">
            {patient.name} <span className="font-normal text-fg-2">· {patient.age}{patient.sex}</span>
          </span>
          <Badge variant="neutral">{encounter.triggerEvent}</Badge>
        </div>
        <Row k="Diagnosis" v={encounter.primaryDiagnosis} />
        <Row k="Admission" v={`${encounter.specialty} · ${fmtDate(encounter.admitted)} → ${fmtDate(encounter.discharged)}`} />
        {!compact ? <Row k="Disposition" v={encounter.dischargeDisposition} /> : null}
      </Resource>

      {/* Care plan */}
      <Resource icon={<ClipboardList className="h-3.5 w-3.5" />} type="CarePlan" id={carePlan.id}>
        <div className="text-[0.8rem] font-medium text-fg-0">{carePlan.title}</div>
        <ul className="mt-1 space-y-0.5 text-log text-fg-1">
          {(compact ? carePlan.instructions.slice(0, 2) : carePlan.instructions).map((i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-fg-3">–</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </Resource>

      {/* Medication requests */}
      {medicationRequests.map((m) => (
        <Resource
          key={m.id}
          icon={<Pill className="h-3.5 w-3.5" />}
          type="MedicationRequest"
          id={m.id}
          className={highlightMedication ? 'border-gov-fail/60 bg-gov-fail/5' : undefined}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.8rem] font-medium text-fg-0">{m.medication}</span>
            <span className="font-mono text-log text-fg-1">
              <span className="text-fg-3 line-through">{m.previousDose}</span>
              <span className="mx-1 text-fg-3">→</span>
              <span className={highlightMedication ? 'font-semibold text-gov-fail' : 'text-fg-0'}>{m.newDose}</span>
            </span>
          </div>
          <Row k="Schedule" v={`${m.route}, ${m.frequency}`} />
          {!compact ? <Row k="Reason" v={m.reason} /> : null}
        </Resource>
      ))}

      {/* Service requests */}
      {serviceRequests.map((s) => (
        <Resource
          key={s.id}
          icon={<CalendarClock className="h-3.5 w-3.5" />}
          type="ServiceRequest"
          id={s.id}
          className={s.createdByAgent ? 'border-gov-pass/50 bg-gov-pass/5' : undefined}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.8rem] font-medium text-fg-0">{s.display}</span>
            <Badge variant={s.priority === 'urgent' ? 'fail' : 'neutral'}>{s.priority}</Badge>
          </div>
          <Row k="Due" v={`${s.dueWithin}${s.scheduledFor ? ` · ${fmtDate(s.scheduledFor)}` : ''}`} />
          <Row k="Requested by" v={s.requestedBy} />
        </Resource>
      ))}
    </div>
  );
}

function Resource({
  icon,
  type,
  id,
  children,
  className,
}: {
  icon: React.ReactNode;
  type: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border border-surface-3 bg-surface-1/60 p-2.5 transition-colors', className)}>
      <SectionLabel className="mb-1.5" trailing={<span className="font-mono">{id}</span>}>
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {type}
        </span>
      </SectionLabel>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mt-0.5 grid grid-cols-[88px_1fr] gap-2 text-log">
      <span className="text-fg-3">{k}</span>
      <span className="text-fg-1">{v}</span>
    </div>
  );
}
