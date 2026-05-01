'use client';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllStakeholderEngagementLevelSynthesis } from '../../app/api/customer-360/stakeholdersApi/customer360-stakeholder';
import { getAllSignals } from '../../app/api/customers/customers';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { ProgressDots } from '../components/ProgressDots';
import { ActionButtons } from '../components/ActionButtons';
import { usePollingTimeout } from '../hooks/usePollingTimeout';
import { toast } from 'react-toastify';
import { Signal as SignalCard } from '../../app/app/customers/[id]/journey/signalCard';
import { JourneySignal } from '../../app/app/customers/[id]/journey/journey';
import SignalDetails from '../../app/app/customers/[id]/journey/signalDetails';
import DeleteModal from '../../common/components/DeleteModal';
import { useUpdateEventInEventJourney } from '../../services/mutations/customersMutations';
import { apiRequest } from '../../common/api-request';

interface StakeholderData {
  _id: string;
  customer_id: number;
  customer_name?: string;
  name: string;
  engagement_level: string | null;
  email: string;
  synthesis: string;
  support_level?: string;
}

interface EngagementLevelProps {
  activation_id: string;
  onBack?: () => void;
  onContinue?: () => void;
}

const EngagementLevel: React.FC<EngagementLevelProps> = ({
  activation_id,
  onBack,
  onContinue,
}) => {
  const [stakeholders, setStakeholders] = useState<StakeholderData[]>([]);
  const [activeTab, setActiveTab] = useState<'engagement' | 'signals'>(
    'signals'
  );
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [totalStakeholders, setTotalStakeholders] = useState(0);

  // Signals state
  const [signals, setSignals] = useState<JourneySignal[]>([]);
  const [animatedSignalIds, setAnimatedSignalIds] = useState<Set<string>>(new Set());
  const [isSignalsTimedOut, setIsSignalsTimedOut] = useState(false);
  const [isSignalsPolling, setIsSignalsPolling] = useState(true);
  const lastFetchTimeRef = useRef<string | undefined>(undefined);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const updateSignalMutation = useUpdateEventInEventJourney();

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  const deleteToggle = () => setDeleteModal((prev) => !prev);

  const handleDelete = async () => {
    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId: selectedSignalId,
        data: { is_deleted: true },
        fromPage: 'journey',
      });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
        setSignals((prev) => prev.filter((s) => s._id !== selectedSignalId));
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
    setIsSideDrawerOpen(false);
    deleteToggle();
  };
  // Fetch stakeholder engagement data
  const { data: stakeholderData, isLoading } = useQuery({
    queryKey: ['stakeholder-engagement-synthesis', activation_id],
    queryFn: () => getAllStakeholderEngagementLevelSynthesis(activation_id),
    enabled: !!activation_id,
    refetchInterval: () => {
      if (isTimedOut) return false;
      return Array.isArray(stakeholders) &&
        stakeholders.length < totalStakeholders
        ? 5000
        : false;
    },
  });

  const isStakeholderDataRunning =
    Array.isArray(stakeholders) && stakeholders.length < totalStakeholders;

  const stakeholderDataSuccessful =
    Array.isArray(stakeholders) && stakeholders.length === totalStakeholders;

  usePollingTimeout({
    isRunning: isStakeholderDataRunning,
    isSuccessful: stakeholderDataSuccessful,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Stakeholder data polling timed out');
      // toast.error('Timed out. Please try again.');
      setIsTimedOut(true);
    },
  });

  useEffect(() => {
    if (
      stakeholderData?.data?.data &&
      Array.isArray(stakeholderData.data?.data)
    ) {
      setStakeholders(stakeholderData?.data?.data);
      setTotalStakeholders(stakeholderData?.data?.total || 0);
    }
  }, [stakeholderData]);

  // Signals polling
  const { data: signalsResponse } = useQuery({
    queryKey: ['all-signals-polling', activation_id],
    queryFn: () =>
      getAllSignals({
        skip: 0,
        limit: 200,
        updated_after: lastFetchTimeRef.current,
      }),
    enabled: isSignalsPolling && !isSignalsTimedOut,
    refetchInterval: isSignalsPolling && !isSignalsTimedOut ? 10000 : false,
  });

  // Process incoming signals data
  useEffect(() => {
    if (!signalsResponse?.data) return;
    const incoming: JourneySignal[] = signalsResponse.data.data || [];
    if (incoming.length === 0) return;

    setSignals((prev) => {
      const existingIds = new Set(prev.map((s) => s._id));
      const newSignals = incoming.filter((s) => !existingIds.has(s._id));
      if (newSignals.length === 0) return prev;

      // Track new signal IDs for animation
      setAnimatedSignalIds((prevIds) => {
        const next = new Set(prevIds);
        newSignals.forEach((s) => next.add(s._id));
        return next;
      });

      // Remove animation class after transition completes
      setTimeout(() => {
        setAnimatedSignalIds((prevIds) => {
          const next = new Set(prevIds);
          newSignals.forEach((s) => next.delete(s._id));
          return next;
        });
      }, 700);

      return [...prev, ...newSignals].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    });

    // Update the last fetch time based on the most recent signal's created_at
    const latestCreatedAt = incoming.reduce((latest, s) => {
      const t = new Date(s.created_at).getTime();
      return t > latest ? t : latest;
    }, 0);
    if (latestCreatedAt > 0) {
      lastFetchTimeRef.current = new Date(latestCreatedAt).toISOString();
    }
  }, [signalsResponse]);

  // 8-minute timeout for signals polling
  usePollingTimeout({
    isRunning: isSignalsPolling && !isSignalsTimedOut,
    isSuccessful: false, // never "successful" - we poll until timeout
    timeoutMs: 60000 * 8,
    resetKey: activation_id,
    onTimeout: () => {
      console.warn('Signals polling timed out');
      toast.error('Timed out. Please try again.');
      setIsSignalsTimedOut(true);
      setIsSignalsPolling(false);
    }
  });

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower === 'good') return 'bg-green-100 text-green-800';
    if (statusLower === 'average') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'poor') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const toggleExpanded = (stakeholderId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [stakeholderId]: !prev[stakeholderId],
    }));
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
  };

  // Group stakeholders by customer
  const groupedStakeholders = useMemo(() => {
    const groups: Record<string, StakeholderData[]> = {};
    stakeholders.forEach((stakeholder) => {
      const customerName = stakeholder.customer_name || 'Unknown Customer';
      if (!groups[customerName]) {
        groups[customerName] = [];
      }
      groups[customerName].push(stakeholder);
    });
    return groups;
  }, [stakeholders]);

  return (
    <>
      <OnboardingLayoutApp>
        <div className="flex flex-col items-center px-4 py-8">
          {/* Title - Outside white container */}
          <h1 className="text-xl font-medium text-gray-900 text-center mb-6 leading-7">
            Here are the stakeholder engagement signals we have found
          </h1>

          {/* Progress Dots - Outside white container */}
          <div className="flex justify-center mb-8">
            <ProgressDots totalSteps={3} currentStep={3} />
          </div>

          {/* White container with tabs and table - height auto based on content */}
          <div className="bg-white border border-gray-200 rounded-3xl max-w-4xl w-full h-fit">
            {/* Tabs - with padding */}
            <div className="pt-8">
              <div className="flex px-10">
                <button
                  onClick={() => setActiveTab('signals')}
                  className={`w-[50%] pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'signals'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Signals{signals.length > 0 ? ` (${signals.length})` : ''}
                </button>
                <button
                  onClick={() => setActiveTab('engagement')}
                  className={`w-[50%] pb-3 text-sm font-medium border-b-2 transition-colors ml-8 ${activeTab === 'engagement'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Engagement
                </button>
              </div>
              <div className="border-b border-gray-200"></div>
            </div>

            {/* Content */}
            {activeTab === 'engagement' ? (
              <div className="pb-6 pt-6">
                {Object.entries(groupedStakeholders).map(
                  ([customerName, customerStakeholders], groupIndex) => (
                    <div key={customerName}>
                      {/* Separator line between customer groups - full width */}
                      {groupIndex > 0 && (
                        <div className="border-t border-gray-200 my-6"></div>
                      )}

                      {/* Customer Header - with padding */}
                      <h2 className="text-base font-semibold text-gray-900 mb-5 px-10">
                        {customerName} stakeholders
                      </h2>

                      {/* Table - with padding on cells */}
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-xs font-normal text-gray-400 pb-4 pr-4 pl-10 w-1/4">
                              Stakeholder
                            </th>
                            <th className="text-left text-xs font-normal text-gray-400 pb-4 pr-4 w-1/6">
                              Engagement
                            </th>
                            <th className="text-left text-xs font-normal text-gray-400 pb-4 pr-10">
                              Summary
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerStakeholders.map((stakeholder) => {
                            const displayEngagementLevel =
                              stakeholder.support_level ||
                              stakeholder.engagement_level ||
                              '-';

                            const isExpanded = expandedRows[stakeholder._id];
                            const synthesis =
                              stakeholder.synthesis || 'No synthesis available';
                            const shouldShowMore = synthesis.length > 150;
                            const displayText = isExpanded
                              ? synthesis
                              : truncateText(synthesis);

                            return (
                              <tr key={stakeholder._id}>
                                <td className="py-3 pr-4 pl-10 align-top">
                                  <div className="text-sm font-medium text-gray-900">
                                    {stakeholder.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {stakeholder.customer_name}
                                  </div>
                                </td>
                                <td className="py-3 pr-4 align-top">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                                      displayEngagementLevel === '-'
                                        ? null
                                        : displayEngagementLevel
                                    )}`}
                                  >
                                    {displayEngagementLevel}
                                  </span>
                                </td>
                                <td className="py-3 pr-10 align-top">
                                  <span className="text-sm text-gray-600 leading-relaxed">
                                    {displayText}
                                    {shouldShowMore && (
                                      <>
                                        ...{' '}
                                        <button
                                          onClick={() =>
                                            toggleExpanded(stakeholder._id)
                                          }
                                          className="text-gray-900 font-semibold hover:text-gray-700 inline"
                                        >
                                          {isExpanded ? 'Less' : 'More'}
                                        </button>
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* Empty State */}
                {Object.keys(groupedStakeholders).length === 0 && (
                  <div className="text-center py-12 text-gray-500 px-10">
                    No stakeholder engagement data available yet
                  </div>
                )}
              </div>
            ) : (
              <div className="pb-6 pt-6 px-6">
                {signals.length === 0 && isSignalsPolling && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-3"></div>
                    <p>Waiting for signals</p>
                  </div>
                )}
                {signals.length === 0 && !isSignalsPolling && (
                  <div className="text-center py-12 text-gray-500">
                    No signals found
                  </div>
                )}
                <div className="space-y-2">
                  {signals.map((signal, index) => (
                    <div
                      key={signal._id}
                      className={`transition-all duration-500 ease-out ${animatedSignalIds.has(signal._id)
                        ? 'animate-[slideIn_0.5s_ease-out_both]'
                        : ''
                        }`}
                      style={
                        animatedSignalIds.has(signal._id)
                          ? { animationDelay: `${index * 0.08}s` }
                          : undefined
                      }
                    >
                      <SignalCard
                        signal={signal}
                        setIsSideDrawerOpen={setIsSideDrawerOpen}
                        setSelectedSignalId={setSelectedSignalId}
                        showTimeline={false}
                        sortBy="signal_created_at"
                      />
                    </div>
                  ))}
                </div>
                {isSignalsPolling && signals.length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-4 text-xs text-gray-400">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                    Checking for new signals
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {(onBack || onContinue) && (
            <div className="mt-8">
              <ActionButtons
                onBack={onBack}
                onContinue={onContinue}
                backLabel="Back"
                continueLabel="Continue"
              />
            </div>
          )}
        </div>
      </OnboardingLayoutApp>
      <SignalDetails
        isOpen={isSideDrawerOpen}
        onClose={() => {
          setIsSideDrawerOpen(false);
          setSelectedSignalId('');
        }}
        signalId={selectedSignalId}
        handleDelete={deleteToggle}
        userInfo={userinfo?.data}
        fromPage="journey"
      />

      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={'signal'}
      />
    </>
  );
};

export default EngagementLevel;