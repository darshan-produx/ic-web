import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { getConversationById } from '../../../api/emails/emails';
import dayjs from 'dayjs';
import ComposeEmail from './ComposeEmailModal';
import Modal from '../../../../common/components/Modal';
import {
  useDeleteEmail,
  useDownloadAttachment,
} from '../../../../services/mutations/emailSettingMutations';
import { toast } from 'react-toastify';
import { Download } from 'lucide-react';
import fileDownload from 'js-file-download';
import { AxiosResponse } from 'axios';
import ConfirmationModalForEmail from '../../../../common/components/Modal/confirmationModalForEmail';

export default function Conversation(props: {
  selectedEmail: any;
  allCustomers: any[];
  stakeholdersArr?: any[];
  setStopEmailSettingOnApiCall: any;
  stopEmailSettingOnApiCall: boolean;
  userinfo: any;
}) {
  const [openMessageId, setOpenMessageId] = useState<number | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [showReplyAll, setShowReplyAll] = useState(false);
  const [showFwd, setShowFwd] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showToErrorModal, setShowToErrorModal] = useState<boolean>(false);
  const deleteEmailApi = useDeleteEmail();
  const downloadAttachment = useDownloadAttachment();
  const { data: conversations } = useQuery({
    queryKey: ['email-conversation', props?.selectedEmail],
    queryFn: () => getConversationById(props?.selectedEmail?.conversation_id),
    enabled: !!props?.selectedEmail?.conversation_id,
  });
  const [childFunction, setChildFunction] = useState<(() => void) | null>();
  const toggleMessage = (id: number) => {
    setOpenMessageId(openMessageId === id ? null : id);
  };

  function getInitials(id: string) {
    const stakeholders: any[] = [];
    props?.allCustomers?.map((ele: any) => {
      stakeholders?.push(...ele?.stakeholders);
    });
    const stakeholder = stakeholders?.filter((ele: any) => ele?._id == id)[0];
    const nameArray = stakeholder?.name?.trim()?.split(' ');
    const initials = nameArray?.map((word: any) => word[0]?.toUpperCase());
    const initial = initials?.join('');

    return initial == undefined ||
      (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
      ? 'NA'
      : initial;
  }

  const [showAllCC, setShowAllCC] = useState(false);
  const [showAllBCC, setShowAllBCC] = useState(false);

  const renderEmails = (
    emails: any[],
    type: string,
    showAll: boolean,
    setShowAll: (show: boolean) => void
  ) => {
    const maxVisible = 2; // Number of emails to show before truncation
    const emailsLength = emails.length;

    if (emailsLength <= maxVisible || showAll) {
      return (
        <>
          {`${type}: ${emails.map((ele) => ele?.address).join(', ')}`}
          {emailsLength > maxVisible && (
            <span
              className="text-blue-500 cursor-pointer text-[12px]"
              onClick={(e) => {
                e?.stopPropagation();
                setShowAll(false);
              }}
            >
              {' '}
              Show Less
            </span>
          )}
        </>
      );
    }

    return (
      <>
        {`${type}: ${emails
          .slice(0, maxVisible)
          .map((ele) => ele?.address)
          .join(', ')}`}
        {emailsLength > maxVisible && (
          <span
            className="text-blue-500 cursor-pointer text-[12px]"
            onClick={(e) => {
              e?.stopPropagation();
              setShowAll(true);
            }}
          >
            {' '}
            ...+{emailsLength - maxVisible} more
          </span>
        )}
      </>
    );
  };

  function convertBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return bytes + ' bytes';
    }
  }

  const downloadAttachemtn = async (id: string, part: string) => {
    const dataForDownload = { _id: id, part: part };
    try {
      const res: AxiosResponse<Blob> = await downloadAttachment?.mutateAsync(
        dataForDownload
      );

      if (res.data) {
        const contentDisposition = res.headers['content-disposition'];
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : 'downloaded_file';

        fileDownload(res.data, fileName);
      }
    } catch (err: any) {
      // console.log(err?.message);
    }
  };

  useEffect(() => {
    setOpenMessageId(props?.selectedEmail?.email_id);
    setShowFwd(false);
    setShowReply(false);
    setShowReplyAll(false);
  }, [props?.selectedEmail]);

  function getValue(i: any) {
    return i ?? 0;
  }

  useEffect(() => {
    if (showReply || showReplyAll || showFwd) {
      const composeScrollDiv = document.getElementById('composeScrollId');
      if (composeScrollDiv) {
        composeScrollDiv.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [showReply, showReplyAll, showFwd]);

  // const getSvgAsDataUrl = (message: any) => {
  //   const fromData = message?.email_data?.envelope?.from[0];
  //   const name = fromData?.name;
  //   const address = fromData?.address;
  //   const initials = name
  //     ? name.slice(0, 2)
  //     : address
  //     ? address.slice(0, 2)
  //     : 'NA';
  //   const svg = `
  //     <svg
  //       width="40mm"
  //       height="40mm"
  //       viewBox="0 0 40 40"
  //       version="1.1"
  //       xmlns="http://www.w3.org/2000/svg">
  //       <g transform="translate(-35.60495,-4.182745)">
  //         <circle style="fill:#c7c7c7;fill-opacity:1;stroke:none;" cx="55.60495" cy="24.182745" r="20" />
  //         <text xml:space="preserve" style="font-size:16px; font-family:'Inter', sans-serif; font-weight:600; text-anchor:middle; fill:#323232;" x="55.60495" y="29.5">${initials?.toUpperCase()}</text>
  //       </g>
  //     </svg>
  //   `;

  //   return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  // };
  const getSvgAsDataUrl = (name: string | undefined) => {
    const nameArray = name?.trim()?.split(' ');
    const initials = nameArray?.map((word: any) => word[0]?.toUpperCase());
    const initial = initials?.join('');
    const svg = `<svg
                    width="40mm"
                    height="40mm"
                    viewBox="0 0 40 40"
                    version="1.1"
                    id="svg1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:svg="http://www.w3.org/2000/svg">
                      <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(80.64)">
                        <stop offset="0%" style="stopColor:#AF7D4B;stopOpacity:1" />
                        <stop offset="100%" style="stopColor:#B8A07A;stopOpacity:1" />
                      </linearGradient>
                    </defs>
                    <g
                      id="layer1"
                      transform="translate(-35.60495,-4.182745)">
                      <circle
                        style="fill:url(#grad1);fill-opacity:1;stroke:none;"
                        id="circle1"
                        cx="55.60495"
                        cy="24.182745"
                        r="20" />
                      <text
                        xml:space="preserve"
                        style="font-size:16px; font-family:'Inter', sans-serif; font-weight:600; text-anchor:middle; fill:#ffffff;"
                        x="55.60495"
                        y="29.5"
                        id="text1">${initial}</text>
                    </g>
                  </svg> `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };
  const handleChildFunctionReady = (fn: () => void) => {
    setChildFunction(() => fn);
  };
  return (
    <>
      {conversations != undefined &&
      props?.stopEmailSettingOnApiCall == true ? (
        <div className="pl-[30px] h-[calc(100vh-3.375rem)] mr-[9px]">
          <h2 className="py-[24px] font-[500] text-[20px] text-gray-900 border-b-[1px] border-gray-200">
            {conversations?.data?.email_conversation?.subject !== ''
              ? conversations?.data?.email_conversation?.subject
              : '(no subject)'}
          </h2>
          <div className=" h-[calc(100vh-10.5rem)] overflow-y-auto overflow-x-hidden scrollforEmail relative right-[-4px]">
            {conversations?.data?.email_messages?.map((message: any) => (
              <div key={message._id}>
                <div
                  className={`cursor-pointer bg-white py-[24px] ${
                    openMessageId === message._id
                      ? ''
                      : 'border-b-[1px] border-gray-200'
                  }  `}
                  onClick={() => toggleMessage(message._id)}
                >
                  <div className="flex place-items-start gap-[10px]">
                    <div className="w-[44px] h-[44px]">
                      <img
                        src={
                          message?.sender_stakeholder_id
                            ? `/api/app-service/v1/picture/customer_stakeholder_master/${
                                message?.sender_stakeholder_id
                              }?org_id=${localStorage?.getItem(
                                'org_id'
                              )}&initials=${getInitials(
                                message?.sender_stakeholder_id
                              )}&ts=${message?.datetime}`
                            : getSvgAsDataUrl(
                                message.email_data?.envelope?.from[0]?.name !=
                                  '' &&
                                  message.email_data?.envelope?.from[0]
                                    ?.name !== props?.userinfo?.data?.email
                                  ? message.email_data?.envelope?.from[0]?.name
                                  : message.email_data?.envelope?.from[0]
                                      ?.address === props?.userinfo?.data?.email
                                  ? `${props?.userinfo?.data?.first_name} ${props?.userinfo?.data?.last_name}`
                                  : message.email_data?.envelope?.from[0]
                                      ?.address
                              )
                        }
                        className="w-full h-full rounded-full"
                        alt=""
                      />
                    </div>
                    <div className="w-[783px]">
                      <h4 className="font-[500] text-[14px] text-gray-900 flex justify-between">
                        <span>
                          {message.email_data?.envelope?.from[0]?.name != '' &&
                          message.email_data?.envelope?.from[0]?.name !==
                            props?.userinfo?.data?.email
                            ? message.email_data?.envelope?.from[0]?.name
                            : message.email_data?.envelope?.from[0]?.address ===
                              props?.userinfo?.data?.email
                            ? `${props?.userinfo?.data?.first_name} ${props?.userinfo?.data?.last_name}`
                            : message.email_data?.envelope?.from[0]?.address}
                        </span>
                        <span>
                          {' '}
                          <div className="text-[12px] text-gray-400 flex justify-between gap-[12px] mr-2">
                            <span>
                              {dayjs(message.datetime).format(
                                'h:mmA MMM D, YYYY'
                              )}
                            </span>
                            {getValue(
                              message?.email_data?.body_structure?.childNodes?.filter(
                                (ele: any) => ele?.disposition === 'attachment'
                              )?.length
                            ) > 0 ? (
                              <span>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.6663 3.50257V10.9987C11.6663 13.0237 10.0247 14.6654 7.99967 14.6654C5.97463 14.6654 4.33301 13.0237 4.33301 10.9987V3.77647C4.33301 2.42645 5.42742 1.33203 6.77745 1.33203C8.12748 1.33203 9.2219 2.42645 9.2219 3.77647V10.9625C9.2219 11.6375 8.67469 12.1847 7.99967 12.1847C7.32466 12.1847 6.77745 11.6375 6.77745 10.9625V4.43281"
                                    stroke="#97A1AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        </span>
                      </h4>
                      {openMessageId === message._id ? (
                        <>
                          <span className="text-gray-400 text-[12px] font-[400] block">
                            {message?.email_data?.envelope?.to?.length > 0
                              ? `To: ${message?.email_data?.envelope?.to?.map(
                                  (ele: any) => ` ${ele?.address}`
                                )}`
                              : ''}
                          </span>
                          <span className="text-gray-400 text-[12px] font-[400] block">
                            {message?.email_data?.envelope?.cc?.length > 0 &&
                              renderEmails(
                                message?.email_data?.envelope?.cc,
                                'CC',
                                showAllCC,
                                setShowAllCC
                              )}
                          </span>

                          <span className="text-gray-400 text-[12px] font-[400] block">
                            {message?.email_data?.envelope?.bcc?.length > 0 &&
                              renderEmails(
                                message?.email_data?.envelope?.bcc,
                                'BCC',
                                showAllBCC,
                                setShowAllBCC
                              )}
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-gray-400 text-[12px] font-[400] block w-[783px] overflow-hidden text-ellipsis whitespace-nowrap"
                          dangerouslySetInnerHTML={{
                            __html: message.email_data?.body_text,
                          }}
                        ></span>
                      )}
                    </div>
                  </div>
                </div>
                {openMessageId === message._id && (
                  <div className="border-b-[1px] border-gray-200 pb-[24px] pl-[55px]">
                    {message?.folder === 'INBOX' && (
                      <div
                        className={`flex ${
                          message?.priority ||
                          message?.urgency ||
                          message?.emotion
                            ? 'mb-[20px]'
                            : ''
                        }  gap-[12px] text-[16px] font-[600]`}
                      >
                        {message?.priority ? (
                          <div className="bg-[#D9F2E5] text-[#249782] text-center rounded-[6px]  w-[120px] px-[10px] py-[4px]">
                            <span className="">Priority</span>{' '}
                            {Math.round(message?.priority)}
                            /5
                          </div>
                        ) : (
                          ''
                        )}

                        {message?.urgency ? (
                          <div className="bg-[#FCCFCF] text-[#EF4444] text-center rounded-[6px]  w-[120px] px-[10px] py-[4px]">
                            <span className="">Urgency</span>{' '}
                            {Math?.round(message?.urgency)}/5
                          </div>
                        ) : (
                          ''
                        )}

                        {message?.emotion ? (
                          <div className="bg-[#FFEECC] text-[#EAB308] text-center rounded-[6px]  w-[120px] px-[10px] py-[4px]">
                            <span className="">Emotion</span>{' '}
                            {Math?.round(message?.emotion)}/5
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                    <p
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: message.email_data?.body_html,
                      }}
                    ></p>
                    {/* attachments */}
                    <div>
                      {message?.email_data?.body_structure?.childNodes?.map(
                        (ele: any, index: any) =>
                          ele?.disposition == 'attachment' ? (
                            <div
                              key={index}
                              onClick={() =>
                                downloadAttachemtn(message?._id, ele?.part)
                              }
                              className="flex w-[30%] my-[24px] justify-between px-[12px] py-[8px] bg-gray-50 rounded-[6px] cursor-pointer"
                            >
                              <div className="w-[90%]">
                                <span
                                  className="block text-gray-500 font-[400] text-[14px] w-[190px]  overflow-hidden text-ellipsis whitespace-nowrap"
                                  title={ele?.parameters?.name}
                                >
                                  {ele?.parameters?.name}
                                </span>
                                <span className="text-sm text-gray-400 text-[14px]">
                                  {convertBytes(ele?.size)}
                                </span>
                              </div>
                              <div
                                className="mt-[2px] cursor-pointer w-[10%]"
                                title="Download"
                              >
                                <Download className="w-[20px] h-[20px] text-gray-500 float-end" />
                              </div>
                            </div>
                          ) : (
                            <span key={index}></span>
                          )
                      )}
                    </div>
                    {showReply || showReplyAll || showFwd ? (
                      ''
                    ) : (
                      <div className="flex items-center gap-[16px] mt-[24px] flex-grow">
                        <button
                          onClick={() => {
                            setShowFwd(false);
                            setShowReplyAll(false);
                            setShowReply(true);
                          }}
                          className={`flex items-center cursor-pointer px-[12px] text-gray-900 py-[9.5px] text-[14px] font-[500] rounded-[6px] border border-gray-500 `}
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setShowFwd(false);
                            setShowReply(false);
                            setShowReplyAll(true);
                          }}
                          className={`flex items-center cursor-pointer px-[12px] text-gray-900 py-[9.5px] text-[14px] font-[500] rounded-[6px] border border-gray-500 `}
                        >
                          Reply all
                        </button>
                        <button
                          onClick={() => {
                            setShowReply(false);
                            setShowReplyAll(false);
                            setShowFwd(true);
                          }}
                          className={`flex items-center cursor-pointer px-[12px] text-gray-900 py-[9.5px] text-[14px] font-[500] rounded-[6px] border border-gray-500 `}
                        >
                          Forward
                        </button>
                        <button
                          onClick={() => setDeleteEmail(true)}
                          className={` cursor-pointer px-[12px] text-[#EF4444] py-[9.5px] text-[14px] font-[500] rounded-[6px] border border-[#FCCFCF] ml-auto mr-2`}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    <div id="composeScrollId">
                      {props?.userinfo?.data && showReply ? (
                        <ComposeEmail
                          toggle={() => {
                            setShowReply(false);
                          }}
                          // stakeholdersArr={props?.stakeholdersArr}
                          type={'Reply'}
                          data={conversations?.data}
                          openMessageId={openMessageId}
                          userInfo={props?.userinfo?.data}
                          setShowToErrorModal={setShowToErrorModal}
                          setShowConfirmModal={setShowConfirmModal}
                          onChildFunctionReady={handleChildFunctionReady}
                        />
                      ) : (
                        ''
                      )}
                      {props?.userinfo?.data && showReplyAll ? (
                        <ComposeEmail
                          toggle={() => {
                            setShowReplyAll(false);
                          }}
                          // stakeholdersArr={props?.stakeholdersArr}
                          type={'Reply all'}
                          data={conversations?.data}
                          openMessageId={openMessageId}
                          userInfo={props?.userinfo?.data}
                          setShowToErrorModal={setShowToErrorModal}
                          setShowConfirmModal={setShowConfirmModal}
                          onChildFunctionReady={handleChildFunctionReady}
                        />
                      ) : (
                        ''
                      )}
                      {props?.userinfo?.data && showFwd ? (
                        <ComposeEmail
                          toggle={() => {
                            setShowFwd(false);
                          }}
                          // stakeholdersArr={props?.stakeholdersArr}
                          type={'Forward'}
                          data={conversations?.data}
                          openMessageId={openMessageId}
                          userInfo={props?.userinfo?.data}
                          setShowToErrorModal={setShowToErrorModal}
                          setShowConfirmModal={setShowConfirmModal}
                          onChildFunctionReady={handleChildFunctionReady}
                        />
                      ) : (
                        ''
                      )}
                    </div>
                    {deleteEmail ? (
                      <React.Fragment>
                        <Modal
                          show={deleteEmail}
                          onHide={() => setDeleteEmail(false)}
                          id="deleteModal"
                          modal-center="true"
                          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
                          dialogClassName="w-screen md:w-[25rem] bg-white shadow rounded-md dark:bg-zink-600"
                        >
                          <Modal.Header
                            className="flex items-center justify-between p-4  border-slate-200 dark:border-zink-500"
                            closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
                          >
                            <Modal.Title className="text-lg font-medium text-[#202B37]">
                              Do you want to delete the email?
                            </Modal.Title>
                          </Modal.Header>

                          <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                className="bg-white px-4 py-0.5 text-gray-500 btn border-gray-500 font-semibold "
                                onClick={() => setDeleteEmail(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-white bg-red-500 font-semibold border-red-500 btn hover:text-white hover:bg-red-600 hover:border-red-600 focus:text-white focus:bg-red-600 focus:border-red-600 focus:ring focus:ring-red-100 active:text-white active:bg-red-600 active:border-red-600 active:ring active:ring-red-100 dark:ring-custom-400/20"
                                onClick={async () => {
                                  try {
                                    const res =
                                      await deleteEmailApi?.mutateAsync(
                                        openMessageId
                                      );
                                    if (
                                      res?.status == 200 ||
                                      res?.status == 201
                                    ) {
                                      props?.setStopEmailSettingOnApiCall(
                                        false
                                      );
                                      toast?.success('Email deleted');
                                    }
                                  } catch (err: any) {
                                    toast?.error(err?.message);
                                  }
                                  setDeleteEmail(false);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </Modal.Footer>
                        </Modal>
                      </React.Fragment>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ripple">
          <svg
            width="900"
            height="948"
            viewBox="0 0 900 948"
            fill="none"
            className=""
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.5"
              y1="-2.18557e-08"
              x2="0.500041"
              y2="949"
              stroke="#E4E7EC"
            />
            <rect x="30" y="24" width="850" height="21" rx="6" fill="#F9FAFB" />
            <rect x="30" y="57" width="86" height="21" rx="6" fill="#F9FAFB" />
            <rect x="128" y="57" width="86" height="21" rx="6" fill="#F9FAFB" />
            <rect x="226" y="57" width="86" height="21" rx="6" fill="#F9FAFB" />
            <line x1="30" y1="101.5" x2="880" y2="101.5" stroke="#F9FAFB" />
            <rect
              x="30"
              y="126"
              width="44"
              height="45"
              rx="22"
              fill="#F9FAFB"
            />
            <rect
              x="94"
              y="126"
              width="786"
              height="45"
              rx="6"
              fill="#F9FAFB"
            />
            <line x1="30" y1="194.5" x2="880" y2="194.5" stroke="#F9FAFB" />
            <rect
              x="30"
              y="219"
              width="44"
              height="45"
              rx="22"
              fill="#F9FAFB"
            />
            <rect
              x="94"
              y="219"
              width="786"
              height="45"
              rx="6"
              fill="#F9FAFB"
            />
            <rect
              x="94"
              y="288"
              width="786"
              height="266"
              rx="6"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      )}
      {showConfirmModal ? (
        <ConfirmationModalForEmail
          header="Are you sure you want to send an email without subject?"
          handleCancel={() => setShowConfirmModal(false)}
          handleYes={() => {
            if (childFunction) {
              childFunction();
            }
          }}
          yesText="Yes, send it"
          modalOpen={showConfirmModal}
        />
      ) : (
        ''
      )}
      {showToErrorModal ? (
        <ConfirmationModalForEmail
          header="Please specify at least one recipient"
          handleCancel={() => setShowToErrorModal(false)}
          handleYes={() => setShowToErrorModal(false)}
          yesText="OK"
          modalOpen={showToErrorModal}
        />
      ) : (
        ''
      )}
    </>
  );
}
