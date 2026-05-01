import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import Synthesis from '../../../customers/[id]/metrics/synthesis';
import ConfirmationPopUp from './confirmationPopUp';
import UnsavedDetails from './unsavedDetails';
import SavedDetails from './savedDetails';
import ReadTranscriptModal from './readTranscriptModal';
import StakholderDetailsModal from './stakholderDetailsModa';
import Modal from '../../../../../common/Modal';
import ComposeEmail from '../../../emails/components/ComposeEmailModal';
import { UserIcon2, MeetingMembersdividerLineIcon } from '../../../../../app/assests/icons/icons';
import { useDeleteMeeting, useUpdateAllSuggestionMeeting, useUpdateMeeting, useUpdateSingleSuggestionMeeting } from '../../../../../services/mutations/communicationMutations';
import { apiRequest } from '../../../../../common/api-request';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';


export function getInitials(name: string): string {
  const nameArray = name?.trim()?.split(' ');
  const initials = nameArray?.map((word) => word[0]?.toUpperCase());
  const initial = initials?.join('');
  return initial == undefined ||
    (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
    ? 'NA'
    : initial;
}


export default function MeetingDetails({
  meetingDetails,
  confirmWith,
  setConfirmWith,
  setUploadTransriptModalOpen,
  // allCustomers,
}: any) {
  dayjs.extend(relativeTime);
  const [readTranscriptModalOpen, setReadTranscriptModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [momText, setMomText] = useState(meetingDetails?.minutes_of_meeting);
  const [dummy, setDummy] = useState(0);
  const [suggetionData, setSuggetionData] = useState<any>();
  const updateMeetingSUggetion = useUpdateSingleSuggestionMeeting();
  const updatAllMeetingSuggestion = useUpdateAllSuggestionMeeting();
  const [editMinOfMeeting, setEditMinOfMeeting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showToErrorModal, setShowToErrorModal] = useState<boolean>(false);

  const [stakeholdertailModalOpen, setStakeholdertailModalOpen] = useState<{
    stakeHolder: any;
    status: boolean;
    customer_id?: number | null;
  }>({
    stakeHolder: {},
    status: false,
    customer_id: null,
  });
  const router = useRouter();
  const deleteMeeting = useDeleteMeeting();
  const updateMeeting = useUpdateMeeting();

  const toggle = useCallback(() => {
    setShowCompose((prevShow) => !prevShow);
  }, []);

  const childAsyncFunctionRef = useRef<(() => void) | null>(null);
  const handleChildFunctionReady = (fn: () => void) => {
    childAsyncFunctionRef.current = fn;
  };
  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };
  const handleYes = async () => {
    try {
      const response = await deleteMeeting.mutateAsync({
        id: meetingDetails?._id,
        keepSuggestion: confirmWith,
      });
      if (response?.status == 200 || response?.status == 201) {
        toast.success('Meeting deleted successfully.');
        setConfirmationModalOpen(false);
        router.back();
      }
    } catch (error: any) {
      toast.error(error?.response?.message);
    }
  };
  useEffect(() => {
    setMomText(meetingDetails?.minutes_of_meeting);
  }, [meetingDetails]);
  const { data: meetingSuggestion, isLoading } = useQuery({
    queryKey: ['meetingSuggetions', meetingDetails?._id],
    queryFn: () =>
      apiRequest({
        url: `/api/app-service/v1/customer-meeting/${meetingDetails?._id}`,
      }),
  });

  useEffect(() => {
    if (meetingSuggestion) {
      setSuggetionData(meetingSuggestion?.data);
    }
  }, [meetingSuggestion]);
  async function deleteInsight(id: string, action?: string) {
    suggetionData.insightData = suggetionData?.insightData.map((insight: any) =>
      insight._id === id ? { ...insight, is_deleted: true } : insight
    );
    try {
      await updateMeetingSUggetion.mutateAsync({ id, action });
    } catch (e) { }
    setDummy(dummy + 1);
  }


  async function deleteTask(id: string, action?: string) {
    suggetionData.taskData = suggetionData?.taskData.map((task: any) =>
      task._id === id ? { ...task, is_deleted: true } : task
    );
    try {
      await updateMeetingSUggetion.mutateAsync({ id, action });
    } catch (e) { }
    setDummy(dummy + 1);
  }


  async function handleAction(action: string) {
    try {
      const response: any = await updatAllMeetingSuggestion.mutateAsync({
        id: meetingDetails?._id,
        action,
      });
      if (response?.status == 200 || response?.status == 201) {
        toast.success(response?.data?.message);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message);
    }
  }

  async function handleMOM() {
    try {
      const response = await updateMeeting.mutateAsync({
        id: meetingDetails?._id,
        minutes_of_meeting: momText,
      });
      if (response?.status === 200 || response?.status === 201) {
        toast?.success('Minutes of meeting updated successfully');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message);
    }
  }
  return (
    <div className="w-[1200px] mx-auto pt-[22px]">
      <div className="text-[16px] flex justify-between items-center">
        <Link href={`/app/communication/meetings`}>
          <span className="font-medium text-[#202B37] flex item-center gap-[13px] cursor-pointer">
            <span className="flex items-center">
              <ChevronLeft size={16} />
            </span>
            Back
          </span>
        </Link>
        <span className="flex gap-4 text-[#E4E7EC]">
          <span
            className="text-[#202B37] cursor-pointer"
            onClick={() =>
              setUploadTransriptModalOpen({
                meeting: meetingDetails,
                status: true,
                isEdit: true,
              })
            }
          >
            Edit
          </span>
          |
          <span
            className="text-[#202B37] cursor-pointer"
            onClick={() => {
              setConfirmationModalOpen(true);
            }}
          >
            Delete
          </span>
        </span>
      </div>
      <div className="pt-[32px] items-center flex flex-col ">
        <span className="text-[28px] font-medium text-[#202B37]">
          {meetingDetails?.meeting_name}
        </span>
        <span className="flex items-center text-[14px] text-[#637083] pt-[6px]">
          {
            (meetingDetails?.is_internal_meeting && <>
              <span>Internal</span> <span className='px-2'><MeetingMembersdividerLineIcon /></span>
            </>
            )
          }
          <span>{dayjs(meetingDetails?.datetime)?.format('DD MMM, YYYY hh:MM A')}</span>
          {meetingDetails?.customer?.customer_name && <span className='px-2'><MeetingMembersdividerLineIcon /></span>}
          {meetingDetails?.customer?.customer_name && <span>{meetingDetails?.customer?.customer_name}</span>}
        </span>
      </div>
      <div className="pt-[40px] pb-[12px]">
        {meetingDetails?.is_internal_meeting ? (
          // Internal Meeting - Show all participants in comma-separated list
          <div className="flex justify-center items-center text-[12px] text-[#202B37]">
            <span className="flex flex-wrap justify-center">
              {meetingDetails?.participants
                ?.sort((a: any, b: any) => {
                  const aId = a?.stakeholder_id || a?.participant_id || '';
                  const bId = b?.stakeholder_id || b?.participant_id || '';
                  return aId.localeCompare(bId);
                })
                .map((participant: any, index: number) => (
                  <span
                    key={index}
                    className="cursor-pointer flex"
                    onClick={() =>
                      setStakeholdertailModalOpen({
                        stakeHolder: participant,
                        status: true,
                        customer_id: meetingDetails?.customer_id,
                      })
                    }
                  >
                    <u>
                      {participant?.name
                        ? participant?.name
                        : participant?.email}
                    </u>
                    {index < meetingDetails?.participants.length - 1 && (
                      <span>, </span>
                    )}
                    &nbsp;
                  </span>
                ))}
            </span>
          </div>
        ) : (
          // External Meeting - Show first participant as card + rest as list
          <>
            {(() => {
              const sortedParticipants = meetingDetails?.participants?.sort((a: any, b: any) => {
                const aId = a?.stakeholder_id || a?.participant_id || '';
                const bId = b?.stakeholder_id || b?.participant_id || '';
                return aId.localeCompare(bId);
              });

              const cardParticipant = sortedParticipants?.find(
                (p: any) => p?.participant_type === 'user' || p?.participant_type === 'stakeholder'
              );

              const listParticipants = sortedParticipants?.filter(
                (p: any) => p !== cardParticipant
              );

              return (
                <>
                  {cardParticipant && (
                    <div className="flex justify-center items-center gap-[9px]">
                      <div
                        className="flex items-center h-[46px] border border-[#E4E7EC] rounded-[150px] pl-[6px] pr-[18px] cursor-pointer"
                        onClick={() =>
                          setStakeholdertailModalOpen({
                            stakeHolder: cardParticipant,
                            status: true,
                            customer_id: meetingDetails?.customer_id,
                          })
                        }
                      >
                        {cardParticipant?.stakeholder_id ? (
                          <img
                            src={`/api/app-service/v1/picture/customer_stakeholder_master/${cardParticipant?.stakeholder_id
                              }?org_id=${localStorage?.getItem(
                                'org_id'
                              )}&initials=${getInitials(
                                cardParticipant?.name ? cardParticipant?.name : cardParticipant?.email
                              )}`}
                            alt={``}
                            className="w-[36px] h-[36px] rounded-full "
                          />
                        ) : (
                          <div className="w-[36px] h-[34px]  rounded-full items-center justify-center ">
                            <UserIcon2 />
                          </div>
                        )}
                        <span className="text-[14px] text-[#637083] landscape:ml-2 leading-4">
                          <span className="text-[16px] font-medium  text-[#344051]">
                            {cardParticipant?.name}
                          </span>
                          <br />
                          <span>{cardParticipant?.stance}</span>{' '}
                        </span>
                      </div>
                    </div>
                  )}

                  {listParticipants && listParticipants.length > 0 && (
                    <div className="flex justify-center items-center pt-[20px] text-[12px] text-[#202B37]">
                      <span className="flex flex-wrap justify-center">
                        {cardParticipant && 'and\u00A0'}
                        {listParticipants.map((participant: any, index: number) => (
                          <span
                            key={index}
                            className="cursor-pointer flex"
                            onClick={() =>
                              setStakeholdertailModalOpen({
                                stakeHolder: participant,
                                status: true,
                                customer_id: meetingDetails?.customer_id,
                              })
                            }
                          >
                            <u>
                              {participant?.name
                                ? participant?.name
                                : participant?.email}
                            </u>
                            {index < listParticipants.length - 1 && (
                              <span>, </span>
                            )}
                            &nbsp;
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
      {meetingDetails?.minutes_of_meeting && (
        <div className="p-[24px] border border-[#F2F4F7] shadow-lg rounded-[20px]">
          <div className="flex justify-between">
            <span className="text-[16px] font-medium text-[#141C24]">
              Meeting notes
            </span>
            {!editMinOfMeeting && (
              <span className="text-[14px] text-[#141C24] flex gap-[16px]">
                <span
                  className="cursor-pointer"
                  onClick={() => setEditMinOfMeeting(true)}
                >
                  Edit
                </span>
                <span className="text-[#202B37]"></span>
                <span className="cursor-pointer" onClick={toggle}>
                  Send email
                </span>
              </span>
            )}
          </div>
          <div className="text-[14px] text-[#141C24] pt-[20px]">
            {!editMinOfMeeting ? (
              <ReactMarkdown className="max-w-full">
                {meetingDetails?.minutes_of_meeting}
              </ReactMarkdown>
            ) : (
              <div className="h-full">
                <textarea
                  className="form-input h-[288px] scroll overflow-auto px-[16px] py-[20px] text-[#141C24] text-[16px] border border-[#E4E7EC] rounded-[6px] dark:border-zink-500 focus:outline-none  disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200 w-full"
                  value={momText}
                  onChange={(e) => setMomText(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2 pt-[12px]">
                  <button
                    className={`btn border-[#637083] text-[#637083] text-[14px] font-semibold disabled:opacity-50`}
                    onClick={() => {
                      setEditMinOfMeeting(false);
                      setMomText(meetingDetails?.minutes_of_meeting);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleMOM();
                      setEditMinOfMeeting(false);
                    }}
                    className={`btn border-[#3B82F6] font-semibold  ${'bg-[#3B82F6] text-white'} disabled:opacity-50`}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {suggetionData?.status === 'unsaved' ? (
        <div className="mt-[40px] border border-[#EAB308] rounded-[20px] overflow-hidden">
          <UnsavedDetails
            data={suggetionData}
            setDummy={setDummy}
            handleAction={handleAction}
            deleteInsight={deleteInsight}
            deleteTask={deleteTask}
          // allCustomers={allCustomers}
          />
        </div>
      ) : (
        <div className="mt-[40px]  overflow-hidden">
          <SavedDetails
            data={suggetionData}
            setDummy={setDummy}
            deleteInsight={deleteInsight}
            deleteTask={deleteTask}
          />
        </div>
      )}
      {showCompose ? (
        <Modal
          Content={
            <ComposeEmail
              toggle={toggle}
              setShowToErrorModal={setShowToErrorModal}
              setShowConfirmModal={setShowConfirmModal}
              onChildFunctionReady={handleChildFunctionReady}
              communicationData={{
                type: 'meeting',
                meetingDetails: meetingDetails,
                mom_html: marked(meetingDetails?.minutes_of_meeting),
              }}
            />
          }
          size=""
          backBg="!border-none !shadow-none"
          composeEmail={true}
        ></Modal>
      ) : (
        <></>
      )}
      {confirmationModalOpen && (
        <ConfirmationPopUp
          header={'Are you sure to delete this meeting?'}
          modalOpen={confirmationModalOpen}
          handleCancel={handleCancel}
          handleYes={handleYes}
          yesText={'Delete meeting'}
          title={''}
          setConfirmWith={setConfirmWith}
          confirmWith={confirmWith}
          data={{
            insight: meetingDetails?.insightInstance,
            task: meetingDetails?.task,
          }}
        />
      )}
      {readTranscriptModalOpen && (
        <ReadTranscriptModal
          readTranscriptModalOpen={readTranscriptModalOpen}
          setReadTranscriptModalOpen={setReadTranscriptModalOpen}
          meetingName={meetingDetails?.meeting_name}
          transcriptContent={meetingDetails?.transcript_content}
        />
      )}
      {stakeholdertailModalOpen?.status && (
        <StakholderDetailsModal
          stakeholdertailModalOpen={stakeholdertailModalOpen}
          setStakeholdertailModalOpen={setStakeholdertailModalOpen}
        />
      )}
    </div>
  );
}



