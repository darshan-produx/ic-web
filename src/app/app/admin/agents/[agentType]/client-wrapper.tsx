// src/app/app/admin/agents/[agentType]/client-wrapper.tsx (client)
'use client';
import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import AgentFallbackShell from '../../../../../agent-features/components/AgentFallbackShell';
import { AgentType } from '../../../../api/agents/agent-types';
import AgentNotFound from '../../../../../agent-features/components/AgentNotFound';

export default function ClientWrapper({
  agentType,
  activation_id,
}: {
  agentType: AgentType;
  activation_id: string;
}) {
  const DynamicComponent = useMemo(() => {
    switch (agentType) {
      case AgentType.DOCUMENT:
        return dynamic(() => import('../../../../../agent-features/document-agent/DocumentAgentSetup'), { ssr: false });
      case AgentType.NEWS:
        return dynamic(() => import('../../../../../agent-features/usecase-agent/UsecaseAgentSetup'), { ssr: false });
      case AgentType.EMAIL:
        return dynamic(
          () => import('../../../../../agent-features/email-agent/EmailAgentSetup'),
          { ssr: false }
        );
      //   case AgentType.SERVICE_TICKET:
      //     return dynamic(() => import('@/agent-features/service-ticket-agent/components/ServiceTicketWizard'), { ssr: false });
      default:
        return null;
    }
  }, [agentType]);

  if (!DynamicComponent) {
    return <AgentNotFound />;
  }

  return (
    <Suspense
      fallback={
        <AgentFallbackShell>
          <div>Loading agent UI…</div>
        </AgentFallbackShell>
      }
    >
      <DynamicComponent activation_id={activation_id} />
    </Suspense>
  );
}
