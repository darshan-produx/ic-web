
import Modal from '../../../../../common/components/Modal';
import Flatpickr from 'react-flatpickr';
import { useState, useEffect, useMemo, use } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllAssignedCustomers, getOpportunityFeatureConfig } from '../../../../api/customers/customers';
import { Calendar } from 'lucide-react';
import { RenderDropdown } from './renderDropdown';
import {
  getAllOpportunities,
  getOpportunityStatusConfig,
} from '../../../../api/insights/insights';
import { Dropdown } from '../../../../../common/Dropdown';
import { ChevronUp } from 'lucide-react';
import { useCreateOpportunity } from '../../../../../services/mutations/insightMutations';
import { toast } from 'react-toastify';
import { getCurrencySymbol } from '../../../../api/config/insight';
import AssignTo from '../../../../../common/components/AssignTo';
import { getOpportunityAttributeConfig } from '../../../../../app/api/insights/opportunities';
import MultiSelectDropDown from '../../../../../common/components/MultiSelectDropDown';
import SingleSelectDropDown from '../../../../../common/components/SingleSelectDropDown';
import AddProspectCustomerModal from './addProspectCustomerModal';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

export default function CreateOpportunityModal({
  createOpportunityModal,
  setCreateOpportunityModal,
  customerId,
  allowAddProspect = true,
}: any) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityValue, setOpportunityValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setdate] = useState<Date | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedOpportunityType, setSelectedOpportunityType] =
    useState<any>(null);
  const [selectedOpportunityUseCase, setSelectedOpportunityUseCase] =
    useState<any>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [assignTo, setAssignTo] = useState<string | null>(null);
  const [checkboxProducts, setCheckboxProducts] = useState<any[]>([]);
  const [customersArray, setCustomersArray] = useState<any[]>([]);
  const [opportunityTypesArray, setOpportunityTypesArray] = useState<any[]>([]);
  const [useCasesArray, setUseCasesArray] = useState<any[]>([]);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [showProspectModal, setShowProspectModal] = useState(false);
  const createOpportunity = useCreateOpportunity();
  const queryClient = useQueryClient();

  const { data: allAssignedCustomers } = useQuery({
    queryKey: ['getAllAssignedCustomers'],
    queryFn: () => getAllAssignedCustomers(),
    refetchOnWindowFocus: false,
  });

  const { data: opportunityFeatureConfig } = useQuery({
    queryKey: ['getOpportunityFeatureConfig'],
    queryFn: () => getOpportunityFeatureConfig(),
    refetchOnWindowFocus: false,
  });

  const { data: allOpportunities } = useQuery({
    queryKey: ['getAllOpportunities'],
    queryFn: () => getAllOpportunities(),
    refetchOnWindowFocus: false,
  });
  const { data: currencySymbol } = useQuery({
    queryKey: ['getCurrencySymbol'],
    queryFn: () => getCurrencySymbol(),
    refetchOnWindowFocus: false,
  });

  const { data: opportunityStatusesFromConfig } = useQuery({
    queryKey: ['getOpportunityStatusConfig'],
    queryFn: () => getOpportunityStatusConfig(),
    refetchOnWindowFocus: false,
  });

  const opportunityAttributeConfig = useQuery({
    queryKey: ['opportunityAttributeConfig'],
    queryFn: () => getOpportunityAttributeConfig(),
    refetchOnWindowFocus: false,
  });
  const [opportunityStatuses, setOpportunityStatuses] = useState<any[]>([]);

  const productObj = useMemo(() => {
    const attributes = opportunityAttributeConfig?.data?.data?.data || [];

    const productAttribute = attributes.find(
      (attribute: any) => attribute.data_type === "list" && attribute.name?.toLowerCase() === "product"
    );

    if (!productAttribute) return {};

    return {
      attribute_id: productAttribute._id,
      data_type: productAttribute.data_type,
      attributes_lists:
        productAttribute.list_options?.map((option: string, index: number) => ({
          id: index,
          name: option,
          value: option,
          selected: false,
        })) || [],
    };
  }, [opportunityAttributeConfig?.data?.data?.data]);
  useEffect(() => {
    setCheckboxProducts(productObj?.attributes_lists || []);
  }, [productObj]);

  useEffect(() => {
    if (allAssignedCustomers?.data) {
      const uniqueCustomers = allAssignedCustomers.data.reduce(
        (acc: any[], current: any) => {
          const exists = acc.find(
            (item: any) => item.customer_name === current.customer_name
          );
          if (!exists) {
            acc.push({
              customer_id: current.customer_id,
              customer_name: current.customer_name,
              is_prospect: Boolean(current.is_prospect),
              selected: false,
            });
          }
          return acc;
        },
        []
      );
      setCustomersArray(uniqueCustomers);
    }
  }, [allAssignedCustomers]);

  useEffect(() => {
    if (allOpportunities?.data) {
      const opportunityList = allOpportunities.data.map((item: any) => ({
        insight_id: item.insight_id,
        insight_name: item.insight_name,
        insight_type: item.insight_type,
        data_type: item.data_type,
        pillar: item.pillar,
        usecase_details: item.usecase_details || [],
        selected: false,
      }));
      setOpportunityTypesArray(opportunityList);
    }
  }, [allOpportunities]);

  useEffect(() => {
    if (selectedOpportunityType?.usecase_details) {
      const useCaseList = selectedOpportunityType.usecase_details.map((item: any) => ({
        usecase_id: item.usecase_id || item.id,
        name: item.name,
        title: item.title,
        description: item.description,
        selected: false,
      }));
      setUseCasesArray(useCaseList);
    } else {
      setUseCasesArray([]);
    }
  }, [selectedOpportunityType]);
  useEffect(() => {
    const rawStatuses = opportunityStatusesFromConfig?.data?.value;
    if (rawStatuses) {
      const flattened: any[] = [];
      Object.entries(rawStatuses as Record<string, string[]>).forEach(
        ([key, values]) => {
          values.forEach((subStatus: string) => {
            flattened.push({
              label: subStatus,
              value: subStatus,
              statusGroup: key,
            });
          });
        }
      );
      setOpportunityStatuses(flattened);

      // Set default status to first available status
      if (flattened.length > 0 && !selectedStatus) {
        setSelectedStatus(flattened[0]);
      }
    }
  }, [opportunityStatusesFromConfig, selectedStatus]);

  useEffect(() => {
    if (customerId && customersArray.length > 0) {
      const customer = customersArray.find(
        (c: any) => c.customer_id === customerId
      );
      if (customer) {
        handleCustomerSelection(customer);
      }
    }
  }, [customerId, customersArray]);

  // Auto-populate title and description when usecase is selected
  useEffect(() => {
    if (selectedOpportunityUseCase?.name) {
      setTitle(
        selectedOpportunityUseCase.name ||
        selectedOpportunityUseCase.title ||
        ''
      );
    }
    if (selectedOpportunityUseCase?.description) {
      setDescription(selectedOpportunityUseCase.description || '');
    }
  }, [selectedOpportunityUseCase]);

  const handleDateChange = (selectedDates: Date[]) => {
    setdate(selectedDates[0]);
  };

  const handleCustomerSelection = (customer: any) => {
    setCustomersArray(prev => prev.map(c => ({
      ...c,
      selected: c.customer_id === customer.customer_id
    })));
    setSelectedCustomer({
      name: customer.customer_name,
      id: customer.customer_id,
    });
  };

  const handleOpportunityTypeSelection = (opportunity: any) => {
    setOpportunityTypesArray(prev => prev.map(o => ({
      ...o,
      selected: o.insight_id === opportunity.insight_id
    })));
    setSelectedOpportunityType({
      insight_id: opportunity.insight_id,
      insight_name: opportunity.insight_name,
      insight_type: opportunity.insight_type,
      data_type: opportunity.data_type,
      pillar: opportunity.pillar,
      usecase_details: opportunity.usecase_details || [],
      name: opportunity.insight_name,
    });
    // Reset use case when opportunity type changes
    setSelectedOpportunityUseCase(null);
  };

  const handleUseCaseSelection = (useCase: any) => {
    setUseCasesArray(prev => prev.map(u => ({
      ...u,
      selected: u.usecase_id === useCase.usecase_id
    })));
    setSelectedOpportunityUseCase({
      name: useCase.name,
      id: useCase.usecase_id,
      title: useCase.title,
      description: useCase.description,
    });
  };

  const handleClearUseCase = () => {
    setUseCasesArray(prev => prev.map(u => ({ ...u, selected: false })));
    setSelectedOpportunityUseCase(null);
  };

  const handleStatusSelect = (status: any) => {
    setSelectedStatus(status);
    setStatusDropdownOpen(false);
  };

  const handleProspectCustomerCreated = async (customer: any) => {
    // Invalidate and refetch all customer-related queries
    await queryClient.invalidateQueries({ queryKey: ['getAllAssignedCustomers'] });
    await queryClient.invalidateQueries({ queryKey: ['organizationCustomersHierarchy'] });
    
    setSelectedCustomer({
      name: customer.customer_name,
      id: customer.customer_id,
    });
  };

  const validateForm = () => {
    // Check required fields
    if (!selectedCustomer?.name || !selectedCustomer?.id) {
      toast.error('Please select a customer');
      return false;
    }

    if (
      !selectedOpportunityType?.insight_name ||
      !selectedOpportunityType?.insight_id
    ) {
      toast.error('Please select an opportunity type');
      return false;
    }

    if (!title?.trim()) {
      toast.error('Please enter a title');
      return false;
    }

    if (!selectedStatus?.statusGroup || !selectedStatus?.value) {
      toast.error('Please select a status');
      return false;
    }
    if (checkboxProducts.length > 0 && !checkboxProducts.some(item => item.selected)) {
      toast.error('Please select a product');
      return false;
    }
    return true;
  };

  const onSubmitHandler = async () => {
    // e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      insight_id: parseInt(selectedOpportunityType.insight_id),
      insight_name: String(
        selectedOpportunityType.insight_name ||
        selectedOpportunityType.name ||
        ''
      ),
      title: String(title?.trim() || ''),
      insight_type: 'Opportunity',
      customer_id: parseInt(selectedCustomer.id),
      customer_name: String(selectedCustomer.name || ''),
      pillar: 'Expansion',
      description: description?.trim() ? String(description.trim()) : undefined,
      action_status: String(selectedStatus.statusGroup || ''),
      action_sub_status: String(selectedStatus.value || ''),
      insight_data_type: 'llm',
      status: "green",
      alerted_at: new Date().toISOString(),
    };

    // Add optional fields only if they have values
    if (opportunityValue?.trim()) {
      payload.opportunity_value = parseInt(String(opportunityValue).replace(/\D/g, ''));
    }
    if (date) {
      payload.target_closure_date = new Date(date).toISOString();
    }
    if (selectedOpportunityUseCase?.name) {
      payload.usecase = String(selectedOpportunityUseCase.name);
    }
    if (selectedOpportunityUseCase?.id) {
      payload.usecase_id = parseInt(selectedOpportunityUseCase.id);
    }
    if (assignTo) {
      payload.assignee_id = assignTo;
    }
    if (productObj?.attribute_id) {
      payload.attribute_id = productObj.attribute_id;
      payload.attribute_date_type = productObj.data_type;
      const selectedProducts = checkboxProducts.filter((item: any) => item.selected).map((item: any) => item.value);
      if (selectedProducts.length > 0) {
        payload.attribute_value = selectedProducts;
      }
    }

    try {
      const response = await createOpportunity.mutateAsync(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Opportunity created successfully!');
        resetForm();
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (err: any) {
      toast.error(
        `Error creating opportunity: ${err?.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOpportunityValue('');
    setdate(null);
    setSelectedCustomer(null);
    setSelectedOpportunityType(null);
    setSelectedOpportunityUseCase(null);
    setSelectedStatus(null);
    setCustomersArray(prev => prev.map(c => ({ ...c, selected: false })));
    setOpportunityTypesArray(prev => prev.map(o => ({ ...o, selected: false })));
    setUseCasesArray(prev => prev.map(u => ({ ...u, selected: false })));
    setCreateOpportunityModal(false);
  };
  const isDirty =
    selectedCustomer && selectedOpportunityType && title && selectedStatus &&
    checkboxProducts.some(item => item.selected);
  return (
    <>
    <div className="p-2">
      <Modal
        show={createOpportunityModal}
        onHide={() => setCreateOpportunityModal(false)}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[550px] overflow-hidden bg-white shadow rounded-[12px] dark:bg-zink-600"
      >
        <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_150px)] pt-[16px] px-[24px] overflow-y-auto overflow-x-hidden">
          <div className="text-[#202B37 text-[16px] py-[8px]">
            Create opportunity
          </div>
          <div className="my-[6px]">
            <div className="border rounded-[10px] border-[#CED2DA]">
              <div className="border-b border-[#E4E7EC]">
                <SingleSelectDropDown
                  filteredArr={customersArray.filter((c: any) => 
                    c.customer_name?.toLowerCase().includes(customerSearchText.toLowerCase())
                  )}
                  dataFieldToUseForSelection="customer_name"
                  uniqueIdFieldToUseForSelection="customer_id"
                  wantToShowSearchBox={true}
                  setSearchText={setCustomerSearchText}
                  typeOfData={selectedCustomer?.name || 'Select customer*'}
                  handleSelection={handleCustomerSelection}
                  triggerTextCss={`h-[44px] !border-0 rounded-t-[10px] !text-left ${!!selectedCustomer ? 'text-[#202B37] text-[14px] font-[500]' : 'text-[#637083] text-[14px] !font-[400]'}`}
                  contentCss="w-full top-0"
                  customAction={
                    allowAddProspect && opportunityFeatureConfig?.data?.value?.allow_add_prospect
                      ? {
                          label: 'Add new prospect',
                          onClick: () => setShowProspectModal(true)
                        }
                      : undefined
                  }
                />
              </div>
              <div className={selectedOpportunityType?.insight_name ? 'border-b border-[#E4E7EC]' : ''}>
                <SingleSelectDropDown
                  filteredArr={opportunityTypesArray}
                  dataFieldToUseForSelection="insight_name"
                  uniqueIdFieldToUseForSelection="insight_id"
                  wantToShowSearchBox={false}
                  typeOfData={selectedOpportunityType?.insight_name || 'Select opportunity type*'}
                  handleSelection={handleOpportunityTypeSelection}
                  triggerTextCss={`h-[44px] !border-0 !text-left ${!!selectedOpportunityType ? 'rounded-b-[10px] text-[#202B37] text-[14px] font-[500]' : 'text-[#637083] text-[14px] !font-[400]'}`}
                  contentCss="w-full top-0"
                  // isSelected={!!selectedOpportunityType}
                />
              </div>
              {selectedOpportunityType?.usecase_details && (
                <div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <SingleSelectDropDown
                        filteredArr={useCasesArray}
                        dataFieldToUseForSelection="name"
                        uniqueIdFieldToUseForSelection="usecase_id"
                        wantToShowSearchBox={false}
                        typeOfData={selectedOpportunityUseCase?.name || 'Select Use Case'}
                        handleSelection={handleUseCaseSelection}
                        triggerTextCss={`h-[44px] !border-0 rounded-b-[10px] !text-left ${!!selectedOpportunityUseCase ? 'text-[#202B37] text-[14px] font-[500]' : 'text-[#637083] text-[14px] !font-[400]'}`}
                        contentCss="w-full top-0"
                      />
                    </div>
                    {selectedOpportunityUseCase && (
                      <button
                        type="button"
                        onClick={handleClearUseCase}
                        className="px-3 py-2 text-[#202B37] hover:text-red-600 text-[14px] font-semibold"
                        aria-label="Clear use case selection"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full min-h-[68px] h-content pb-[16px]">
            <MultiSelectDropDown
              filteredItems={checkboxProducts || []}
              dataFieldToUseForSelection="name"
              extraDataFieldToUseForSelection=""
              uniqueIdFieldToUseForSelection="value"
              checkboxItems={checkboxProducts}
              setCheckboxItems={setCheckboxProducts}
              typeOfData="Products*"
              wantToShowSearchBox={false}
              // setSearchText={setUserSearchTextAssignedTo}
              wantToShowSelectedItems={true}
              dropDownContentCss="w-full"
              triggerTextCss="min-h-8 text-[14px] text-[#637083] font-[400]"
              chevronIconCss="left-[0px]"
            />
          </div>
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="">
                <span className="text-[14px] font-medium text-[#344051]">
                  Title*
                </span>{' '}
              </label>
              <div className="flex border border-[#CED2DA] rounded-[8px] overflow-hidden items-center justify-between">
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a opportunity title"
                  className="py-[8px] px-[12px] w-full text-[#141C24] text-[16px] font-normal leading-6 outline-none bg-white placeholder:text-[16px] placeholder:text-[#637083] placeholder:font-normal"
                />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="inline-block text-base font-medium text-[#344051]">
                Description
              </span>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={
                  'form-input border-[#CED2DA] text-[#141C24] text-[16px] rounded-[8px] dark:border-zink-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-[#637083] dark:placeholder:text-zink-200 overflow-auto scroll whitespace-pre-wrap outline-none'
                }
                placeholder="Enter description"
              />
            </div>
            <div className="flex gap-[12px]">
              <div className="flex flex-col gap-[6px] flex-1">
                <label htmlFor="">
                  <span className="text-[14px] font-medium text-[#344051]">
                    Opportunity value
                  </span>{' '}
                </label>
                <div className="flex border border-[#CED2DA] rounded-[10px] overflow-hidden items-center justify-between">
                  <input
                    type="number"
                    inputMode="numeric"
                    name="opportunity_value"
                    value={opportunityValue}
                    onChange={(e) => setOpportunityValue(e.target.value)}
                    placeholder={`${currencySymbol?.data?.value || ''
                      } Enter value`}
                    className="py-[8px] px-[12px] w-full text-[#141C24] text-[16px] font-normal outline-none bg-white placeholder:text-[16px] placeholder:text-[#637083] placeholder:font-[400] no-spinner"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[6px] pb-[18px] flex-1">
                <label htmlFor="">
                  <span className="text-[14px] font-medium text-[#344051]">
                    Targeted closure date
                  </span>{' '}
                </label>
                <div className="flex border px-[12px] border-[#CED2DA] rounded-[10px] overflow-hidden items-center justify-between">
                  <Calendar className="h-4 w-4 text-[#637083] flex-shrink-0" />{' '}
                  <span className="py-[8px] px-[4px]">
                    <Flatpickr
                      options={{
                        dateFormat: 'M d, Y',
                      }}
                      onChange={handleDateChange}
                      value={date ?? ''}
                      placeholder={`Select date`}
                      className={`form-input !text-[16px] !m-0 p-0 border-none !font-[400] w-[100%] !text-[#141C24]  placeholder:text-[16px] placeholder:text-[#637083] dark:border-zinc-500  focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 dark:placeholder:text-zinc-200 flatpickr-input1`}
                    />
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-[6px] pt-[2.3px] flex-1'>
                <span className='text-[14px] font-medium text-[#344051]'>Assigned to</span>
                <AssignTo
                  value={assignTo}
                  setValue={setAssignTo}
                  placeholder="Assign to"
                  disabled={false}
                // border="border-0"
                // dropdown="top-5"
                // userIcon="text-[#637083] h-3 w-3"
                // text="w-full text-[12px] font-[400] placeholder:text-[12px] placeholder:text-[#637083]"
                />
              </div>

            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-between items-center h-[80px] border-t-[1px] border-[#E4E7EC]">
            <div className="flex-col justify-start items-start px-[20px]">
              <div className="text-[12px] text-[#97A1AF] mb-1">Stage</div>
              <div className="flex justify-start items-center h-[20px] text-[14px] text-[#141C24]">
                <div className="items-center flex w-full">
                  <Dropdown className="inline-flex !w-full">
                    <Dropdown.Trigger
                      type="button"
                      className="text-start flex justify-center items-center bg-transparent text-gray-900"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                    >
                      <div
                        className="relative flex items-center justify-center max-w-[300px] cursor-pointer text-nowrap truncate"
                        onClick={() => {
                          setStatusDropdownOpen(true);
                        }}
                      >
                        <span className="text-[16px] text-[#344051] font-normal max-w-[260px] truncate">
                          {selectedStatus?.label || 'Select status'}
                        </span>
                        <ChevronUp className="w-5 h-5 ml-1 rotate-180" />
                      </div>
                    </Dropdown.Trigger>
                    {statusDropdownOpen && (
                      <Dropdown.Content
                        placement="bottom-middle-start"
                        className={
                          'absolute max-h-[400px] overflow-y-auto scroll border border-[#CED2DA] shadow-md z-100 p-4 ltr:text-left rtl:text-right bg-white rounded-md dropdown-menu w-fit dark:bg-zink-600 bottom-0'
                        }
                        aria-labelledby="dropdownMenuButton"
                      >
                        <ul
                          className="text-sm text-gray-700 dark:text-gray-200 dropdownClick space-y-2"
                          aria-labelledby="dropdownMenuIconButton"
                        >
                          {opportunityStatuses.map((item, i) => (
                            <li key={i}>
                              <div className="flex items-center rounded dark:hover:bg-gray-600">
                                <label
                                  htmlFor={`checkbox-item-${i}`}
                                  className="w-full text-[16px] text-[#344051] rounded dark:text-gray-300 close-dropdown cursor-pointer text-nowrap truncate"
                                  onClick={() => handleStatusSelect(item)}
                                >
                                  {item?.label}
                                </label>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Dropdown.Content>
                    )}
                  </Dropdown>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5">
              <button
                type="button"
                className="py-[10px] px-3 border-[1px] border-[#637083] text-[14px] font-semibold text-[#637083] rounded-md"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                className={
                  'py-[10px] bg-[#1A75FF] text-[#FFFFFF] px-5 text-[14px] font-semibold  rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                }
                // type="submit"
                onClick={() => onSubmitHandler()}
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
      
    </div>
    {showProspectModal && (
      <AddProspectCustomerModal
        isOpen={showProspectModal}
        onClose={() => setShowProspectModal(false)}
        onSuccess={handleProspectCustomerCreated}
      />
    )}
    </>
  );
}
