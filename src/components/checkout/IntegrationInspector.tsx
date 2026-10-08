'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { workflowSteps, type BookingEvent } from '@/lib/integrations/n8n';

export interface InspectorPayload {
  id: string;
  label: string;
  method: string;
  endpoint: string;
  body: unknown;
}

interface IntegrationInspectorProps {
  payloads: InspectorPayload[];
  event: BookingEvent;
  serverCheck: 'checking' | 'match' | 'mismatch' | 'offline';
}

/**
 * What placing this booking would send, system by system, and the automation
 * that would follow. Nothing is sent: the concept stops here.
 */
export function IntegrationInspector({ payloads, event, serverCheck }: IntegrationInspectorProps) {
  const [tab, setTab] = useState(payloads[0]?.id ?? '');
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();
  const tabsId = useId();
  const steps = useMemo(() => workflowSteps.map((step) => ({ ...step, runs: step.when ? step.when(event) : true })), [event]);

  // Play the automation step by step, once.
  useEffect(() => {
    if (reduced) {
      setShown(steps.length);
      return;
    }
    setShown(0);
    const timer = setInterval(() => setShown((count) => (count >= steps.length ? count : count + 1)), 450);
    return () => clearInterval(timer);
  }, [steps.length, reduced]);

  const active = payloads.find((p) => p.id === tab) ?? payloads[0];

  const onKeyDown = (eventKey: React.KeyboardEvent) => {
    const index = payloads.findIndex((p) => p.id === tab);
    const move = eventKey.key === 'ArrowRight' ? 1 : eventKey.key === 'ArrowLeft' ? -1 : 0;
    if (!move) return;
    eventKey.preventDefault();
    const next = payloads[(index + move + payloads.length) % payloads.length]!;
    setTab(next.id);
    document.getElementById(`${tabsId}-${next.id}`)?.focus();
  };

  return (
    <section className="inspector" aria-labelledby={`${tabsId}-title`}>
      <h2 id={`${tabsId}-title`} className="inspector__title">
        What would happen next
      </h2>
      <p className="inspector__lede">
        In the live system, placing this booking would make these calls. The concept shows them instead of sending them.
      </p>
      <p className={`inspector__check inspector__check--${serverCheck}`} role="status">
        {serverCheck === 'checking' && 'Checking prices on the server…'}
        {serverCheck === 'match' && 'Prices checked on the server (POST /api/quote): they match the basket.'}
        {serverCheck === 'mismatch' && 'The server priced this differently, so the order would use the server’s prices.'}
        {serverCheck === 'offline' && 'Couldn’t reach the price check, so the order would wait for it.'}
      </p>

      <ol className="workflow" aria-label="Automation steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`workflow__step${index < shown ? ' workflow__step--done' : ''}${step.runs ? '' : ' workflow__step--skipped'}`}
          >
            <span className="workflow__title">{step.title}</span>
            <span className="workflow__detail">{step.runs ? step.detail : 'Not needed for this booking.'}</span>
          </li>
        ))}
      </ol>

      <div className="inspector__tabs" role="tablist" aria-label="Payloads" onKeyDown={onKeyDown}>
        {payloads.map((payload) => (
          <button
            key={payload.id}
            id={`${tabsId}-${payload.id}`}
            type="button"
            role="tab"
            aria-selected={payload.id === active?.id}
            aria-controls={`${tabsId}-panel`}
            tabIndex={payload.id === active?.id ? 0 : -1}
            className="inspector__tab"
            onClick={() => setTab(payload.id)}
          >
            {payload.label}
          </button>
        ))}
      </div>
      {active ? (
        <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${active.id}`} className="inspector__panel" tabIndex={0}>
          <p className="inspector__endpoint">
            <span className="inspector__method">{active.method}</span> {active.endpoint}
          </p>
          <pre className="inspector__code">
            <code>{JSON.stringify(active.body, null, 2)}</code>
          </pre>
        </div>
      ) : null}
    </section>
  );
}
