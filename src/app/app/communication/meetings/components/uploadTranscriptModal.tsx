"use client";
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '../../../../../common/components/Modal';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Flatpickr from 'react-flatpickr';
import { StylesConfig } from 'react-select';
import Select from 'react-select';
import { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { UploadCloudIcon } from '../../../../../app/assests/icons/icons';
import { useUpdateMeeting } from '../../../../../services/mutations/communicationMutations';
import { toast } from 'react-toastify';
import { useCommunicationStore } from '../../../../../app/api/communication/communication-store';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import CreatableSelect from 'react-select/creatable';
import { useMixpanel } from '../../../../../common/mixpanel/useMixpanel';
import { getCustomerStakeholdersWithTeamUsers, uploadMeetingsMOM } from '../../../../../app/api/communication/communication';
import { getUsersForTask } from '../../../../../app/api/users/users';
import { useUploadTranscript, useUploadMeetingNotes } from '../../../../../services/mutations/communicationMutations';

interface CustomerOption {
  label: string;
  value: string;
  is_prospect?: boolean;
}
interface Customer {
  customer_name: string;
  customer_id: string;
}

const schema = yup.object({
  title: yup.string().required('Requires meeting title'),
});
export default function UploadTranscriptModal({
  setUploadTransriptModalOpen,
  uploadTransriptModalOpen,
  allCustomers,
  userInfo,
}: any) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const title = watch('title');
  const options = useMemo(
    () =>
      allCustomers?.map((ele: any) => ({
        value: ele.customer_id,
        label: ele.customer_name,
        is_prospect: Boolean(ele?.is_prospect),
      })) || [],
    [allCustomers]
  );

  const [selectedCustomer, setSelectedCustomer] = useState<any>([]);
  const [selectedParticipants, setSelectedParticipants]: any = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers]: any = useState([]);
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeErrorMessage, setTimeErrorMessage] = useState('');
  const [customerErrorMessage, setCustomerErrorMessage] = useState('');
  const [participantsErrorMessage, setParticipantsErrorMessage] = useState('');
  const [fileUploadStatus, setFileUploadStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [internalMeeting, setInternalMeeting] = useState(false);
  const uploadTranscripts = useCommunicationStore(
    (state) => state.uploadTranscript
  );
  const uploadProgress = useCommunicationStore((state) => state.uploadProgress);
  const updateMeeting = useUpdateMeeting();
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();

  // Fetch users for team member selection
  const { data: existingUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });

  const { data: customerStakeholdersWithTeamUsers } = useQuery({
    queryKey: ['customerStakeholdersWithTeamUsers', selectedCustomer?.value],
    queryFn: () => getCustomerStakeholdersWithTeamUsers(selectedCustomer?.value),
    enabled: !!selectedCustomer?.value,
  });

  const uploadTranscriptMutation = useUploadTranscript();
  const uploadMeetingNotesMutation = useUploadMeetingNotes();
  // Helper function to get current user as participant option
  const getCurrentUserAsParticipant = () => {
    if (userInfo?.id && existingUsers?.data?.data) {
      const currentUser = existingUsers.data.data.find(
        (user: any) => user.user?._id === userInfo.id
      );

      if (currentUser?.user) {
        return {
          email: currentUser.user.email,
          value: currentUser.user.email,
          label: `${currentUser.user.first_name} ${currentUser.user.last_name}`,
          name: `${currentUser.user.first_name} ${currentUser.user.last_name}`,
          participant_id: currentUser.user._id,
          participant_type: 'user',
        };
      }
    }
    return null;
  };

  const handleChange = (selected: any) => {
    setSelectedCustomer(selected);
  };
  const queryClient = useQueryClient();
  const handleParticipantChange = (selected: any) => {
    setSelectedParticipants(selected);
  };
  const handleTeamMemberChange = (selected: any) => {
    setSelectedTeamMembers(selected);
  };
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerErrorMessage('');
  };

  const validateFile = (file: File) => {
    setSelectedFile(null);
    const validExtensions = ['txt', 'pdf', 'vtt', 'docx'];
    const fileExtension: any = file.name.split('.').pop()?.toLowerCase();
    const fileSizeInMB = file.size / (1024 * 1024);

    if (!validExtensions.includes(fileExtension)) {
      setErrorMessage(
        'Invalid file type. Please upload a .txt, .pdf, .docx or .vtt file.'
      );
      return false;
    }

    if (fileSizeInMB > 5) {
      setErrorMessage('File size should not exceed 5 MB.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = validateFile(file);
      if (isValid) {
        setErrorMessage('');
        setSelectedFile(file);
        setNotes('');
      }
    } else {
      setErrorMessage('Requires transcript file');
    }
  };

  const handleDrop = (event: any) => {
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const isValid = validateFile(file);
      if (isValid) {
        setErrorMessage('');
        setSelectedFile(file);
        setNotes('');
      }
    }
  };

  const participantsOptions = useMemo(
    () => {
      const participants = customerStakeholdersWithTeamUsers?.data
        // ?.find((ele: any) => ele.customer_id === selectedCustomer?.value)
        ?.participants?.map((ele: any) => ({
          value: ele.email,
          label: ele.name,
          participant_id: ele?.participant_type !== 'stakeholder' ? ele?._id : undefined,
          stakeholder_id: ele?.participant_type === 'stakeholder' ? ele?._id : undefined,
          participant_type: ele?.participant_type || 'stakeholder',
          name: ele.name,
          email: ele.email,
        })) || [];

      // Reset participants with current user when customer changes (not in edit mode)
      if (!uploadTransriptModalOpen?.isEdit) {
        const currentUserOption = getCurrentUserAsParticipant();
        if (currentUserOption) {
          setSelectedParticipants([currentUserOption]);
        } else {
          setSelectedParticipants([]);
        }
      }

      // if (!uploadTransriptModalOpen?.isEdit && selectedCustomer?.value) {
      //   setSelectedParticipants((prev: any) =>
      //     prev.filter((p: any) =>
      //       participants.some((opt: any) =>
      //         (p.participant_id && opt.participant_id === p.participant_id) ||
      //         (p.stakeholder_id && opt.stakeholder_id === p.stakeholder_id) ||
      //         (p.email && opt.email === p.email)
      //       )
      //     )
      //   );
      // }

      return participants;
    },
    [selectedCustomer, customerStakeholdersWithTeamUsers]
  );

  // Team members options from users API
  const teamMembersOptions = useMemo(
    () =>
      existingUsers?.data?.data
        ?.map((ele: any) =>
          ele.user?._id
            ? {
              email: ele.user.email,
              value: ele.user._id,
              label: `${ele.user.first_name} ${ele.user.last_name}`,
              name: `${ele.user.first_name} ${ele.user.last_name}`,
              participant_type: 'user',
            }
            : null
        )
        ?.filter(Boolean) || [],
    [existingUsers]
  );

  const onSubmitHandler = async (data: any) => {
    // Reset all error messages first
    setCustomerErrorMessage('');
    setTimeErrorMessage('');
    setParticipantsErrorMessage('');
    setErrorMessage('');

    // Validate required fields based on meeting type
    if (!internalMeeting && (!selectedCustomer || !selectedCustomer.value)) {
      setCustomerErrorMessage('Requires customer');
      return;
    }
    if (!datetime) {
      setTimeErrorMessage('Requires meeting time');
      return;
    }
    if (!uploadTransriptModalOpen?.isEdit && !selectedFile && !notes.trim()) {
      setErrorMessage('Requires transcript file or notes');
      return;
    }

    let payload;
    setFileUploadStatus('uploading');

    // Define the participant type and mapping function
    type Participant = {
      name: string;
      email: string;
      participant_id?: string;
      stakeholder_id?: string;
      participant_type?: 'stakeholder' | 'user' | 'external';
    };

    const mapParticipants = (participants: Participant[]) =>
      participants.map((p: Participant) => ({
        name: p.name,
        email: p.email,
        participant_type: p.participant_type || 'stakeholder',
        participant_id: p.participant_type !== 'stakeholder' ? p.participant_id : undefined,
        stakeholder_id: p.participant_type === 'stakeholder' ? p.stakeholder_id : undefined,
      }));

    // Prepare base payload
    const basePayload: any = {
      meeting_name: data.title,
      datetime: datetime.toISOString(),
      status: 'pending',
      is_internal_meeting: !uploadTransriptModalOpen?.isEdit ? internalMeeting : undefined,
    };

    // Add customer details if selected (optional for internal meetings)
    if (selectedCustomer && selectedCustomer.value) {
      basePayload.customer_id = selectedCustomer.value;
      basePayload.customer_name = selectedCustomer.label;
    }

    // Add participants based on meeting type
    if (!uploadTransriptModalOpen?.isEdit) {
      if (internalMeeting) {
        // For internal meetings, use team members
        basePayload.participants = selectedTeamMembers.map((tm: any) => ({
          name: tm.label || tm.name,
          email: tm.email,
          participant_id: tm.value,
          participant_type: 'user',
        }));
      } else {
        // For normal meetings, use stakeholders
        basePayload.participants = mapParticipants(selectedParticipants);
      }
    }

    // Add file or notes
    if (notes.trim().length > 0) {
      setSelectedFile(null);
      basePayload.minutes_of_meeting = notes.trim();
      payload = basePayload;
    } else {
      basePayload.file = selectedFile;
      payload = basePayload;
    }

    try {
      let response: any;
      // Make sure we have either a file or notes
      if (!uploadTransriptModalOpen?.isEdit && !selectedFile && !notes.trim()) {
        throw new Error('Please provide either a transcript file or notes');
      }

      if (uploadTransriptModalOpen?.isEdit) {
        response = await updateMeeting.mutateAsync({
          id: uploadTransriptModalOpen?.meeting?._id,
          ...payload,
        });
      } else if (selectedFile) {
        response = await uploadTranscriptMutation.mutateAsync(payload);
      } else if (notes.trim()) {
        response = await uploadMeetingNotesMutation.mutateAsync(payload);
      } else {
        throw new Error('Invalid form state');
      }
      if (!response || (!response.data && !response.status)) {
        throw new Error('No response received from server');
      }

      const responseData = response.data || response;
      if (
        responseData.status === 200 ||
        responseData.status === 201 ||
        response.status === 200 ||
        response.status === 201
      ) {
        // Track the event
        trackUploadTranscriptEvent(MIXPANEL_EVENTS.UPLOAD_TRANSCRIPT, payload);
        // Add meeting to query cache immediately to show in the list
        // Reset the modal
        setUploadTransriptModalOpen({
          meeting: {},
          status: false,
          isEdit: false,
        });

        // Update status and show success message
        setFileUploadStatus('done');
        toast.success(
          uploadTransriptModalOpen?.isEdit
            ? 'Meeting updated successfully.'
            : 'Meeting created successfully.'
        );
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      trackEvent(MIXPANEL_EVENTS.UPLOAD_TRANSCRIPT, {
        success: false,
        error: err?.toString(),
        message: err?.message,
        environment: process.env.NODE_ENV,
        org_id: localStorage.getItem('org_id'),
      });
      setFileUploadStatus('');
      toast.error(err?.response?.data?.message || 'An error occurred');
    }
  };

  const customStyles: StylesConfig<CustomerOption> = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      minHeight: '40px',
      borderColor: '#D1D5DB',
      boxShadow: 'none',

      borderRadius: '8px',
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      color: '#637083',
      '&:hover': {
        borderColor: '#D1D5DB',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#637083',
      padding: '8px',
      '&:hover': {
        color: '#637083',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#F3F4F6'
        : state.isFocused
          ? '#F9FAFB'
          : 'transparent',
      color: '#111827',
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: '16px',
      lineHeight: '24px',
      '&:hover': {
        backgroundColor: '#F9FAFB',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#637083',
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: '16px',
      lineHeight: '24px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#000000',
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: '24px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#FFFFFF',
      boxShadow:
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '8px',
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    input: (provided) => ({
      ...provided,
      color: '#637083',
      fontFamily: 'Inter',
      fontSize: '16px',
      lineHeight: '24px',
    }),
  };

  useEffect(() => {
    if (uploadTransriptModalOpen?.isEdit) {
      setValue('title', uploadTransriptModalOpen?.meeting?.meeting_name);
      setInternalMeeting(uploadTransriptModalOpen?.meeting?.is_internal_meeting || false);

      if (uploadTransriptModalOpen?.meeting?.customer?.customer_id) {
        setSelectedCustomer({
          value: uploadTransriptModalOpen?.meeting?.customer?.customer_id,
          label: uploadTransriptModalOpen?.meeting?.customer?.customer_name,
          is_prospect: Boolean(uploadTransriptModalOpen?.meeting?.customer?.is_prospect),
        });
      }

      const participants = uploadTransriptModalOpen?.meeting?.participants || [];

      // Check if it's an internal meeting by checking for user_id in participants
      if (uploadTransriptModalOpen?.meeting?.is_internal_meeting) {
        setSelectedTeamMembers(
          participants.map((ele: any) => ({
            value: ele.user_id || ele.email,
            label: ele.name,
            name: ele.name,
            email: ele.email,
            participant_id: ele.user_id,
            participant_type: ele.participant_type || 'user',
          }))
        );
      } else {
        setSelectedParticipants(
          participants.map((ele: any) => ({
            value: ele.email,
            label: ele.name,
            participant_id: ele?.participant_id,
            stakeholder_id: ele?.stakeholder_id,
            name: ele.name,
            email: ele.email,
            participant_type: ele.participant_type || 'stakeholder',
          }))
        );
      }
      setNotes(uploadTransriptModalOpen?.meeting?.minutes_of_meeting || '');
      setDatetime(new Date(uploadTransriptModalOpen?.meeting?.datetime));
      setInternalMeeting(uploadTransriptModalOpen?.meeting?.is_internal_meeting || false);
    } else if (uploadTransriptModalOpen?.isFromCustomerJourney) {
      setSelectedCustomer({
        value: uploadTransriptModalOpen?.meeting?.customer?.customer_id,
        label: uploadTransriptModalOpen?.meeting?.customer?.customer_name,
        is_prospect: Boolean(uploadTransriptModalOpen?.meeting?.customer?.is_prospect),
      });
    } else if (uploadTransriptModalOpen?.status && !uploadTransriptModalOpen?.isEdit && !uploadTransriptModalOpen?.isFromCustomerJourney) {
      // Pre-select current user for new meetings when modal opens
      if (!internalMeeting && selectedParticipants.length === 0) {
        const currentUserOption = getCurrentUserAsParticipant();
        if (currentUserOption) {
          setSelectedParticipants([currentUserOption]);
        }
      }
    }
  }, [uploadTransriptModalOpen, existingUsers, userInfo]);

  const createOption = (label: string) => ({
    label,
    value: label.toLowerCase().replace(/\s/g, ''),
    name: label,
    email: label,
  });

  const handleCreate = (inputValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputValue)) {
      return; // Don't show error, just don't create
    }

    const namePart = inputValue.split('@')[0];
    const newOption = {
      label: inputValue,
      value: inputValue,
      name: namePart,
      email: inputValue,
      participant_type: 'external',
    };

    setSelectedParticipants((prev: any) => [...prev, newOption]);
  };

  const trackUploadTranscriptEvent = (type: string, payload: any) => {
    trackEvent(type, {
      meeting_name: payload?.meeting_name,
      customer_id: payload?.customer_id,
      datetime: payload?.datetime,
      participants: payload?.participants,
      environment: process.env.NODE_ENV,
      org_id: localStorage.getItem('org_id'),
    });
  };

  const hasNotes = notes.trim().length > 0;

  // Handle internal meeting toggle change
  const handleInternalMeetingToggle = (checked: boolean) => {
    setInternalMeeting(checked);

    // Clear participants when switching modes
    if (checked) {
      setSelectedParticipants([]);

      // Pre-select current user from userInfo for team members
      if (userInfo?.id) {
        const currentUser = existingUsers?.data?.data?.find(
          (user: any) => user.user?._id === userInfo.id
        );

        if (currentUser?.user) {
          const currentUserOption = {
            email: currentUser.user.email,
            value: currentUser.user._id,
            label: `${currentUser.user.first_name} ${currentUser.user.last_name}`,
            name: `${currentUser.user.first_name} ${currentUser.user.last_name}`,
            participant_type: 'user',
          };
          setSelectedTeamMembers([currentUserOption]);
        }
      }
    } else {
      // Switching back to normal meeting - pre-select current user as participant
      setSelectedTeamMembers([]);
      const currentUserOption = getCurrentUserAsParticipant();
      if (currentUserOption) {
        setSelectedParticipants([currentUserOption]);
      }

      // Customer becomes required again for normal meetings
      if (!selectedCustomer || !selectedCustomer.value) {
        setCustomerErrorMessage('');
      }
    }
  };

  // Check if form is valid for submission
  const isFormValid =
    title?.trim() && // Title is required
    (internalMeeting || selectedCustomer?.value) && // Customer required only for normal meetings
    datetime && // Datetime is required
    (selectedFile || notes.trim().length > 0); // Either file or notes is required

  return (
    <form className="p-2" onSubmit={handleSubmit(onSubmitHandler)}>
      <Modal
        show={uploadTransriptModalOpen?.status}
        onHide={() =>
          setUploadTransriptModalOpen({
            meeting: {},
            status: false,
            isEdit: false,
          })
        }
        id="defaultModal"
        modal-center="true"
        className="fixed transition-all duration-300 ease-in-out z-drawer"
      >
        <div className="fixed w-[550px] max-h-[calc(100vh-64px)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl opacity-100 bg-white shadow-xl flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <input
                {...register('title')}
                type="text"
                name="title"
                disabled={fileUploadStatus === 'uploading'}
                autoFocus
                placeholder="Untitled meeting*"
                className="block flex-1 text-[#111827] outline-none placeholder:text-[18px] placeholder:text-[#9CA3AF] placeholder:font-medium font-medium text-[18px] border-none focus:ring-0 font-inter leading-7"
              />
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setUploadTransriptModalOpen({
                    meeting: {},
                    status: false,
                    isEdit: false,
                  });
                }}
                className="cursor-pointer"
              >
                <X className="w-5 h-5 text-[#111827]" />
              </span>
            </div>
            {errors?.title?.message && (
              <span className="text-[12px] text-[#EF4444] mt-1">
                {errors?.title?.message}
              </span>
            )}
          </div>
          {/* toggle for internal meeting */}
          <div className={`flex items-center px-5 ${uploadTransriptModalOpen?.isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <label htmlFor="internalMeeting" className={`relative inline-flex items-center ${!uploadTransriptModalOpen?.isEdit ? 'cursor-pointer' : ''}`}>
              <input
                type="checkbox"
                id="internalMeeting"
                className="sr-only peer"
                checked={internalMeeting}
                disabled={fileUploadStatus === 'uploading' || uploadTransriptModalOpen?.isEdit}
                onChange={(e) => handleInternalMeetingToggle(e.target.checked)}
              />
              <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[12.8px] after:w-[12.8px] after:transition-all peer-checked:bg-[#3B82F6]"></div>
              <span className="ml-3 text-[14px] font-medium text-[#414E62]">Internal meeting</span>
            </label>
          </div>
          {/* Scrollable Middle Content */}
          <div className="scroll flex-grow overflow-y-auto overflow-x-hidden px-5 pt-5">
            {/* Customer and Start Time */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[14px] font-medium text-[#111827] mb-2 font-inter leading-5">
                  Customer {internalMeeting ? '' : '*'}
                </label>
                <Select
                  styles={customStyles}
                  options={options}
                  isSearchable={true}
                  isDisabled={
                    fileUploadStatus === 'uploading' ||
                    uploadTransriptModalOpen?.isEdit ||
                    uploadTransriptModalOpen?.isFromCustomerJourney
                  }
                  isMulti={false}
                  placeholder="Select"
                  value={selectedCustomer}
                  onChange={handleChange}
                  formatOptionLabel={(option: CustomerOption) => (
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="truncate">{option.label}</span>
                      {option?.is_prospect ? (
                        <span className="inline-flex items-center px-1 py-0.5 rounded-full border border-[#1A75FF] text-[#1A75FF] text-[9px] leading-[10px] font-medium">
                          Prospect
                        </span>
                      ) : null}
                    </div>
                  )}
                  noOptionsMessage={() => 'No customer found'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  components={{
                    DropdownIndicator: (props) => {
                      // Show X icon if internal meeting is on and customer is selected
                      if (internalMeeting && selectedCustomer && selectedCustomer.value && !uploadTransriptModalOpen?.isEdit) {
                        return (
                          <div
                            {...props.innerProps}
                            className="p-2 text-[#637083] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearCustomer();
                            }}
                          >
                            <X size={20} />
                          </div>
                        );
                      }
                      // Show default chevron
                      return (
                        <div {...props.innerProps} className="p-2 text-[#637083]">
                          <ChevronDown size={20} />
                        </div>
                      );
                    },
                  }}
                />
                {customerErrorMessage && (
                  <span className="text-[12px] text-[#EF4444] mt-1 block">
                    {customerErrorMessage}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#111827] mb-2 font-inter leading-5">
                  Start time*
                </label>
                <div className="relative">
                  <Flatpickr
                    options={{
                      dateFormat: 'M d, Y h:i K',
                      enableTime: true,
                    }}
                    disabled={fileUploadStatus === 'uploading'}
                    onChange={(value: any) => setDatetime(value[0])}
                    value={datetime}
                    placeholder="Select"
                    className="w-full px-3 py-[7px] text-[16px] rounded-[8px] border border-[#D1D5DB] placeholder:text-[#637083] text-black focus:outline-none focus:border-[#D1D5DB] focus:ring-0 font-inter font-normal leading-6 "
                  />
                  <ChevronDown
                    size={20}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#637083] pointer-events-none"
                  />
                </div>
                {timeErrorMessage && (
                  <span className="text-[12px] text-[#EF4444] mt-1 block">
                    {timeErrorMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Upload Section */}
            {!uploadTransriptModalOpen?.isEdit && (
              <div className="mb-5">
                <div
                  className={`rounded-[12px] h-[204px] items-center flex w-full justify-center text-center bg-[#F9FAFB] border border-dashed ${hasNotes
                    ? 'border-[#E5E7EB] opacity-50 cursor-not-allowed'
                    : errorMessage
                      ? 'border-[#EF4444]'
                      : 'border-[#E5E7EB] hover:border-[#D1D5DB] cursor-pointer'
                    } transition`}
                  onDragOver={(e) => {
                    if (!hasNotes) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e) => {
                    if (hasNotes) return;
                    e.preventDefault();
                    handleDrop(e);
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    id="fileInput"
                    onChange={(e) => handleFileChange(e)}
                    accept=".txt,.pdf,.vtt,.docx"
                    disabled={!!selectedFile || hasNotes}
                  />
                  {fileUploadStatus !== 'uploading' ? (
                    <label
                      htmlFor={hasNotes ? '' : 'fileInput'}
                      className={`${hasNotes ? 'cursor-not-allowed' : 'cursor-pointer'
                        } items-center flex flex-col w-full px-4`}
                    >
                      <span className="text-[#9CA3AF]">
                        <UploadCloudIcon />
                      </span>
                      <p className="text-[#4B5563] mt-[12px] text-[14px] font-medium font-inter">
                        Drag and drop transcript here
                      </p>
                      <p className="text-[13px] pt-[6px] text-[#6B7280] font-inter">
                        Supported format : TXT, PDF, or VTT, Max 5 MB
                      </p>
                      {!selectedFile?.name && (
                        <p className="text-[#3B82F6] text-[14px] font-medium mt-[8px] font-inter">
                          Select file
                        </p>
                      )}
                      {selectedFile?.name && (
                        <span className="flex gap-2 items-center pt-[8px] text-[#111827] text-[14px]">
                          {selectedFile?.name}
                          <span
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                          >
                            <X size={16} className="text-[#EF4444]" />
                          </span>
                        </span>
                      )}
                    </label>
                  ) : (
                    <div className="items-center flex flex-col w-full">
                      <p className="text-[14px] font-medium text-[#111827]">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[13px] pt-[8px] text-[#6B7280]">
                        Uploading
                      </p>
                      <div className="bg-[#E5E7EB] mt-[12px] w-[280px] h-[6px] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3B82F6] rounded-full transition-all"
                          style={{
                            width: `${uploadProgress?.percent}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                {errorMessage && (
                  <span className="text-[12px] text-[#EF4444] mt-1 block">
                    {errorMessage}
                  </span>
                )}
              </div>
            )}

            {/* Or Divider */}
            {!uploadTransriptModalOpen?.isEdit && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                <span className="text-[14px] text-[#6B7280] font-normal font-inter">
                  Or
                </span>
                <div className="flex-1 h-px bg-[#E5E7EB]"></div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-[14px] font-medium text-[#111827] mb-2 font-inter leading-5">
                Notes{' '}
                <span className="text-[#6B7280] font-normal">
                  (Only for reference, no analysis will be done)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (e.target.value.trim().length > 0 && selectedFile) {
                    setSelectedFile(null);
                  }
                }}
                placeholder="Add meeting notes here"
                className={`w-full min-h-[120px] px-3 py-2.5 text-[16px] rounded-[12px] border border-[#D1D5DB] placeholder:text-[#637083] text-[#111827] focus:outline-none focus:border-[#D1D5DB] focus:ring-0 resize-none font-inter font-normal leading-6 ${selectedFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={fileUploadStatus === 'uploading' || !!selectedFile}
              />
            </div>

            {/* Participants - Show based on internal meeting toggle */}
            {!internalMeeting ? (
              // Normal meeting - Select participants (stakeholders)
              <div className="mb-5 w-[502px] h-[66px] gap-[6px]">
                <label className="block text-[14px] font-medium text-[#111827] mb-[6px] font-inter leading-5">
                  <span>Participants </span><span className='text-[#6B7280] font-normal'>(Select name or enter email address)</span>
                </label>
                <CreatableSelect
                  isMulti
                  menuPlacement="top"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      borderRadius: '8px',
                      borderColor: '#D1D5DB',
                      boxShadow: 'none',
                      fontFamily: 'Inter',
                      '&:hover': {
                        borderColor: '#D1D5DB',
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#637083',
                      fontSize: '16px',
                      fontWeight: '400',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#374151',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#637083',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      maxHeight: '230px',
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '220px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#F3F4F6'
                        : state.isFocused
                          ? '#F3F4F6'
                          : 'transparent',
                      color: '#111827',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      },
                    }),
                  }}
                  onCreateOption={handleCreate}
                  placeholder=""
                  options={participantsOptions}
                  value={selectedParticipants}
                  onChange={handleParticipantChange}
                  formatCreateLabel={(inputValue) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(inputValue)) {
                      return (
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-[#3B82F6]">+ Add email:</span>
                          <span className="text-[#111827]">{inputValue}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                  isValidNewOption={(inputValue) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(inputValue);
                  }}
                  isDisabled={
                    fileUploadStatus === 'uploading' ||
                    uploadTransriptModalOpen?.isEdit
                  }
                />
                {participantsErrorMessage && (
                  <span className="text-[12px] text-[#EF4444] mt-1 block">
                    {participantsErrorMessage}
                  </span>
                )}
              </div>
            ) : (
              // Internal meeting - Select team members (users)
              <div className="mb-5 w-[502px] gap-[6px]">
                <label className="block text-[14px] font-medium text-[#111827] mb-[6px] font-inter leading-5">
                  Team members
                </label>
                <Select
                  isMulti
                  menuPlacement="top"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      borderRadius: '8px',
                      borderColor: '#D1D5DB',
                      boxShadow: 'none',
                      fontFamily: 'Inter',
                      '&:hover': {
                        borderColor: '#D1D5DB',
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#637083',
                      fontSize: '16px',
                      fontWeight: '400',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#374151',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#637083',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      maxHeight: '230px',
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '220px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#F3F4F6'
                        : state.isFocused
                          ? '#F3F4F6'
                          : 'transparent',
                      color: '#111827',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'Inter',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      },
                    }),
                  }}
                  placeholder="Select team members"
                  options={teamMembersOptions}
                  value={selectedTeamMembers}
                  onChange={handleTeamMemberChange}
                  isLoading={isLoadingUsers}
                  noOptionsMessage={() => 'No team members found'}
                  isDisabled={
                    fileUploadStatus === 'uploading' ||
                    uploadTransriptModalOpen?.isEdit
                  }
                  components={{
                    DropdownIndicator: (props) => (
                      <div {...props.innerProps} className="p-2 text-[#637083]">
                        <ChevronDown size={20} />
                      </div>
                    ),
                  }}
                />
                {participantsErrorMessage && (
                  <span className="text-[12px] text-[#EF4444] mt-1 block">
                    {participantsErrorMessage}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Fixed Footer - Buttons */}
          <div className="flex-shrink-0 bg-white px-5 py-4 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2.5 text-[14px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-[8px] hover:bg-[#F9FAFB] disabled:opacity-50 transition font-inter"
              disabled={fileUploadStatus === 'uploading'}
              onClick={(e) => {
                e.preventDefault();
                setUploadTransriptModalOpen({
                  meeting: {},
                  status: false,
                  isEdit: false,
                });
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={fileUploadStatus === 'uploading' || !isFormValid}
              className="px-4 py-2.5 text-[14px] font-medium text-white bg-[#3B82F6] border border-[#3B82F6] rounded-[8px] hover:bg-[#2563EB] disabled:opacity-50 transition font-inter"
            >
              {uploadTransriptModalOpen?.isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
