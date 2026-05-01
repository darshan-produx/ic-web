import React, { useState } from 'react';
import Modal from '../../../../../common/Modal';
import { toast } from 'react-toastify';
import { apiRequest } from '../../../../../common/api-request';

interface AddProspectCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}

export default function AddProspectCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProspectCustomerModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [emailDomains, setEmailDomains] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse email domains from comma-separated string
      const domainsArray = emailDomains
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const payload: any = {
        crm_id: `PROSPECT_${Date.now()}`, // Generate unique CRM ID
        customer_name: customerName.trim(),
        is_prospect: true,
      };

      if (companyWebsite.trim()) {
        payload.company_website_url = companyWebsite.trim();
      }

      if (domainsArray.length > 0) {
        payload.approved_domains = domainsArray;
      }

      const response = await apiRequest({
        url: '/api/app-service/v1/customers',
        method: 'POST',
        data: payload,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Prospect customer created successfully!');
        const createdCustomer = response.data.data[0];
        onSuccess({
          customer_id: createdCustomer.customer_id,
          customer_name: createdCustomer.customer_name,
        });
        handleClose();
      }
    } catch (error: any) {
      toast.error(
        `Error creating prospect customer: ${
          error?.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setCompanyWebsite('');
    setEmailDomains('');
    onClose();
  };

  const modalContent = (
    <div className="p-[20px]">
      <div className="text-[18px] font-medium text-[#202B37] mb-[24px] leading-[28px]" style={{ fontFamily: 'Inter' }}>
        Add New Prospect
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col mb-[24px]">
          <label className="text-[14px] font-medium text-[#344051] mb-[6px]">
            Prospect name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter Prospect name"
            className="py-[6px] px-[8px] w-full h-[32px] text-[#141C24] text-[14px] border border-[#CED2DA] rounded-[8px] outline-none focus:border-[#1A75FF] placeholder:text-[#637083]"
          />
        </div>

        <div className="flex flex-col mb-[24px]">
          <label className="text-[14px] font-medium text-[#344051] mb-[6px]">
            Company website
          </label>
          <input
            type="text"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="Enter link"
            className="py-[6px] px-[8px] w-full h-[32px] text-[#141C24] text-[14px] border border-[#CED2DA] rounded-[8px] outline-none focus:border-[#1A75FF] placeholder:text-[#637083]"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[14px] font-medium text-[#344051] mb-[6px]">
            Email domains list
          </label>
          <input
            type="text"
            value={emailDomains}
            onChange={(e) => setEmailDomains(e.target.value)}
            placeholder="Enter domains"
            className="py-[6px] px-[8px] w-full h-[32px] text-[#141C24] text-[14px] border border-[#CED2DA] rounded-[8px] outline-none focus:border-[#1A75FF] placeholder:text-[#637083] mb-[4px]"
          />
          <span className="text-[12px] text-[#637083] mb-[20px]">
            domains can be separated by commas ","
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-[8px]">
        <button
          type="button"
          className="py-[6px] px-[12px] border border-[#CED2DA] text-[14px] font-medium text-[#344051] rounded-[6px] hover:bg-gray-50"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="py-[6px] px-[16px] bg-[#1A75FF] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#0056D2] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting || !customerName.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add new'}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed z-[1100] inset-0 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-2 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom text-left overflow-hidden shadow-lg border border-slate-200 bg-white rounded-[12px] transform w-[400px] h-fit max-h-[410px] sm:my-8 sm:align-middle">
          <div className="overflow-y-auto scroll h-full">
            <div>{modalContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
