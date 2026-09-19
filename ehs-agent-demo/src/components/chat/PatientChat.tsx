import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, HeartPulse, Phone, ShieldCheck, Video } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { CASE_BUNDLE } from '@/data/case';
import { FLEET_MODELS } from '@/data/models';
import { Badge } from '@/components/layout';
import { cn } from '@/lib/cn';
import { ArabicText } from './ArabicText';

interface PatientChatProps {
  messages: ChatMessage[];
  /** Who is "typing" for the message that just landed. */
  typing: 'amal' | 'patient' | null;
  /** Show English gloss captions under Arabic bubbles (dev build). */
  showGloss: boolean;
  /** Playback speed — scales the typing delay. */
  speed: number;
  /** Narrow-column layout: annotations below the phone instead of beside it. */
  stacked?: boolean;
  className?: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Amal-styled patient surface: a phone-width column centred in the panel,
 * `dir="rtl"` so it reads as an Arabic app — Amal's messages sit on the
 * start (right) side, the patient's own replies on the end (left) side.
 * Orchestrator annotations (classifier tags, model badges) are rendered in
 * the margin *outside* the phone so it's clear the patient never sees them.
 */
export function PatientChat({ messages, typing, showGloss, speed, stacked = false, className }: PatientChatProps) {
  const [revealed, setRevealed] = useState(messages.length);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(messages.length);

  // Typing beat: when a new message lands with a typing hint, hold it back briefly.
  useEffect(() => {
    if (messages.length > prevLen.current && typing) {
      setRevealed(messages.length - 1);
      const t = window.setTimeout(() => setRevealed(messages.length), 1100 / speed);
      prevLen.current = messages.length;
      return () => window.clearTimeout(t);
    }
    prevLen.current = messages.length;
    setRevealed(messages.length);
    return undefined;
  }, [messages.length, typing, speed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [revealed]);

  const visible = messages.slice(0, revealed);
  const isTyping = revealed < messages.length;
  const typer = isTyping ? typing : null;

  return (
    <div className={cn('flex h-full justify-center gap-4', stacked ? 'flex-col items-center' : 'items-stretch', className)}>
      {/* Phone column */}
      <div
        className={cn(
          'flex w-[400px] max-w-full shrink-0 flex-col overflow-hidden rounded-[22px] border border-surface-4 bg-[#f4f6f8] shadow-panel',
          stacked && 'min-h-0 flex-1',
        )}
      >
        {/* Amal app header */}
        <div className="flex items-center gap-3 border-b border-surface-3 bg-white px-4 py-2.5" dir="rtl">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white"><HeartPulse className="h-4 w-4" />
          </span>
          <div className="flex-1 leading-tight">
            <div className="text-[0.85rem] font-semibold text-fg-0">أمل · Amal</div>
            <div className="text-[0.66rem] text-fg-2">مساعدك الصحي · EHS</div>
          </div>
          <Phone className="h-4 w-4 text-fg-3" />
          <Video className="h-4 w-4 text-fg-3" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3" dir="rtl">
          {visible.length === 0 && !isTyping ? (
            <div className="m-auto text-center text-caption text-fg-3" dir="ltr">
              No messages yet — the approved outreach lands here at step 8
            </div>
          ) : null}
          <AnimatePresence initial={false}>
            {visible.map((m) => (
              <Bubble key={m.id} message={m} showGloss={showGloss} />
            ))}
            {typer ? <TypingBubble key="typing" who={typer} /> : null}
          </AnimatePresence>
        </div>

        {/* Composer (decorative) */}
        <div className="flex items-center gap-2 border-t border-surface-3 bg-white px-3 py-2" dir="rtl">
          <div className="h-8 flex-1 rounded-full bg-surface-0 px-3 text-[0.75rem] leading-8 text-fg-3">اكتب رسالة…</div>
        </div>
      </div>

      {/* Margin annotations — what the orchestrator sees, not the patient */}
      <div className={cn('flex min-w-0 flex-col gap-2 py-1', stacked ? 'w-[400px] max-w-full shrink-0' : 'flex-1')}>
        <div className="text-caption uppercase tracking-[0.08em] text-fg-3">
          Orchestrator view of this channel{stacked && visible.length > 1 ? ' · latest' : ''}
        </div>
        <AnimatePresence initial={false}>
          {(stacked ? visible.slice(-1) : visible).map((m) => (
            <Annotation key={m.id} message={m} />
          ))}
        </AnimatePresence>
        {visible.length === 0 ? (
          <div className="text-log text-fg-3">
            Patient: {CASE_BUNDLE.patient.name} · preferred language: Arabic · channel: Amal (Boston Health AI).
            <br />
            Amal is the delivery surface only — it never decides what to send.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Bubble({ message, showGloss }: { message: ChatMessage; showGloss: boolean }) {
  if (message.direction === 'system') {
    return (
      <motion.div
        layout="position"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto my-1 max-w-[90%] rounded-full bg-surface-3/70 px-3 py-1 text-center text-[0.68rem] text-fg-2"
        dir="ltr"
      >
        {message.textEn}
      </motion.div>
    );
  }
  const outbound = message.direction === 'outbound';
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn('flex max-w-[86%] flex-col', outbound ? 'self-start' : 'self-end')}
    >
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2.5',
          outbound ? 'rounded-tr-md border border-surface-4 bg-white text-fg-0' : 'rounded-tl-md bg-accent text-white',
        )}
      >
        {message.textAr ? <ArabicText size="lg">{message.textAr}</ArabicText> : null}
        <div className="mt-1 text-[0.62rem] opacity-60" dir="ltr">
          {fmtTime(message.timestamp)}
        </div>
      </div>
      {showGloss ? (
        <div className="mt-1 px-1 text-[0.7rem] italic leading-snug text-fg-2" dir="ltr">
          {message.textEn}
        </div>
      ) : null}
    </motion.div>
  );
}

function TypingBubble({ who }: { who: 'amal' | 'patient' }) {
  const outbound = who === 'amal';
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex h-9 w-16 items-center justify-center gap-1 rounded-2xl',
        outbound ? 'self-start rounded-tr-md border border-surface-4 bg-white' : 'self-end rounded-tl-md bg-accent',
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn('h-1.5 w-1.5 rounded-full', outbound ? 'bg-fg-2' : 'bg-white/80')}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </motion.div>
  );
}

function Annotation({ message }: { message: ChatMessage }) {
  const model = message.draftedBy ? FLEET_MODELS[message.draftedBy] : null;
  const escalate = message.classification === 'clinical-escalation';
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        'rounded-md border px-2.5 py-2',
        escalate ? 'border-gov-fail/50 bg-gov-fail/[0.06]' : 'border-surface-3 bg-surface-2/50',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[0.66rem] uppercase text-fg-2">
          {message.direction === 'outbound' ? 'Outbound' : message.direction === 'inbound' ? 'Inbound' : 'System'} · {message.id}
        </span>
        {model ? (
          <Badge variant={model.colourToken} dot>
            drafted by {model.name}
          </Badge>
        ) : null}
        {message.direction === 'outbound' ? (
          <Badge variant="pass" icon={<ShieldCheck />}>
            pre-send checks passed
          </Badge>
        ) : null}
        {escalate ? (
          <Badge variant="fail" tone="solid" icon={<AlertTriangle />}>
            Clinical escalation → Maitha
          </Badge>
        ) : null}
        {message.classification === 'routine' ? <Badge variant="neutral">routine</Badge> : null}
      </div>
      {message.direction !== 'system' ? (
        <div className="mt-1 text-log text-fg-2">{message.textEn}</div>
      ) : null}
    </motion.div>
  );
}
