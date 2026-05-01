'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import AgentIcon from '../../../../agent-features/components/agentIcon';
import { useQuery } from '@tanstack/react-query';
import { getAllAgentsMaster, deleteDatabase, getDeleteDatabaseConfig } from '../../../api/agents/agents';
import { AgentType } from '../../../api/agents/agent-types';
import { OnboardingActivatedTickMarkSvgIcon } from '../../../assests/icons/icons';
import { useRouter } from 'next/navigation';
import { useActivateAgentMutation } from '../../../../services/mutations/agents';
import DeleteModal from '../../../../common/components/DeleteModal';
import DeleteDatabaseModal from '../../../../common/components/DeleteDatabaseModal';

interface ActivateAgentsProps { }

interface Agent {
  _id: string;
  name: string;
  description: string;
  agent_type:
  | AgentType.DOCUMENT
  | AgentType.NEWS
  | AgentType.EMAIL
  | AgentType.SERVICE_TICKET;
  is_agent_active: boolean;
  is_activated: boolean;
  activation_details: {
    activation_id: string;
    agent_type: AgentType;
    status: string;
    current_step: string;
  } | null;
}

const ActivateAgents: React.FC<ActivateAgentsProps> = ({ }) => {
  const router = useRouter();
  const activateAgent = useActivateAgentMutation();
  const handleOpen = (route: string) => {
    router.push(route);
  };
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);

  const { data: agentsData } = useQuery({
    queryKey: ['agent-master'],
    queryFn: getAllAgentsMaster,
    refetchOnWindowFocus: false,
  });

  const { data: deleteDatabaseConfig } = useQuery({
    queryKey: ['delete-database-config'],
    queryFn: getDeleteDatabaseConfig,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (agentsData?.data?.data) {
      setAgents(agentsData?.data?.data);
    }
  }, [agentsData]);

  const handleDeleteConfirm = () => {
    if (deleteDatabaseConfig && deleteDatabaseConfig?.data?.value === true) {
      setShowDeleteConfirm(false);
      setShowDeleteAnimation(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('org_id');
    localStorage.setItem('logout_event', Date.now().toString());
    window.location.replace(window.location.origin);
  };

  const handleActivation = async (agentType: AgentType) => {
    const response = await activateAgent.mutateAsync(agentType);
    if (response && response?.activation_details?.activation_id) {
      handleOpen(
        `/app/admin/agents/${agentType}?activation_id=${response?.activation_details?.activation_id}`
      );
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden flex flex-col justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-gray-800">
            Activate agents as per your need
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-5 w-[976px]">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className={`flex flex-row items-center bg-white shadow-sm border border-gray-200 transition-shadow w-[464px] h-[127px] rounded-[24px] p-[10px] ${agent.is_activated && agent.agent_type !== AgentType.SERVICE_TICKET ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                } ${agent.agent_type === AgentType.SERVICE_TICKET ? 'opacity-50' : ''}`}
              onClick={() =>
                agent.is_activated &&
                agent.agent_type !== AgentType.SERVICE_TICKET &&
                handleOpen(
                  `/app/admin/agents/${agent.agent_type}?activation_id=${agent.activation_details?.activation_id}`
                )
              }
            >
              <div className="flex-shrink-0">
                <AgentIcon type={agent.agent_type} size="small" />
              </div>

              <div className="flex flex-col flex-grow pl-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {agent.name}
                </h3>

                <p className="text-xs text-gray-500 mb-3 leading-tight">
                  {agent.description}
                </p>

                {agent.is_activated ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <OnboardingActivatedTickMarkSvgIcon />
                    <span className="font-medium text-xs">Activated</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (agent.agent_type !== AgentType.SERVICE_TICKET) {
                        handleActivation(agent.agent_type);
                      }
                    }}
                    disabled={agent.agent_type === AgentType.SERVICE_TICKET}
                    className={`inline-flex items-center px-4 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-xs font-medium transition-colors w-fit ${agent.agent_type === AgentType.SERVICE_TICKET
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* <div className="flex items-end justify-end bg-transparent w-[464px] h-[127px] pb-2">
          <button
            type="button"
            className="inline-flex items-center px-6 py-2 rounded-md border border-gray-800 bg-white text-gray-800 text-sm font-medium transition-colors hover:bg-gray-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete database
          </button>
          </div> */}
        </div>

        {deleteDatabaseConfig && deleteDatabaseConfig?.data?.value === true && (
          <div className="flex justify-center mt-12">
            <button
              type="button"
              className="inline-flex items-center px-6 py-2 rounded-md border border-gray-800 bg-white text-gray-800 text-sm font-medium transition-colors hover:bg-gray-50"
              onClick={() => setShowDeleteConfirm(() => deleteDatabaseConfig && deleteDatabaseConfig?.data?.value === true ? true : false)}
            >
              Delete database
            </button>
          </div>)}
      </div>

      <DeleteModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onDelete={handleDeleteConfirm}
        title="database"
      />
      <DeleteDatabaseModal
        show={showDeleteAnimation}
        onClose={() => setShowDeleteAnimation(false)}
        onContinue={handleLogout}
        apiCall={deleteDatabase}
      />
    </div>
  );
};

export default ActivateAgents;