// src/app/onboarding/[agentType]/page.tsx (server component)
import React from 'react';
import AgentNotFound from '../../../../../agent-features/components/AgentNotFound';
import ClientWrapper from './client-wrapper';
import { AgentType } from '../../../../api/agents/agent-types';

type Props = {
  params: { agentType: string };
  searchParams: { activation_id: string, title: string, description: string };
};

export default function AgentPage({ params, searchParams }: Props) {
  const agentIdParam = params.agentType as AgentType;

  if (!Object.values(AgentType).includes(agentIdParam)) {
    return <AgentNotFound />;
  }
  return (
    <div data-onboarding-page>
      <ClientWrapper
        agentType={agentIdParam}
        activation_id={searchParams.activation_id}
      />
    </div>
  );
}
