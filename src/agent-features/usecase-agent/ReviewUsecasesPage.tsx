'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { ProgressDots } from '../components/ProgressDots';
import { ContextSection } from './ContextSection';
import {
  OnboardingAgentClientDetailsSvgIcon,
  OnboardingEditSvgIcon,
  OnboardingDeleteSvgIcon,
} from '../../app/assests/icons/icons';
import { useQuery } from '@tanstack/react-query';
import {
  getAllProducts,
  getAllUsecaseSuggestions,
} from '../../app/api/agents/usecase-agent';
import { useUpdateUsecaseMutation } from '../../services/mutations/agents';
import MultiSelectDropDown from '../../common/components/MultiSelectDropDown';
import ConfirmationModal from '../../common/components/Modal/confirmationModal';

// --- Types ---
interface Product {
  insight_id: string;
  insight_name: string;
  description?: string;
}

interface Usecase {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discovery_questions: string[];
  qualification_questions: string[];
  // Removed tags & industry as requested
  [key: string]: any;
}

interface ReviewUsecasesPageProps {
  activation_id: string;
  onBack: () => void;
  onComplete: (agentStagingId: string) => void;
  onSubmitWithContext: (context: string) => void;
  onSubmitWithoutContext: () => void;
}

const ReviewUsecasesPage: React.FC<ReviewUsecasesPageProps> = ({
  activation_id,
  onBack,
  onComplete,
  onSubmitWithContext,
  onSubmitWithoutContext,
}) => {
  // --- States ---
  const [usecases, setUsecases] = useState<Usecase[]>([]);
  const [agentStagingId, setAgentStagingId] = useState<string>('');
  const [editedContext, setEditedContext] = useState('');

  // Edit Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Usecase | null>(null);

  // Dropdown States
  const [productCheckboxItems, setProductCheckboxItems] = useState<any[]>([]);
  const [productSearchText, setProductSearchText] = useState('');
  const [showActivateWarning, setShowActivateWarning] = useState(false);
  const [productError, setProductError] = useState<string>('');
  const [productDropdownOpenForId, setProductDropdownOpenForId] = useState<string | null>(null);
  const [productDropdownItems, setProductDropdownItems] = useState<any[]>([]);

  // --- Mutations ---
  const { mutate: updateUsecase, isPending: isUpdating } =
    useUpdateUsecaseMutation();

  const { data: productDetailsData } = useQuery({
    queryKey: ['get-all-product-details', activation_id],
    queryFn: getAllProducts,
    enabled: Boolean(activation_id),
    refetchOnWindowFocus: false,
  });

  const {
    data: useCaseSuggestionDetailsData,
    isLoading: docIngestionDetailsLoading,
  } = useQuery({
    queryKey: ['get-all-usecase-suggestions', activation_id],
    queryFn: () => getAllUsecaseSuggestions(activation_id!),
    refetchOnWindowFocus: false,
  });

  // --- Effects ---
  useEffect(() => {
    if (useCaseSuggestionDetailsData) {
      const data = useCaseSuggestionDetailsData?.data?.data || {};
      setEditedContext(data?.context || ''); // Safety default
      setAgentStagingId(data?._id || '');
      const fetchedUsecases = (data?.usecases || []).map((u: any) => ({
        ...u,
        products: (u?.products || []).map((p: any) =>
          typeof p === 'string' ? { insight_id: 'unknown', insight_name: p } : p
        ),
      }));
      setUsecases(fetchedUsecases);
    }
  }, [useCaseSuggestionDetailsData]);

  // --- Handlers ---

  const handleEdit = (usecase: Usecase) => {
    setEditingId(usecase.id);
    // Safety: ensure arrays are initialized even if data is missing
    setEditForm({
      ...usecase,
      products: usecase.products ?? [],
      discovery_questions: usecase.discovery_questions ?? [],
      qualification_questions: usecase.qualification_questions ?? [],
    });

    // Sync Dropdown
    if (
      productDetailsData &&
      Array.isArray(productDetailsData.data) &&
      productDetailsData.data.length > 0
    ) {
      const productDetails = productDetailsData.data ?? [];
      const existingProductNames = new Set(
        (usecase.products ?? []).map((p) => p.insight_name)
      );
      const mappedItems = productDetails.map((item: any) => ({
        ...item,
        selected: existingProductNames.has(item.label),
      }));
      setProductCheckboxItems(mappedItems);
    } else {
      setProductCheckboxItems([]);
    }
  };

  const handleAddNew = () => {
    const newUsecase: Usecase = {
      id: 'new',
      name: '',
      description: '',
      products: [],
      discovery_questions: [''],
      qualification_questions: [''],
    };
    setEditingId('new');
    setEditForm(newUsecase);

    if (
      productDetailsData &&
      Array.isArray(productDetailsData.data) &&
      productDetailsData.data.length > 0
    ) {
      const productDetails = productDetailsData.data ?? [];
      const resetItems = productDetails.map((item: any) => ({
        ...item,
        selected: false,
      }));
      setProductCheckboxItems(resetItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setProductCheckboxItems([]);
  };

  const handleSaveEdit = () => {
    if (editForm && agentStagingId) {
      // 1. Prepare Data
      const selectedProductsFromDropdown: Product[] = (
        productCheckboxItems || []
      )
        .filter((item) => item.selected)
        .map((item) => ({
          insight_id: item.value,
          insight_name: item.label,
          description: '',
        }));

      // SAFETY: Check for null/undefined before trimming
      // Only keep strings that are not empty after trim
      const validDiscovery = (editForm.discovery_questions || []).filter(
        (q) => typeof q === 'string' && q.trim().length > 0
      );
      const validQualification = (
        editForm.qualification_questions || []
      ).filter((q) => typeof q === 'string' && q.trim().length > 0);

      const payload: any = {
        activation_id: activation_id,
        agent_staging_id: agentStagingId,
        name: editForm.name?.trim() ?? '', // Safe trim
        description: editForm.description?.trim() ?? '', // Safe trim
        products: selectedProductsFromDropdown,
        discovery_questions: validDiscovery,
        qualification_questions: validQualification,
        // Removed tags & industry from payload
      };

      // 2. Differentiate Add vs Edit
      if (editingId === 'new') {
        // ADD Mode
      } else {
        // EDIT Mode
        payload.id = editForm.id;
      }

      // 3. Fire Mutation
      updateUsecase(payload, {
        onSuccess: () => {
          handleCancelEdit();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (agentStagingId) {
      const payload: any = {
        id,
        activation_id: activation_id,
        agent_staging_id: agentStagingId,
        is_deleted: true,
      };
      updateUsecase(payload, {
        onSuccess: () => {
          handleCancelEdit();
        },
      });
    }
  };

  const handleSubmitWithContext = () => {
    // Safe trim on context
    if (editedContext && editedContext.trim().length > 0) {
      onSubmitWithContext(editedContext);
    }
  };

  // --- Helper Functions for Arrays (SAFELY IMPLEMENTED) ---
  const updateArrayField = (
    field: 'discovery_questions' | 'qualification_questions',
    idx: number,
    value: string
  ) => {
    if (!editForm) return;

    // SAFETY: Use fallback array to prevent crash on spread
    const currentArray = editForm[field] ?? [];
    const newArray = [...currentArray];

    newArray[idx] = value;
    setEditForm({ ...editForm, [field]: newArray });
  };

  const removeArrayItem = (
    field: 'discovery_questions' | 'qualification_questions',
    idx: number
  ) => {
    if (!editForm) return;

    // SAFETY: Use fallback array to prevent crash on filter
    const currentArray = editForm[field] ?? [];
    const newArray = currentArray.filter((_, i) => i !== idx);

    setEditForm({ ...editForm, [field]: newArray });
  };

  const addArrayItem = (
    field: 'discovery_questions' | 'qualification_questions'
  ) => {
    if (!editForm) return;

    // SAFETY: Use fallback array to prevent crash on spread
    const currentArray = editForm[field] ?? [];
    setEditForm({ ...editForm, [field]: [...currentArray, ''] });
  };

  const filteredProductItems = useMemo(() => {
    return (productCheckboxItems || []).filter((item) =>
      item.label
        ?.toLowerCase()
        .includes((productSearchText || '').toLowerCase())
    );
  }, [productCheckboxItems, productSearchText]);

  const filteredProductDropdownItems = useMemo(() => {
    return (productDropdownItems || []).filter((item) =>
      item.label
        ?.toLowerCase()
        .includes((productSearchText || '').toLowerCase())
    );
  }, [productDropdownItems, productSearchText]);

  const handleActivateClick = () => {
    // Check if any usecase has no products selected
    const hasUsecaseWithoutProducts = usecases.some(
      (usecase) => !usecase.products || usecase.products.length === 0
    );

    if (hasUsecaseWithoutProducts) {
      setProductError('Please select product for each usecase');
      setShowActivateWarning(true);
      return;
    }

    // If all usecases have products, proceed
    setProductError('');
    onComplete(agentStagingId);
  };

  const handleProductDropdownOpen = (usecase: Usecase) => {
    setProductDropdownOpenForId(usecase.id);

    if (
      productDetailsData &&
      Array.isArray(productDetailsData.data) &&
      productDetailsData.data.length > 0
    ) {
      const productDetails = productDetailsData.data ?? [];
      const existingProductNames = new Set(
        (usecase.products ?? []).map((p) => p.insight_name)
      );
      const mappedItems = productDetails.map((item: any) => ({
        ...item,
        selected: existingProductNames.has(item.label),
      }));
      setProductDropdownItems(mappedItems);
    } else {
      setProductDropdownItems([]);
    }
  };

  const handleProductDropdownSave = (usecaseId: string) => {
    if (agentStagingId) {
      const selectedProductsFromDropdown: Product[] = (
        productDropdownItems || []
      )
        .filter((item) => item.selected)
        .map((item) => ({
          insight_id: item.value,
          insight_name: item.label,
          description: '',
        }));

      const usecase = usecases.find((u) => u.id === usecaseId);
      if (!usecase) return;

      const payload: any = {
        id: usecaseId,
        activation_id: activation_id,
        agent_staging_id: agentStagingId,
        name: usecase.name,
        description: usecase.description,
        products: selectedProductsFromDropdown,
        discovery_questions: usecase.discovery_questions || [],
        qualification_questions: usecase.qualification_questions || [],
      };

      updateUsecase(payload, {
        onSuccess: () => {
          setProductDropdownOpenForId(null);
          setProductDropdownItems([]);
        },
      });
    }
  };

  return (
    <>
      <OnboardingLayoutApp agentIcon={<OnboardingAgentClientDetailsSvgIcon />}>
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Reviewing use cases
          </h1>
          <div className="font-inter font-normal text-sm leading-5 text-gray-600 mb-4 flex flex-col gap-2">
            <span>These are the use cases I think will be relevant for you. Feel free to add, edit, or delete them.</span>
            <span>You can also generate them by telling me exactly what you are looking for in the window below or simply click on the 'Generate without context' button</span>
            <span>Mapping at least one product to a use case is mandatory</span>
          </div>
          <ProgressDots totalSteps={3} currentStep={2} />
        </div>

        {/* Context Section */}
        <ContextSection
          activation_id={activation_id}
          context={editedContext}
          onContextChange={setEditedContext}
          onBack={onBack}
          onSubmitWithContext={handleSubmitWithContext}
          onSubmitWithoutContext={onSubmitWithoutContext}
          disabled={editingId !== null}
          placeholder="e.g. I want to find when my customers go through mergers or acquisitions"
        />

        {/* Use Cases Section */}
        <div className="mb-8 w-full max-w-[600px] mx-auto mt-6">
          {editingId === 'new' ? (
            /* ADD FORM */
            <div className="space-y-4">
              {editForm && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="text-[14px] text-gray-900 mb-4">Add use case</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      placeholder="Enter description"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600 resize-none"
                    />

                    {/* Discovery Questions */}
                    <div>
                      <h4 className="text-[14px] text-gray-700 mb-3">
                        Discovery questions
                      </h4>
                      <div className="space-y-3">
                        {(editForm.discovery_questions || []).map((q, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={q}
                              onChange={(e) =>
                                updateArrayField(
                                  'discovery_questions',
                                  idx,
                                  e.target.value
                                )
                              }
                              placeholder="Enter discovery question"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600"
                            />
                            <button
                              onClick={() =>
                                removeArrayItem('discovery_questions', idx)
                              }
                              className="text-gray-400 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addArrayItem('discovery_questions')}
                        className="text-[14px] text-gray-700 hover:text-gray-900 mt-2"
                      >
                        Add new
                      </button>
                    </div>

                    {/* Products */}
                    <div>
                      <h4 className="text-[14px] text-gray-700 mb-3">Products</h4>
                      <div className="w-full min-h-[40px]">
                        <MultiSelectDropDown
                          filteredItems={filteredProductItems}
                          checkboxItems={productCheckboxItems}
                          setCheckboxItems={setProductCheckboxItems}
                          dataFieldToUseForSelection="label"
                          uniqueIdFieldToUseForSelection="value"
                          typeOfData="Products"
                          wantToShowSearchBox={true}
                          setSearchText={setProductSearchText}
                          searchText={productSearchText}
                          wantToShowSelectedItems={true}
                          dropDownContentCss="w-full"
                          triggerTextCss="text-gray-600 text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md text-[14px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        // SAFETY: Safe checks
                        disabled={
                          isUpdating ||
                          !editForm.name?.trim() ||
                          !editForm.description?.trim()
                        }
                        className={`px-4 py-1.5 rounded-md text-[14px] ${isUpdating || !editForm.name?.trim()
                          ? 'bg-[#CCE0FF] text-white cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                      >
                        {isUpdating ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing List */}
              {usecases.map((usecase) => (
                <div
                  key={usecase.id}
                  className="bg-white rounded-lg p-5 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-[16px] text-gray-800 flex-1 pr-4">
                      {usecase.name}
                    </h4>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleEdit(usecase)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <OnboardingEditSvgIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(usecase.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <OnboardingDeleteSvgIcon />
                      </button>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#97A1AF] mb-3">
                    {usecase.description}
                  </p>
                  {/* Products */}
                  <div className="mb-3">
                    <span className="text-[14px] text-[#97A1AF]">Products: </span>
                    {(usecase.products || []).map((product, idx) => (
                      <span key={idx} className="text-[14px] text-gray-800 mr-2">
                        {product.insight_name}
                        {idx < (usecase.products || []).length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Main List View */
            <div className="w-[600px] rounded-[24px] border border-gray-200 p-[24px] bg-white/90 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Use cases</h3>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-white text-gray-700 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Add new
                </button>
              </div>
              <div className="space-y-4">
                {usecases.map((usecase) => (
                  <div key={usecase.id}>
                    {editingId === usecase.id && editForm ? (
                      <div className="bg-white rounded-lg p-5 border border-gray-200">
                        {/* EDIT FORM */}
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600 resize-none"
                          />

                          {/* Discovery Questions */}
                          <div>
                            <h4 className="text-[14px] text-gray-700 mb-3">
                              Discovery questions
                            </h4>
                            <div className="space-y-3">
                              {(editForm.discovery_questions || []).map(
                                (q, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="text"
                                      value={q}
                                      onChange={(e) =>
                                        updateArrayField(
                                          'discovery_questions',
                                          idx,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600"
                                    />
                                    <button
                                      onClick={() =>
                                        removeArrayItem(
                                          'discovery_questions',
                                          idx
                                        )
                                      }
                                      className="text-gray-400 hover:text-red-600"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                            <button
                              onClick={() => addArrayItem('discovery_questions')}
                              className="text-[14px] text-gray-700 hover:text-gray-900 mt-2"
                            >
                              Add new
                            </button>
                          </div>

                          {/* Products */}
                          <div>
                            <h4 className="text-[14px] text-gray-700 mb-3">
                              Products
                            </h4>
                            <div className="w-full min-h-[40px]">
                              <MultiSelectDropDown
                                filteredItems={filteredProductItems}
                                checkboxItems={productCheckboxItems}
                                setCheckboxItems={setProductCheckboxItems}
                                dataFieldToUseForSelection="label"
                                uniqueIdFieldToUseForSelection="value"
                                typeOfData="Products"
                                wantToShowSearchBox={true}
                                setSearchText={setProductSearchText}
                                searchText={productSearchText}
                                wantToShowSelectedItems={true}
                                dropDownContentCss="w-full"
                                triggerTextCss="text-gray-600 text-[14px]"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md text-[14px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              // SAFETY: Safe checks
                              disabled={isUpdating || !editForm.name?.trim()}
                              className={`px-4 py-1.5 rounded-md text-[14px] ${isUpdating
                                ? 'bg-[#CCE0FF]'
                                : 'bg-blue-500 hover:bg-blue-600'
                                } text-white`}
                            >
                              {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Read Only Card
                      <div className="bg-white rounded-lg p-5 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-[16px] text-gray-800 flex-1 pr-4">
                            {usecase.name}
                          </h4>
                          <div className="flex items-center gap-5">
                            <button
                              onClick={() => handleEdit(usecase)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <OnboardingEditSvgIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(usecase.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <OnboardingDeleteSvgIcon />
                            </button>
                          </div>
                        </div>
                        <p className="text-[14px] text-[#97A1AF] mb-3">
                          {usecase.description}
                        </p>

                        {/* Discovery Questions Read Only */}
                        {(usecase.discovery_questions || []).length > 0 && (
                          <div className="mb-3">
                            <p className="text-[12px] text-[#97A1AF] mb-2">
                              Discovery Questions
                            </p>
                            {usecase.discovery_questions.map((question, idx) => (
                              <p
                                key={idx}
                                className="text-[12px] text-gray-800 mb-1"
                              >
                                Q{idx + 1}. {question}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Products with Dropdown */}
                        <div className="mb-3">
                          {productDropdownOpenForId === usecase.id ? (
                            <div className="space-y-2">
                              <div className="w-full min-h-[40px]">
                                <MultiSelectDropDown
                                  filteredItems={filteredProductDropdownItems}
                                  checkboxItems={productDropdownItems}
                                  setCheckboxItems={setProductDropdownItems}
                                  dataFieldToUseForSelection="label"
                                  uniqueIdFieldToUseForSelection="value"
                                  typeOfData="Products"
                                  wantToShowSearchBox={true}
                                  setSearchText={setProductSearchText}
                                  searchText={productSearchText}
                                  wantToShowSelectedItems={true}
                                  dropDownContentCss="w-full"
                                  triggerTextCss="text-gray-600 text-[14px]"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setProductDropdownOpenForId(null);
                                    setProductDropdownItems([]);
                                  }}
                                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-[12px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleProductDropdownSave(usecase.id)}
                                  disabled={isUpdating}
                                  className={`px-3 py-1 rounded-md text-[12px] ${isUpdating
                                    ? 'bg-[#CCE0FF] text-white cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                              <button
                                onClick={() => handleProductDropdownOpen(usecase)}
                                className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleProductDropdownOpen(usecase)}
                                className="text-[14px] text-[#97A1AF] hover:text-blue-600 flex-shrink-0"
                              >
                                Products:
                              </button>
                              <div className="overflow-hidden text-ellipsis">
                                {(usecase.products || []).map((product, idx) => (
                                  <span key={idx} className="text-[14px] text-gray-800">
                                    {product.insight_name}
                                    {idx < (usecase.products || []).length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={handleActivateClick}
            disabled={editingId !== null}
            className={`inline-flex items-center justify-center px-8 py-3 rounded-lg transition-colors duration-200 font-medium text-base shadow-lg ${editingId !== null
              ? 'bg-[#CCE0FF] text-white cursor-not-allowed'
              : 'bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-blue-500/30'
              }`}
          >
            Activate
          </button>
        </div>

      </OnboardingLayoutApp>
      {/* Warning Modal */}
      {showActivateWarning &&
        typeof document !== 'undefined' &&
        createPortal(
          <ConfirmationModal
            header=""
            title={productError}
            modalOpen={showActivateWarning}
            handleCancel={() => {
              setShowActivateWarning(false);
              setProductError('');
            }}
            handleYes={() => {
              setShowActivateWarning(false);
              setProductError('');
            }}
            yesText="OK"
          />,
          document.body
        )}
    </>
  );
};

export default ReviewUsecasesPage;