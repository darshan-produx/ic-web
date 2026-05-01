'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CustomerDetail,
  clientDetails as ClientDetailsType,
  OnboardingStep,
} from '../api/onboarding/onboarding-types';
import {
  OnboardingCancelEditRemoveProductSvgIcon,
  OnboardingDeleteSvgIcon,
  OnboardingEditSvgIcon,
  OnboardingChevronRightSvgIcon,
  OnboardingAgentClientDetailsSvgIcon,
} from '../assests/icons/icons';
import {
  useAddCustomersandInsightInMaster,
  useAddNewCustomerClient,
  useRegenerateClientDetails,
  useUpdateClient,
} from '../../services/mutations/onboarding';
import OnboardingLayout from './components/OnboardingLayout';

interface AgentResultsProps {
  clientDetails: ClientDetailsType | null;
  onComplete: (step: OnboardingStep) => void;
  onBack?: () => void;
  setClientDetails: React.Dispatch<
    React.SetStateAction<ClientDetailsType | null>
  >;
  direction?: 'forward' | 'backward';
}

const validateUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return urlPattern.test(url);
};

const AgentResults: React.FC<AgentResultsProps> = ({
  clientDetails,
  onComplete,
  onBack = () => {},
  setClientDetails = () => {},
  direction = 'forward',
}) => {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [productError, setProductError] = useState<string>('');
  const [customerError, setCustomerError] = useState<string>('');
  const [productsState, setProductsState] = useState<
    Array<{ name: string; description?: string }>
  >([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductValue, setNewProductValue] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [editingProductValue, setEditingProductValue] = useState('');
  const [editingProductDescription, setEditingProductDescription] =
    useState('');
  const [customersState, setCustomersState] = useState<CustomerDetail[]>([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CustomerDetail>({
    name: '',
    website_url: '',
    // industry: '',
    // description: '',
  });
  const [editingCustomerIndex, setEditingCustomerIndex] = useState<
    number | null
  >(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDetail | null>(
    null
  );
  const [isFetchingCustomerDetails, setIsFetchingCustomerDetails] =
    useState(false);
  const [fetchingCustomerName, setFetchingCustomerName] = useState('');
  const [isAddingCustomersProducts, setIsAddingCustomersProducts] =
    useState(false);

  const updateClient = useUpdateClient();
  const addNewCustomerForOnboardingClient = useAddNewCustomerClient();
  const addCustomersandInsightInMaster = useAddCustomersandInsightInMaster();
  const regenerateClientDetails = useRegenerateClientDetails();
  const clientName = clientDetails?.client_name ?? '';
  useEffect(() => {
    setAboutText(() => {
      const business = clientDetails?.business_domain?.trim() || '';
      const goals = clientDetails?.targets_goals?.trim() || '';
      const name = clientDetails?.client_name ?? '';

      if (business && goals) return `${business}\n\n${goals}`;
      if (business) return business;
      if (goals) return goals;

      return `Enter about ${name}`;
    });
    setProductsState(
      (clientDetails?.products_services ?? []).map((p: any) => ({
        name: p?.name ?? String(p ?? ''),
        description: p?.description ?? '',
      }))
    );
    setCustomersState(
      Array.isArray(clientDetails?.customers)
        ? [...clientDetails.customers].sort(
            (a: any, b: any) =>
              new Date(b?.created_at ?? 0).getTime() -
              new Date(a?.created_at ?? 0).getTime()
          )
        : []
    );
    setIsEditingAbout(false);
    setIsAddingProduct(false);
    setNewProductValue('');
    setNewProductDescription('');
    setEditingProductIndex(null);
    setEditingProductValue('');
    setEditingProductDescription('');
    // Don't reset isAddingCustomer or newCustomer here - let handlers manage them
    setEditingCustomerIndex(null);
    setEditingCustomer(null);
  }, [clientDetails]);

  const handleSaveClientDetails = async (
    overrides: Partial<ClientDetailsType> = {}
  ) => {
    if (!clientDetails?._id) return;
    const payload: ClientDetailsType = {
      _id: clientDetails._id,
      ...overrides,
    } as unknown as ClientDetailsType;

    try {
      await updateClient.mutateAsync(payload);
    } catch (err) {
      console.error('Failed to save client details', err);
    }
  };

  const handleEditAbout = () => {
    setIsEditingAbout(true);
  };
  const handleCancelAbout = () => {
    setAboutText(() => {
      const business = clientDetails?.business_domain?.trim() || '';
      const goals = clientDetails?.targets_goals?.trim() || '';
      const name = clientDetails?.client_name ?? '';

      if (business && goals) return `${business}\n\n${goals}`;
      if (business) return business;
      if (goals) return goals;

      return `Enter about ${name}`;
    });
    setProductsState(
      (clientDetails?.products_services ?? []).map((p: any) => ({
        name: p?.name ?? String(p ?? ''),
        description: p?.description ?? '',
      }))
    );
    setIsEditingAbout(false);
  };
  const handleSaveAbout = async () => {
    await handleSaveClientDetails({
      business_domain: aboutText,
      products_services: productsState.length > 0 ? productsState : [],
    });
    setIsEditingAbout(false);
  };

  const handleAddProductClick = () => {
    setIsAddingProduct(true);
    setNewProductValue('');
    setNewProductDescription('');
    setEditingProductIndex(null);
  };

  const handleSaveNewProduct = async () => {
    const name = newProductValue.trim();
    if (!name) return;
    const description = newProductDescription.trim();
    const next = [...productsState, { name, description }];
    setProductsState(next);
    setProductError('');
    setIsAddingProduct(false);
    setNewProductValue('');
    setNewProductDescription('');
    // await handleSaveClientDetails({
    //   products_services: next,
    // });
  };

  const handleCancelNewProduct = () => {
    setIsAddingProduct(false);
    setNewProductValue('');
    setNewProductDescription('');
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setEditingProductValue(productsState[index]?.name ?? '');
    setEditingProductDescription(productsState[index]?.description ?? '');
    setIsAddingProduct(false);
  };

  const handleSaveEditProduct = async (index: number) => {
    const name = editingProductValue.trim();
    if (!name) {
      handleRemoveProduct(index);
      return;
    }
    const next = productsState.slice();
    const product = next[index];
    if (product) {
      product.name = name;
      product.description = editingProductDescription.trim();
    }
    next[index] = product;
    setProductsState(next);
    setEditingProductIndex(null);
    setEditingProductValue('');
    setEditingProductDescription('');
    // await handleSaveClientDetails({
    //   products_services: next,
    // });
  };

  const handleCancelEditProduct = () => {
    setEditingProductIndex(null);
    setEditingProductValue('');
    setEditingProductDescription('');
  };

  const handleRemoveProduct = async (index: number) => {
    const next = productsState.slice();
    next.splice(index, 1);
    setProductsState(next);
    if (editingProductIndex === index) {
      setEditingProductIndex(null);
      setEditingProductValue('');
    }
    // await handleSaveClientDetails({
    //   products_services: next,
    // });
  };

  const handleAddNewClick = () => {
    setIsAddingCustomer(true);
    setNewCustomer({
      name: '',
      website_url: '',
      // industry: '',
      // description: '',
    });
    setEditingCustomerIndex(null);
    setEditingCustomer(null);
    setUrlError('');
  };

  const handleCancelAddCustomer = () => {
    setIsAddingCustomer(false);
    setNewCustomer({
      name: '',
      website_url: '',
      // industry: '',
      // description: '',
    });
    setUrlError('');
  };

  const handleUrlChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      customerType: 'existing' | 'new'
    ) => {
      const rawValue = e.target.value;
      const trimmedValue = rawValue.trim();
      if (customerType === 'existing') {
        setEditingCustomer((prev) => ({
          ...(prev ?? {}),
          website_url: rawValue,
        }));
      } else {
        setNewCustomer((prev) => ({ ...(prev ?? {}), website_url: rawValue }));
      }
      if (trimmedValue === '') {
        setUrlError('');
        return;
      }
      if (!validateUrl(trimmedValue)) {
        setUrlError('Please enter a valid URL');
      } else {
        setUrlError('');
      }
    },
    [setEditingCustomer, setNewCustomer, setUrlError]
  );

  const handleSaveNewCustomer = async () => {
    const name = (newCustomer?.name ?? '').trim();
    if (!name) return;

    const websiteUrl = (newCustomer?.website_url ?? '').trim();

    // Validate URL only if it's provided
    if (websiteUrl && !validateUrl(websiteUrl)) {
      return; // Don't proceed if URL is invalid
    }

    // Clear error and form states
    setIsAddingCustomer(false);
    setUrlError('');
    setIsFetchingCustomerDetails(true);
    setFetchingCustomerName(name);

    setNewCustomer({
      name: '',
      website_url: '',
      // industry: '',
      // description: '',
    });

    const payload = {
      clientId: clientDetails?._id ?? '',
      clientName: clientDetails?.client_name ?? '',
      customerName: name,
      customerWebsiteUrl: websiteUrl,
    };

    try {
      const response = await addNewCustomerForOnboardingClient.mutateAsync(
        payload
      );
      setClientDetails(response?.data);
      setCustomerError('');
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setIsFetchingCustomerDetails(false);
      setFetchingCustomerName('');
    }
  };

  const handleEditCustomer = (index: number) => {
    setEditingCustomerIndex(index);
    setEditingCustomer({ ...(customersState[index] ?? {}) });
    setIsAddingCustomer(false);
  };

  const handleCancelCustomer = () => {
    setEditingCustomerIndex(null);
    setEditingCustomer(null);
    setUrlError('');
  };

  const handleSaveCustomer = async () => {
    if (editingCustomerIndex == null || !editingCustomer) return;
    const next = customersState.slice();
    next[editingCustomerIndex] = editingCustomer;
    setCustomersState(next);
    setEditingCustomerIndex(null);
    setEditingCustomer(null);
    await handleSaveClientDetails({
      customers: next,
    });
  };

  const handleDeleteCustomer = async (index: number) => {
    const next = customersState.slice();
    next.splice(index, 1);
    setCustomersState(next);
    if (editingCustomerIndex === index) handleCancelCustomer();
    await handleSaveClientDetails({
      customers: next,
    });
  };
  const handleContinue = async () => {
    // Clear previous errors
    setIsAddingCustomersProducts(true);
    setProductError('');
    setCustomerError('');

    // Validate products
    if (!productsState || productsState.length === 0) {
      setProductError('Please add at least one product');
    }

    // Validate customers
    if (!customersState || customersState.length === 0) {
      setCustomerError('Please add at least one customer');
    }

    // If either validation fails, don't proceed
    if (
      !productsState ||
      productsState.length === 0 ||
      !customersState ||
      customersState.length === 0
    ) {
      return;
    }

    await addCustomersandInsightInMaster.mutateAsync(clientDetails?._id ?? '');
    setIsAddingCustomersProducts(false);
    onComplete('agent_results');
  };

  const handleRegenerate = async () => {
    await regenerateClientDetails.mutateAsync(clientDetails?._id ?? '');
    setClientDetails(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFE]" data-onboarding-page>
      {/* Four-color gradient blobs - Fixed background */}
      <div className="fixed inset-0">
        {/* Top Left - Blue */}
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#BBDEFB] rounded-full blur-[180px] opacity-50"></div>
        {/* Top Right - Magenta/Pink */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#F8BBD0] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Left - Yellow-Green */}
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#C5E1A5] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Right - Mint Green */}
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#B2DFDB] rounded-full blur-[180px] opacity-50"></div>
      </div>

      {/* Content container */}
      <div className="relative flex flex-col items-center pt-[28px] pb-[29px] px-8 h-screen overflow-y-auto scroll">
        {/* Logo and Agent - fixed positioning as OnboardingLayout */}
        <div className="w-[681px] h-[42.72px] flex items-center justify-between mb-[30px]">
          {/* Logo - Top Left */}
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764577620/ImpactCraft_original_100x30px_tri7dy.png"
              alt="ImpactCraft Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Agent - Top Right */}
          <div className="w-14 h-12">
            <OnboardingAgentClientDetailsSvgIcon />
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {/* Outer white wrapper */}
          <div className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[50px] border border-white/50 p-12">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                I understand your company now
              </h1>
              <p className="text-gray-500 text-sm">
                Please edit if this needs any correction
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 text-sm font-medium">
                    About {clientName}
                  </h2>
                  {!isEditingAbout && (
                    <button
                      onClick={handleEditAbout}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <OnboardingEditSvgIcon />
                    </button>
                  )}
                </div>

                {isEditingAbout ? (
                  <div className="space-y-8">
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <textarea
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        className="w-full bg-white focus:outline-none min-h-[150px] resize-none font-inter font-normal text-[14px] leading-[20px]"
                      />
                    </div>

                    {/* Products Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-800 text-sm font-medium">
                          Products
                        </h3>
                        <button
                          onClick={handleAddProductClick}
                          className="px-4 py-2 bg-white text-gray-700 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Add new
                        </button>
                      </div>

                      <div className="space-y-6">
                        {productsState.map((product, index) => (
                          <div key={index}>
                            <input
                              type="text"
                              value={
                                editingProductIndex === index
                                  ? editingProductValue
                                  : product?.name
                              }
                              onChange={(e) => {
                                if (editingProductIndex !== index) {
                                  handleEditProduct(index);
                                }
                                setEditingProductValue(e.target.value);
                              }}
                              onFocus={() => {
                                if (editingProductIndex !== index) {
                                  handleEditProduct(index);
                                }
                              }}
                              onBlur={() => {
                                if (editingProductIndex === index) {
                                  handleSaveEditProduct(index);
                                }
                              }}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 mb-2 font-inter font-normal text-[14px] leading-[20px]"
                              placeholder="Product name"
                            />
                            <textarea
                              value={
                                editingProductIndex === index
                                  ? editingProductDescription
                                  : product?.description || ''
                              }
                              onChange={(e) => {
                                if (editingProductIndex !== index) {
                                  handleEditProduct(index);
                                }
                                setEditingProductDescription(e.target.value);
                              }}
                              onFocus={() => {
                                if (editingProductIndex !== index) {
                                  handleEditProduct(index);
                                }
                              }}
                              onBlur={() => {
                                if (editingProductIndex === index) {
                                  handleSaveEditProduct(index);
                                }
                              }}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 resize-none min-h-[80px] font-inter font-normal text-[14px] leading-[20px]"
                              placeholder="Product description"
                            />
                            <button
                              onClick={() => handleRemoveProduct(index)}
                              className="text-gray-900 hover:text-gray-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        {/* Add New Product Form */}
                        {isAddingProduct && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newProductValue}
                              onChange={(e) =>
                                setNewProductValue(e.target.value)
                              }
                              onBlur={() => {
                                if (
                                  newProductValue.trim() ||
                                  newProductDescription.trim()
                                ) {
                                  handleSaveNewProduct();
                                }
                              }}
                              placeholder="Product name"
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 font-inter font-normal text-[14px] leading-[20px]"
                              autoFocus
                            />
                            <textarea
                              value={newProductDescription}
                              onChange={(e) =>
                                setNewProductDescription(e.target.value)
                              }
                              onBlur={() => {
                                if (
                                  newProductValue.trim() ||
                                  newProductDescription.trim()
                                ) {
                                  handleSaveNewProduct();
                                }
                              }}
                              placeholder="Product description"
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 resize-none min-h-[80px] font-inter font-normal text-[14px] leading-[20px]"
                            />
                            <button
                              onClick={handleCancelNewProduct}
                              className="text-gray-900 hover:text-gray-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 justify-end mt-6">
                        <button
                          onClick={handleCancelAbout}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAbout}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-8">
                      {aboutText}
                    </div>
                    <div>
                      <h3 className="text-gray-800 mb-4 text-sm font-medium">
                        Products
                      </h3>
                      <div>
                        {productsState.map((product, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-2 ${
                              index < productsState.length - 1 ? 'mb-3' : ''
                            }`}
                          >
                            <span className="text-gray-700 text-base leading-relaxed">
                              •
                            </span>
                            <div className="flex-1">
                              <div className="text-gray-900 text-base font-medium leading-relaxed">
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="text-gray-500 text-sm leading-relaxed mt-1">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {productError && (
                      <p className="text-red-500 text-xs mt-2">
                        {productError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Customers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
              {/* Loading state while fetching customer details */}
              {isFetchingCustomerDetails && (
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-[10px] py-8 px-6 flex flex-col items-center justify-center gap-4 min-h-[120px]">
                    <p className="text-gray-700 text-base text-center">
                      Please wait while I get some information about{' '}
                      {fetchingCustomerName}
                    </p>
                    <div className="flex justify-center">
                      <div className="border-[2px] border-blue-500 border-t-transparent rounded-full animate-spin w-[18px] h-[18px]"></div>
                    </div>
                  </div>
                </div>
              )}
              {!isAddingCustomer && !isFetchingCustomerDetails && (
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-gray-800 text-base font-medium">
                    Customers
                  </h3>
                  <button
                    onClick={handleAddNewClick}
                    className="px-4 py-2 bg-white text-gray-700 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Add new
                  </button>
                </div>
              )}
              {/* Add Customer form */}
              {isAddingCustomer && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-base font-normal text-gray-900 mb-4">
                    Add details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="Enter customer name"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600 placeholder:text-gray-400"
                    />
                    <div className="w-full relative">
                      <input
                        id="customer-website"
                        type="text"
                        value={newCustomer.website_url}
                        onChange={(e) => handleUrlChange(e, 'new')}
                        placeholder="Enter customer website url"
                        autoComplete="off"
                        className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600 placeholder:text-gray-400 ${
                          urlError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-invalid={!!urlError}
                        aria-describedby={urlError ? 'url-error' : undefined}
                      />
                      {urlError && (
                        <p
                          id="url-error"
                          className="absolute left-0 top-full mt-1 text-red-500 text-xs"
                        >
                          {urlError}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* <div className="mb-3">
                  <input
                    type="text"
                    value={newCustomer.industry}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        industry: e.target.value,
                      })
                    }
                    placeholder="Type / Industry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600 placeholder:text-gray-400"
                  />
                </div>
                <textarea
                  value={newCustomer.description}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none transition-all"
                  placeholder="Description"
                />*/}
                  <div className="flex gap-2 justify-end mt-4">
                    <button
                      onClick={handleCancelAddCustomer}
                      className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewCustomer}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newCustomer.name?.trim() || !!urlError}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {/* Customer List */}
              {customersState.map((customer, index) => (
                <div key={index}>
                  {editingCustomerIndex === index && editingCustomer ? (
                    <div className="space-y-5 mb-8 pb-8 border-b border-gray-200">
                      <input
                        type="text"
                        value={editingCustomer.name ?? ''}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...(editingCustomer ?? {}),
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                        placeholder="Customer Name"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingCustomer.industry ?? ''}
                          onChange={(e) =>
                            setEditingCustomer({
                              ...(editingCustomer ?? {}),
                              industry: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                          placeholder="Type"
                        />
                        <div className="w-full relative">
                          <input
                            type="text"
                            value={editingCustomer.website_url ?? ''}
                            onChange={(e) => handleUrlChange(e, 'existing')}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none ${
                              urlError ? 'border-red-500' : 'border-gray-300'
                            }`}
                            aria-invalid={!!urlError}
                            aria-describedby={
                              urlError ? 'url-error' : undefined
                            }
                            placeholder="Website"
                          />
                          {urlError && (
                            <p
                              id="url-error"
                              className="absolute left-0 top-full mt-1 text-red-500 text-xs"
                            >
                              {urlError}
                            </p>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={editingCustomer.description ?? ''}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...(editingCustomer ?? {}),
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none min-h-[100px] resize-none"
                        placeholder="Description"
                      />
                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          onClick={handleCancelCustomer}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCustomer}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={
                        index < customersState.length - 1
                          ? 'mb-8 pb-8 border-b border-gray-200'
                          : 'mb-0'
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() => handleEditCustomer(index)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <OnboardingEditSvgIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <OnboardingDeleteSvgIcon />
                          </button>
                        </div>
                      </div>

                      {(customer.industry || customer.website_url) && (
                        <div className="text-sm text-gray-400 mb-3">
                          {customer.industry && (
                            <span>{customer.industry}</span>
                          )}
                          {customer.industry && customer.website_url && (
                            <span className="mx-2">|</span>
                          )}
                          {customer.website_url && (
                            <span>{customer.website_url}</span>
                          )}
                        </div>
                      )}

                      {customer.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {customer.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}{' '}
              {customerError && (
                <p className="text-red-500 text-xs mt-4">{customerError}</p>
              )}{' '}
            </div>
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={onBack}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={isAddingCustomersProducts}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm ${
                  isAddingCustomersProducts
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isAddingCustomersProducts ? 'Saving...' : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentResults;
