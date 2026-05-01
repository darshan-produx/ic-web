'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgressDots } from '../components/ProgressDots';
import { ActionButtons } from '../components/ActionButtons';
import { EditablePill, AddButton } from '../components/EditableItems';
import { useUpdateProspectiveDomainStakeholders } from '../../services/mutations/agents';
import { OnboardingCheckSvgIcon, OnboardingCloseSvgIcon, OnboardingAgentClientDetailsSvgIcon } from '../../app/assests/icons/icons';

type CustomerType = {
  _id: string;
  customer_name: string;
  prospective_domains?: string[];
  customer_id: number;
  // approved_domains?: string[];
  [k: string]: any;
};

interface ReviewDomainsProps {
  customers: CustomerType[];
  activation_id: string;
  onBack?: () => void;
  onNext?: () => void;
}

const DOMAIN_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

const validateDomain = (d: string) => {
  const trimmed = d.trim().toLowerCase();
  return DOMAIN_REGEX.test(trimmed) ? trimmed : null;
};

const ReviewDomains: React.FC<ReviewDomainsProps> = ({
  customers,
  activation_id,
  onBack = () => console.log('Back clicked'),
  onNext = () => console.log('Next clicked'),
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localCustomers, setLocalCustomers] = useState<CustomerType[]>(
    () =>
      customers?.map((c) => ({
        ...c,
        prospective_domains: [
          ...(c.prospective_domains || []),
          // ...(c.approved_domains || []),
        ],
      })) || []
  );
  useEffect(() => {
    setLocalCustomers(
      customers?.map((c) => ({
        ...c,
        prospective_domains: [
          ...(c.prospective_domains || []),
          // ...(c.approved_domains || []),
        ],
      })) || []
    );
  }, [customers]);
  const [editing, setEditing] = useState<{
    customerId: number | null;
    domainIndex: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [loadingCustomerIds, setLoadingCustomerIds] = useState<
    Record<string, boolean>
  >({});

  const setCustomersAndNotify = useCallback(
    (next: CustomerType[]) => {
      setLocalCustomers(next);
    },
    [setLocalCustomers]
  );

  // helper to find customer index in localCustomers by id
  const findCustomerIndex = useCallback(
    (customerId: number) =>
      localCustomers.findIndex((c) => c.customer_id === customerId),
    [localCustomers]
  );

  const startAddDomain = useCallback(
    (customerId: number) => {
      const idx = findCustomerIndex(customerId);
      if (idx === -1) return;
      // set editing for new domain (index = current length)
      setEditing({
        customerId,
        domainIndex: localCustomers[idx].prospective_domains?.length ?? 0,
      });
      setEditValue('');
      setEditError(null);
    },
    [findCustomerIndex, localCustomers]
  );

  const startEditDomain = useCallback(
    (customerId: number, domainIndex: number) => {
      const idx = findCustomerIndex(customerId);
      if (idx === -1) return;
      const current =
        localCustomers[idx].prospective_domains?.[domainIndex] ?? '';
      setEditing({ customerId, domainIndex });
      setEditValue(current);
      setEditError(null);
    },
    [findCustomerIndex, localCustomers]
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setEditValue('');
    setEditError(null);
  }, []);

  const updateDomains = useUpdateProspectiveDomainStakeholders();

  // internal function to persist domains for one customer with optimistic update + rollback
  // now accepts an optional prevCustomers snapshot for correct rollback
  const persistDomains = useCallback(
    async (
      customerId: number,
      nextDomains: string[],
      prevSnapshot?: CustomerType[]
    ) => {
      // optimistic: set loading
      setLoadingCustomerIds((prev) => ({
        ...prev,
        [customerId]: true,
      }));

      if (updateDomains) {
        try {
          await updateDomains.mutateAsync({
            customer_id: customerId,
            activation_id: activation_id,
            prospective_domains: nextDomains,
          });
          // success: nothing else needed because local state already updated by caller
        } catch (err) {
          // rollback local state using provided snapshot if available
          if (prevSnapshot) {
            setCustomersAndNotify(prevSnapshot);
          } else {
            console.error(
              'No previous snapshot available to rollback for',
              customerId
            );
          }
          console.error('Failed to update domains for', customerId, err);
        } finally {
          setLoadingCustomerIds((prev) => {
            const copy = { ...prev };
            delete copy[String(customerId)];
            return copy;
          });
        }
      } else {
        // no server mutation provided - just clear loading
        setLoadingCustomerIds((prev) => {
          const copy = { ...prev };
          delete copy[String(customerId)];
          return copy;
        });
      }
    },
    [updateDomains, activation_id, setCustomersAndNotify]
  );

  const confirmEdit = useCallback(
    async (customerId: number, domainIndex: number) => {
      setEditError(null);
      const normalized = validateDomain(editValue || '');
      if (!normalized) {
        setEditError('Invalid domain (example: example.com)');
        return;
      }

      const cIdx = findCustomerIndex(customerId);
      if (cIdx === -1) {
        setEditError('Customer not found');
        return;
      }

      const prevDomains = localCustomers[cIdx].prospective_domains ?? [];
      // create a new domains array immutably
      const nextDomains = [...prevDomains];

      if (domainIndex >= nextDomains.length) {
        // add case
        // dedupe case-insensitive
        if (
          nextDomains.some((d) => d.toLowerCase() === normalized.toLowerCase())
        ) {
          setEditError('Domain already exists');
          return;
        }
        nextDomains.push(normalized);
      } else {
        // edit existing
        // if same value, no-op
        if (nextDomains[domainIndex] === normalized) {
          cancelEdit();
          return;
        }
        // dedupe check (allow replacing same index)
        if (
          nextDomains.some(
            (d, i) =>
              i !== domainIndex && d.toLowerCase() === normalized.toLowerCase()
          )
        ) {
          setEditError('Another domain with same value exists');
          return;
        }
        nextDomains[domainIndex] = normalized;
      }

      // build prevCustomers snapshot BEFORE applying optimistic update
      const prevCustomers = localCustomers.map((c) => ({
        ...c,
        prospective_domains: [...(c.prospective_domains || [])],
      }));

      // apply optimistic update locally
      const nextCustomers = localCustomers.map((c) =>
        c.customer_id === customerId
          ? { ...c, prospective_domains: nextDomains }
          : c
      );
      setCustomersAndNotify(nextCustomers);
      cancelEdit();

      // persist with correct prev snapshot for rollback
      await persistDomains(customerId, nextDomains, prevCustomers);
    },
    [
      cancelEdit,
      findCustomerIndex,
      localCustomers,
      persistDomains,
      setCustomersAndNotify,
      editValue,
    ]
  );

  const removeDomain = useCallback(
    async (customerId: number, domainIndex: number) => {
      const cIdx = findCustomerIndex(customerId);
      if (cIdx === -1) return;
      const prevDomains = localCustomers[cIdx].prospective_domains ?? [];

      if (domainIndex < 0 || domainIndex >= prevDomains.length) return;

      // build new domains array using filter (do not mutate)
      const nextDomains = prevDomains.filter((_, idx) => idx !== domainIndex);

      // optimistic update: capture previous snapshot for rollback
      const prevCustomers = localCustomers.map((c) => ({
        ...c,
        prospective_domains: [...(c.prospective_domains || [])],
      }));
      const nextCustomers = localCustomers.map((c) =>
        c.customer_id === customerId
          ? { ...c, prospective_domains: nextDomains }
          : c
      );

      setCustomersAndNotify(nextCustomers);

      // if we were editing that exact item, cancel edit
      if (
        editing?.customerId === customerId &&
        editing.domainIndex === domainIndex
      ) {
        cancelEdit();
      }

      // persist and provide prev snapshot for rollback
      await persistDomains(customerId, nextDomains, prevCustomers);
      // if persist failed, persistDomains handles rollback
    },
    [
      cancelEdit,
      editing,
      findCustomerIndex,
      localCustomers,
      persistDomains,
      setCustomersAndNotify,
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

    // Sort: customers with domains at the top
    return filtered.sort((a, b) => {
      const aHasDomains = (a.prospective_domains?.length ?? 0) > 0;
      const bHasDomains = (b.prospective_domains?.length ?? 0) > 0;
      
      if (aHasDomains && !bHasDomains) return -1;
      if (!aHasDomains && bHasDomains) return 1;
      return 0;
    });
  }, [localCustomers, searchQuery]);

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
              I have found your customer email domains
            </h1>
            <p className="font-inter font-normal text-sm leading-5 text-gray-600 mb-4">
            Please verify the domains I have found, and add the ones I might have missed
          </p>
            <ProgressDots totalSteps={3} currentStep={1} />
            
          </div>

          {/* Domains Section - Outer container with border */}
          <div className="mb-8 rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Domains identified
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers"
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Inner container for Customer and Domains table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 border-b border-r border-gray-200 p-3 w-[140px]">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 border-b border-gray-200 p-3">
                      Domains
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayCustomers.map((customer, customerIndex) => {
                    const domains = customer.prospective_domains ?? [];
                    const isLoading =
                      !!loadingCustomerIds[String(customer.customer_id)];
                    const isLastRow = customerIndex === displayCustomers.length - 1;
                    return (
                      <tr key={customer._id}>
                        <td className={`text-sm text-gray-900 align-middle font-normal p-3 border-r border-gray-200 ${!isLastRow ? 'border-b border-gray-100' : ''}`}>
                          {customer.customer_name ?? '—'}
                        </td>
                        <td className={`p-3 ${!isLastRow ? 'border-b border-gray-100' : ''}`}>
                          <div className="flex flex-col gap-2 items-start">
                            <div className="flex flex-wrap gap-2 items-center">
                              {Array.isArray(domains) &&
                                domains.map((domain, idx) => (
                                  <EditablePill
                                    key={`${customer._id}-${domain}-${idx}`}
                                    value={domain}
                                    onRemove={() =>
                                      removeDomain(customer.customer_id, idx)
                                    }
                                  />
                                ))}

                              {/* show add button only if not currently editing a domain for this customer */}
                              {!(
                                editing &&
                                editing.customerId === customer.customer_id
                              ) && (
                                <AddButton
                                  onClick={() =>
                                    startAddDomain(customer.customer_id)
                                  }
                                />
                              )}
                            </div>

                            {/* Inline editor for either adding new domain or editing existing */}
                            {editing?.customerId === customer.customer_id && (
                              <div className="flex flex-col gap-1">
                                <div
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-full bg-gray-50 ${
                                    editError
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  <span className="text-sm text-gray-500">@</span>
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => {
                                      setEditValue(e.target.value);
                                      setEditError(null);
                                    }}
                                    placeholder="domain.com"
                                    className="outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent w-28"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() =>
                                      confirmEdit(
                                        customer.customer_id,
                                        editing.domainIndex
                                      )
                                    }
                                    className="text-gray-500 hover:text-gray-700"
                                    disabled={
                                      !!loadingCustomerIds[
                                        String(customer.customer_id)
                                      ]
                                    }
                                  >
                                    <div className="w-3.5 h-3.5">
                                      <OnboardingCheckSvgIcon />
                                    </div>
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <div className="w-3.5 h-3.5">
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
            onContinue={onNext}
            backLabel="Back"
            continueLabel="Next"
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewDomains;