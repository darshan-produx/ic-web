'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { ProgressDots } from '../components/ProgressDots';
import { ActionButtons } from '../components/ActionButtons';
import { EditablePill, AddButton } from '../components/EditableItems';
import {
  OnboardingCheckSvgIcon,
  OnboardingCloseSvgIcon,
  OnboardingAgentClientDetailsSvgIcon,
} from '../../app/assests/icons/icons';
import {
  useUpdateActivationStepMutation,
  useUpdateProspectiveDomainStakeholders,
  useAddProspectiveDomainStakeholders,
} from '../../services/mutations/agents';

type Stakeholder = { name: string; email: string };
type CustomerType = {
  _id: string;
  customer_name: string;
  prospective_domains?: string[];
  prospective_stakeholders?: Stakeholder[];
  // stakeholders?: Stakeholder[];
  customer_id: number;
  [k: string]: any;
};

interface ReviewStakeholdersProps {
  customers: CustomerType[];
  activation_id: string;
  onBack?: () => void;
  onActivate?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/**
 * Accepts many common input forms:
 * - "Name <email@example.com>"
 * - "email@example.com"
 * - "Name email@example.com"
 *
 * Returns { name, email } or null if no valid email found.
 */
const parseStakeholderInput = (input: string): Stakeholder | null => {
  const raw = (input || '').trim();
  if (!raw) return null;

  // 1) Name <email@example.com>
  const angleMatch = raw.match(/^(.+?)\s*<\s*([^>]+)\s*>$/);
  if (angleMatch) {
    const name = angleMatch[1].trim();
    const email = angleMatch[2].trim();
    if (EMAIL_REGEX.test(email)) {
      return { name: name || email.split('@')[0], email: email.toLowerCase() };
    }
    return null;
  }

  // 2) Find token that looks like an email anywhere in the string
  const emailTokenMatch = raw.match(/([^\s,;<>"]+@[^\s,;<>"]+\.[^\s,;<>"]+)/);
  if (emailTokenMatch) {
    const email = emailTokenMatch[1].trim();
    if (!EMAIL_REGEX.test(email)) return null;
    // Name is everything except email token
    const namePart = raw.replace(emailTokenMatch[0], '').trim();
    const name = namePart || email.split('@')[0];
    return { name, email: email.toLowerCase() };
  }

  // 3) If whole input matches email
  if (EMAIL_REGEX.test(raw)) {
    return { name: raw.split('@')[0], email: raw.toLowerCase() };
  }

  return null;
};

const ReviewStakeholders: React.FC<ReviewStakeholdersProps> = ({
  customers,
  activation_id,
  onBack = () => console.log('Back clicked'),
  onActivate = () => console.log('Activate clicked'),
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Local copy so we don't mutate props directly.
  const [localCustomers, setLocalCustomers] = useState<CustomerType[]>(
    () =>
      customers?.map((c) => ({
        ...c,
        prospective_stakeholders: [
          ...(c.prospective_stakeholders || []).map((s) => ({
            name: s.name ?? s.email?.split?.('@')?.[0] ?? '',
            email: s.email?.toLowerCase() ?? '',
          })),
        ],
      })) || []
  );

  useEffect(() => {
    setLocalCustomers(
      customers?.map((c) => ({
        ...c,
        prospective_stakeholders: [
          ...(c.prospective_stakeholders || []).map((s) => ({
            name: s.name ?? s.email?.split?.('@')?.[0] ?? '',
            email: s.email?.toLowerCase() ?? '',
          })),
        ],
      })) || []
    );
  }, [customers]);

  const [editing, setEditing] = useState<{
    customerId: number;
    stakeholderIndex: number;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [loadingCustomerIds, setLoadingCustomerIds] = useState<
    Record<string, boolean>
  >({});

  const updateMutation = useUpdateProspectiveDomainStakeholders();
  const addProspectiveDomainStakeholders =
    useAddProspectiveDomainStakeholders();
  const updateActivationStep = useUpdateActivationStepMutation();

  const findCustomerIndex = useCallback(
    (customerId: number) =>
      localCustomers.findIndex((c) => c.customer_id === customerId),
    [localCustomers]
  );

  const startAddStakeholder = useCallback(
    (customerId: number) => {
      const idx = findCustomerIndex(customerId);
      if (idx === -1) return;
      setEditing({
        customerId,
        stakeholderIndex:
          localCustomers[idx].prospective_stakeholders?.length ?? 0,
      });
      setEditName('');
      setEditEmail('');
      setEditError(null);
    },
    [findCustomerIndex, localCustomers]
  );

  const startEditStakeholder = useCallback(
    (customerId: number, stakeholderIndex: number) => {
      const idx = findCustomerIndex(customerId);
      if (idx === -1) return;
      const current =
        localCustomers[idx].prospective_stakeholders?.[stakeholderIndex];
      setEditing({ customerId, stakeholderIndex });
      setEditName(current?.name || '');
      setEditEmail(current?.email || '');
      setEditError(null);
    },
    [findCustomerIndex, localCustomers]
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setEditName('');
    setEditEmail('');
    setEditError(null);
  }, []);

  // persist stakeholders with optimistic update + rollback
  // Optimized: Decoupled from localCustomers state to prevent stale closure bugs
  const persistStakeholders = useCallback(
    async (
      customerId: number,
      nextStakeholders: Stakeholder[],
      rollbackState: CustomerType[]
    ) => {
      setLoadingCustomerIds((prev) => ({
        ...prev,
        [customerId]: true,
      }));

      if (updateMutation) {
        try {
          await updateMutation.mutateAsync({
            customer_id: customerId,
            activation_id: activation_id,
            prospective_stakeholders: nextStakeholders,
          });
          // success: do nothing (we already updated local state)
        } catch (err) {
          // rollback to the snapshot provided
          setLocalCustomers(rollbackState);
          console.error('Failed to update stakeholders for', customerId, err);
          window.alert('Failed to save stakeholders. Changes were reverted.');
        } finally {
          setLoadingCustomerIds((prev) => {
            const copy = { ...prev };
            delete copy[customerId];
            return copy;
          });
        }
      } else {
        setLoadingCustomerIds((prev) => {
          const copy = { ...prev };
          delete copy[customerId];
          return copy;
        });
      }
    },
    [updateMutation, activation_id]
  );

  const confirmEdit = useCallback(
    async (customerId: number, stakeholderIndex: number) => {
      setEditError(null);

      const trimmedEmail = (editEmail || '').trim();
      const trimmedName = (editName || '').trim();

      if (!trimmedEmail) {
        setEditError('Email is required');
        return;
      }

      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setEditError('Invalid email (example: user@example.com)');
        return;
      }

      const cIdx = findCustomerIndex(customerId);
      if (cIdx === -1) {
        setEditError('Customer not found');
        return;
      }

      // Capture snapshot BEFORE modification for potential rollback
      const rollbackSnapshot = localCustomers;
      const prevStakeholders =
        localCustomers[cIdx].prospective_stakeholders ?? [];
      const nextStakeholders = [...prevStakeholders];

      // duplicate check by email (case-insensitive)
      const emailLower = trimmedEmail.toLowerCase();
      const finalName = trimmedName || emailLower.split('@')[0];
      const duplicateIndex = nextStakeholders.findIndex(
        (s, i) => s.email.toLowerCase() === emailLower && i !== stakeholderIndex
      );

      if (stakeholderIndex >= nextStakeholders.length) {
        // add
        if (duplicateIndex !== -1) {
          setEditError('Stakeholder with this email already exists');
          return;
        }
        nextStakeholders.push({
          name: finalName,
          email: emailLower,
        });
      } else {
        // edit existing
        const existing = nextStakeholders[stakeholderIndex];
        // no-op if identical
        if (
          existing?.email.toLowerCase() === emailLower &&
          (existing?.name ?? '') === finalName
        ) {
          cancelEdit();
          return;
        }
        if (duplicateIndex !== -1) {
          setEditError('Another stakeholder with same email exists');
          return;
        }
        nextStakeholders[stakeholderIndex] = {
          name: finalName,
          email: emailLower,
        };
      }

      // optimistic update
      const nextCustomers = localCustomers.map((c) =>
        c.customer_id === customerId
          ? { ...c, prospective_stakeholders: nextStakeholders }
          : c
      );
      setLocalCustomers(nextCustomers);
      cancelEdit();

      // persist with rollback snapshot
      await persistStakeholders(customerId, nextStakeholders, rollbackSnapshot);
    },
    [
      cancelEdit,
      findCustomerIndex,
      localCustomers,
      persistStakeholders,
      editName,
      editEmail,
    ]
  );

  const removeStakeholder = useCallback(
    async (customerId: number, stakeholderIndex: number) => {
      const cIdx = findCustomerIndex(customerId);
      if (cIdx === -1) return;

      // Capture snapshot BEFORE modification
      const rollbackSnapshot = localCustomers;
      const prevStakeholders =
        localCustomers[cIdx].prospective_stakeholders ?? [];

      if (stakeholderIndex < 0 || stakeholderIndex >= prevStakeholders.length)
        return;

      const nextStakeholders = prevStakeholders.filter(
        (_, idx) => idx !== stakeholderIndex
      );

      const nextCustomers = localCustomers.map((c) =>
        c.customer_id === customerId
          ? { ...c, prospective_stakeholders: nextStakeholders }
          : c
      );

      setLocalCustomers(nextCustomers);

      if (
        editing?.customerId === customerId &&
        editing.stakeholderIndex === stakeholderIndex
      ) {
        cancelEdit();
      }

      await persistStakeholders(customerId, nextStakeholders, rollbackSnapshot);
    },
    [
      cancelEdit,
      editing,
      findCustomerIndex,
      localCustomers,
      persistStakeholders,
    ]
  );

  // memoize render data with search and sorting
  const displayCustomers = useMemo(() => {
    // Filter by search query
    const filtered = localCustomers.filter((customer) => {
      if (!searchQuery.trim()) return true;
      return customer.customer_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });

    // Sort: customers with stakeholders at the top
    return filtered.sort((a, b) => {
      const aHasStakeholders = (a.prospective_stakeholders?.length ?? 0) > 0;
      const bHasStakeholders = (b.prospective_stakeholders?.length ?? 0) > 0;
      
      if (aHasStakeholders && !bHasStakeholders) return -1;
      if (!aHasStakeholders && bHasStakeholders) return 1;
      return 0;
    });
  }, [localCustomers, searchQuery]);

  const onActivateCallback = useCallback(async () => {
    try {
      await updateActivationStep.mutateAsync({
        activation_id,
        action: 'next',
      });
      await addProspectiveDomainStakeholders.mutateAsync(activation_id);
    } catch (err) {
      console.error('Failed to add prospective domain stakeholders:', err);
      return;
    }
  }, [addProspectiveDomainStakeholders, activation_id, updateActivationStep]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFE]">
      {/* Four-color gradient blobs */}
      <div className="absolute inset-0">
        {/* Top Left - Blue */}
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#BBDEFB] rounded-full blur-[180px] opacity-50"></div>
        {/* Top Right - Magenta/Pink */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#F8BBD0] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Left - Yellow-Green */}
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#C5E1A5] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Right - Mint Green */}
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#B2DFDB] rounded-full blur-[180px] opacity-50"></div>
      </div>

      {/* Content container - Centered card */}
      <div className="relative flex flex-col items-center justify-start min-h-screen px-8 pt-16 pb-12">
        {/* Agent positioned above card - centered */}
        <div className="w-[770px] flex items-center justify-center px-6 mb-6">
          {/* Agent - Centered */}
          <div className="w-12 h-10">
            <OnboardingAgentClientDetailsSvgIcon />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[32px] p-10 w-[770px] relative border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              I have found your customer stakeholders
            </h1>
            <ProgressDots totalSteps={3} currentStep={2} />
          </div>

          {/* Stakeholders Section - Outer container with border */}
          <div className="mb-8 rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Stakeholders identified
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers"
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Inner container for Customer and Stakeholders table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 border-b border-r border-gray-200 p-3 w-[140px]">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 border-b border-gray-200 p-3">
                      Stakeholders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayCustomers.map((customer: CustomerType, customerIndex: number) => {
                    const stakeholders =
                      customer.prospective_stakeholders ?? [];
                    // const isLoading = !!loadingCustomerIds[customer.customer_id];
                    const isLastRow = customerIndex === displayCustomers.length - 1;
                    return (
                      <tr key={customer._id}>
                        <td className={`text-sm text-gray-900 align-middle font-normal p-3 border-r border-gray-200 ${!isLastRow ? 'border-b border-gray-100' : ''}`}>
                          {customer.customer_name ?? '—'}
                        </td>
                        <td className={`p-3 ${!isLastRow ? 'border-b border-gray-100' : ''} overflow-hidden`}>
                            <div className="flex flex-col gap-2 items-start w-full">
                              <div className="flex flex-wrap gap-2 items-center w-full">
                                {Array.isArray(stakeholders) &&
                                  stakeholders.map((s, idx) => (
                                    <EditablePill
                                      key={`${customer._id}-${s.email}-${idx}`}
                                      value={`${s.name} (${s.email})`}
                                      onRemove={() =>
                                        removeStakeholder(
                                          customer.customer_id,
                                          idx
                                        )
                                      }
                                      // optional: onEdit(() => startEditStakeholder(customer.customer_id, idx))
                                    />
                                  ))}

                                {/* show add button if not editing a different stakeholder for this customer */}
                                {!(
                                  editing &&
                                  editing.customerId === customer.customer_id &&
                                  editing?.stakeholderIndex !==
                                    stakeholders.length
                                ) && (
                                  <AddButton
                                    onClick={() =>
                                      startAddStakeholder(customer.customer_id)
                                    }
                                  />
                                )}
                              </div>

                              {/* Inline editor: add or edit */}
                              {editing?.customerId === customer.customer_id && (
                                <div className="flex flex-col gap-1 w-full max-w-full">
                                  <div className="flex items-center gap-3 w-full max-w-full">
                                    <div
                                      className={`flex items-stretch border rounded-lg bg-white overflow-hidden flex-1 min-w-0 h-[29px] ${
                                        editError
                                          ? 'border-red-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => {
                                          setEditName(e.target.value);
                                          setEditError(null);
                                        }}
                                        placeholder="Enter name"
                                        className="outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent pl-3 pr-3 py-1.5 flex-1 min-w-0 border-r border-gray-300"
                                        autoFocus
                                      />
                                      <input
                                        type="text"
                                        value={editEmail}
                                        onChange={(e) => {
                                          setEditEmail(e.target.value);
                                          setEditError(null);
                                        }}
                                        placeholder="Enter email address"
                                        className="outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent pl-3 pr-3 py-1.5 flex-1 min-w-0"
                                      />
                                    </div>
                                    <button
                                      onClick={() =>
                                        confirmEdit(
                                          customer.customer_id,
                                          editing.stakeholderIndex
                                        )
                                      }
                                      className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                                      disabled={
                                        !!loadingCustomerIds[
                                          customer.customer_id
                                        ]
                                      }
                                    >
                                      <div className="w-5 h-5">
                                        <OnboardingCheckSvgIcon />
                                      </div>
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                                    >
                                      <div className="w-5 h-5">
                                        <OnboardingCloseSvgIcon />
                                      </div>
                                    </button>
                                  </div>
                                  {/* Error message below input */}
                                  {editError && (
                                    <div className="text-xs text-red-600">
                                      {editError}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ActionButtons
            onBack={onBack}
            onContinue={onActivateCallback}
            backLabel="Back"
            continueLabel="Activate"
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewStakeholders;