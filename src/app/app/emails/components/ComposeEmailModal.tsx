'use client';
import { Image, Paperclip } from 'lucide-react';
import React, { lazy, Suspense, useEffect, useState } from 'react';
// import ReactQuill from 'react-quill';
const ReactQuillLazy = lazy(() => import('react-quill'));
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { useSendEmail } from '../../../../services/mutations/emailSettingMutations';
import ConfirmationModalForEmail from '../../../../common/components/Modal/confirmationModalForEmail';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { getAllCustomersStakeholders } from '../../../api/emails/emails';
import { useQuery } from '@tanstack/react-query';
interface Sender {
  _id: string | number;
  name: string;
  email: string;
  participant_type?: string;
}

interface ComposeEmailProps {
  stakeholdersArr?: Sender[];
  type?: string;
  setShowConfirmModal?: any;
  onChildFunctionReady?: any;
  setShowToErrorModal?: any;
  stakeholderEmail?: string;
  communicationData?: any;
  toggle: () => void;
  data?: any; // Replace with more specific type if possible
  openMessageId?: string | any; // Replace with more specific type if possible
  userInfo?: string;
}

interface EmailData {
  to: string[];
  subject: string;
  body_html?: string;
  body?: string;
  attachments: File[];
  in_reply_to?: string;
  references?: string[];
  cc?: string[];
  bcc?: string[];
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ComposeEmail: React.FC<ComposeEmailProps> = (props: any) => {
  const [editorContent, setEditorContent] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [helpmeWrite, setHelpMeWrite] = useState<boolean>(false);
  const [helpmeText, setHelpmeText] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [helpmeRes, setHelpmeRes] = useState<string>('');
  const [imgAttachments, setImgAttachments] = useState<any>([]);
  const [replyObj, setReplyObj] = useState<any>({});
  const [fwdAttachment, setFwdAttachment] = useState<any>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomersStakeholders'],
    queryFn: () => getAllCustomersStakeholders(false),
  });

  const stakeholdersArr = [] as any;
  allCustomers?.data?.map((ele: any) => {
    stakeholdersArr.push(...ele?.stakeholders);
  });
  const senders: Sender[] = stakeholdersArr || [];
  const sendEmail = useSendEmail();
  const [isSubmmitting, setIsSubmmitting] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputValueCC, setInputValueCC] = useState<string>('');
  const [inputValueBCC, setInputValueBCC] = useState<string>('');
  const [selectedEmails, setSelectedEmails] = useState<Sender[]>([]);
  const [selectedCCEmails, setSelectedCCEmails] = useState<Sender[]>([]);
  const [selectedBCCEmails, setSelectedBCCEmails] = useState<Sender[]>([]);
  const [suggestions, setSuggestions] = useState<Sender[]>([]);
  const [suggestionsCC, setSuggestionsCC] = useState<Sender[]>([]);
  const [suggestionsBCC, setSuggestionsBCC] = useState<Sender[]>([]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.includes('@')) {
      const filteredSenders = senders.filter(
        (sender) =>
          sender.email.toLowerCase().includes(value.toLowerCase()) ||
          sender.name.toLowerCase().includes(value.toLowerCase())
      );

      if (emailRegex.test(value)) {
        if (!filteredSenders.length) {
          setSuggestions([{ name: value, email: value, _id: '' }]);
        } else {
          setSuggestions(filteredSenders);
        }
      } else {
        setSuggestions(filteredSenders);
      }
    } else {
      setSuggestions(
        value.length
          ? senders.filter(
            (sender) =>
              sender.email.toLowerCase().includes(value.toLowerCase()) ||
              sender.name.toLowerCase().includes(value.toLowerCase())
          )
          : []
      );
    }
  };
  const handleInputChangeCC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValueCC(value);

    if (value.includes('@')) {
      const filteredSenders = senders.filter(
        (sender) =>
          sender.email.toLowerCase().includes(value.toLowerCase()) ||
          sender.name.toLowerCase().includes(value.toLowerCase())
      );

      if (emailRegex.test(value)) {
        if (!filteredSenders.length) {
          setSuggestionsCC([{ name: value, email: value, _id: '' }]);
        } else {
          setSuggestionsCC(filteredSenders);
        }
      } else {
        setSuggestionsCC(filteredSenders);
      }
    } else {
      setSuggestionsCC(
        value.length
          ? senders.filter(
            (sender) =>
              sender.email.toLowerCase().includes(value.toLowerCase()) ||
              sender.name.toLowerCase().includes(value.toLowerCase())
          )
          : []
      );
    }
  };
  const handleInputChangeBCC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValueBCC(value);

    if (value.includes('@')) {
      const filteredSenders = senders.filter(
        (sender) =>
          sender.email.toLowerCase().includes(value.toLowerCase()) ||
          sender.name.toLowerCase().includes(value.toLowerCase())
      );

      if (emailRegex.test(value)) {
        if (!filteredSenders.length) {
          setSuggestionsBCC([{ name: value, email: value, _id: '' }]);
        } else {
          setSuggestionsBCC(filteredSenders);
        }
      } else {
        setSuggestionsBCC(filteredSenders);
      }
    } else {
      setSuggestionsBCC(
        value.length
          ? senders.filter(
            (sender) =>
              sender.email.toLowerCase().includes(value.toLowerCase()) ||
              sender.name.toLowerCase().includes(value.toLowerCase())
          )
          : []
      );
    }
  };

  const handleSelectEmail = (email: Sender) => {
    setSelectedEmails((prev) => [...prev, email]);
    setInputValue('');
    setSuggestions([]);
    const inputField = document?.getElementById('to');
    inputField?.focus();
  };
  const handleSelectCCEmail = (email: Sender) => {
    setSelectedCCEmails((prev) => [...prev, email]);
    setInputValueCC('');
    setSuggestionsCC([]);
    const inputField = document?.getElementById('CC');
    inputField?.focus();
  };
  const handleSelectBCCEmail = (email: Sender) => {
    setSelectedBCCEmails((prev) => [...prev, email]);
    setInputValueBCC('');
    setSuggestionsBCC([]);
    const inputField = document?.getElementById('BCC');
    inputField?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '' && selectedEmails.length) {
      setSelectedEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyDownCC = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Backspace' &&
      inputValueCC === '' &&
      selectedCCEmails.length
    ) {
      setSelectedCCEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyDownBCC = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Backspace' &&
      inputValueBCC === '' &&
      selectedBCCEmails.length
    ) {
      setSelectedBCCEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setAttachments((prevAttachments) => [
        ...prevAttachments,
        ...Array.from(files),
      ]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  const handleRemoveFwdAttachment = (part: string) => {
    setFwdAttachment((prevAttachments: any) =>
      prevAttachments.filter((ele: any, i: number) => ele?.part !== part)
    );
  };

  const handleYes = async () => {
    props?.setShowConfirmModal(false);
    setIsSubmmitting(true);
    try {
      if (selectedEmails.length) {
        const emailData: EmailData = {
          to: selectedEmails.map((email) => email.email),
          subject: '',
          body_html: updateImageTag(editorContent),
          attachments: [...attachments, ...imgAttachments],
        };

        const res = await sendEmail.mutateAsync(emailData);
        if (res?.status === 200 || res?.status === 201) {
          toast.success(res?.data?.message);
          setIsSubmmitting(false);
          props?.toggle();
        }
      }
    } catch (err) {
      toast.error('Mail can’t be sent, please try again later');
      setIsSubmmitting(false);
      props?.toggle();
    }
  };

  const handleSubmit = async () => {
    setIsSubmmitting(true);
    if (selectedEmails.length) {
      const emailData: EmailData = {
        to: selectedEmails.map((email) => email.email),
        cc: selectedCCEmails.map((email) => email.email),
        bcc: selectedBCCEmails.map((email) => email.email),
        subject,
        body_html: updateImageTag(editorContent),
        attachments: [...attachments, ...imgAttachments],
      };

      if (subject) {
        try {
          if (props.type) {
            emailData.in_reply_to = replyObj?.in_reply_to;
            emailData.references = replyObj?.references;
            const res = await sendEmail.mutateAsync(emailData);
            if (res?.status === 200 || res?.status === 201) {
              toast.success(res?.data?.message);
            }
            setIsSubmmitting(false);
            props?.toggle();
          } else {
            const res = await sendEmail.mutateAsync(emailData);
            if (res?.status === 200 || res?.status === 201) {
              toast.success(res?.data?.message);
              setIsSubmmitting(false);
              props?.toggle();
            }
          }
        } catch (err: AxiosError | any) {
          toast.error(err?.response?.data?.message);
          setIsSubmmitting(false);
          props?.toggle();
        }
      } else {
        props?.setShowConfirmModal(true);
      }
    } else {
      props?.setShowToErrorModal(true);
    }
  };

  const getResponse = () => {
    setHelpmeRes(`Hi Chriss,  I hope this email finds you well.
    
    I wanted to follow up on our recent discussion regarding plan activation. Your insights were incredibly valuable, and I’d appreciate it if you could share any additional feedback or thoughts you might have had since our meeting.
    
    If there are any points you believe we should explore further or refine, I’d love to hear them. Your input is crucial to ensuring we’re on the right track.
    
    Looking forward to your thoughts.
    
    Best regards,
    Sachin Tendulkar`);
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
  useEffect(() => {
    props?.onChildFunctionReady?.(handleYes);

    return () => {
      props?.onChildFunctionReady?.(null);
    };
  }, [props?.onChildFunctionReady]);

  useEffect(() => {
    if (props?.stakeholderEmail) {
      const filteredSenders = senders.filter((sender) =>
        sender.email
          .toLowerCase()
          .includes(props.stakeholderEmail.toLowerCase())
      );
      const uniqueFilteredSenders = Array.from(
        new Map(filteredSenders.map((item) => [item.email, item])).values()
      );

      if (
        uniqueFilteredSenders.length > 0 &&
        JSON.stringify(selectedEmails) !== JSON.stringify(uniqueFilteredSenders)
      ) {
        setSelectedEmails(uniqueFilteredSenders);
      }
    }

    if (props?.communicationData) {
      setSubject(
        `Minutes of meeting:  ${props?.communicationData?.meetingDetails?.meeting_name}`
      );
      setEditorContent(props?.communicationData?.mom_html);
      setSelectedEmails([
        ...props?.communicationData?.meetingDetails?.participants,
      ]);
    }

    return () => {
      if (props?.stakeholderEmail) {
        setSelectedEmails([]);
      }
    };
  }, [props?.stakeholderEmail, props?.communicationData]);

  useEffect(() => {
    if (props.type) {
      const conversation = props.data?.email_conversation;

      const email_message = props.data?.email_messages.find(
        (ele: any) => props.openMessageId === ele?._id
      );
      const fromAddress = email_message?.email_data?.envelope?.from[0]?.address;
      const fromName = email_message?.email_data?.envelope?.from[0]?.name;
      const userEmail = props?.userInfo?.email;
      const userName = `${props?.userInfo?.first_name} ${props?.userInfo?.last_name}`;
      const filteredSender = senders.filter(
        (ele: any) => ele.email === fromAddress && fromAddress !== userEmail
      );

      const filteredCC: any = senders?.filter((ele: any) =>
        email_message?.email_data?.envelope?.cc?.some(
          (cc: any) => ele?.email === cc?.address
        )
      );

      const filteredBCC: any = senders?.filter((ele: any) =>
        email_message?.email_data?.envelope?.bcc?.some(
          (bcc: any) => ele?.email === bcc?.address
        )
      );

      if (props.type === 'Forward') {
        const fwdAttach: any[] =
          email_message?.email_data?.body_structure?.childNodes
            ?.map((ele: any) => {
              if (ele?.disposition == 'attachment') {
                return ele;
              }
            })
            .filter((ele: any) => ele != undefined);
        setFwdAttachment(fwdAttach);
        setSubject(`Fwd: ${conversation?.subject}`);
        setEditorContent(email_message?.email_data?.body_html);

        setSelectedEmails([]);
        setSelectedBCCEmails([]);
        setSelectedCCEmails([]);
      } else {
        setSubject(`Re: ${conversation?.subject}`);

        if (fromAddress !== userEmail && filteredSender?.length === 0) {
          filteredSender?.push({
            name: fromName !== userName ? fromName : '',
            email: fromAddress !== userEmail ? fromAddress : '',
            _id: '',
          });
        } else if (fromAddress === userEmail && filteredSender?.length === 0) {
          const toEmailList = email_message?.email_data?.envelope?.to?.map(
            (to: any) => ({
              name: to?.name,
              email: to?.address,
              _id: '',
            })
          );
          const toEmailListModified = toEmailList.map((ele: any) => {
            const sender = senders.find(
              (sender: any) => sender.email === ele.email
            );
            return sender ? sender : ele;
          });
          filteredSender?.push(...toEmailListModified);
        }
        const uniquefilteredSender = filteredSender.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.email === item.email)
        );
        setSelectedEmails(uniquefilteredSender);
        if (props?.type === 'Reply all') {
          const ccEmailsFromEnvelope =
            email_message?.email_data?.envelope?.cc?.map((cc: any) => ({
              name: cc?.address,
              email: cc?.address,
              _id: '',
            })) || [];
          const CCEmailsFromTo = email_message?.email_data?.envelope?.to
            .filter((cc: any) => {
              return cc?.address !== props?.userInfo?.email;
            })
            .map((cc: any) => ({
              name: cc?.address,
              email: cc?.address,
              _id: '',
            }));
          const combinedCCEmails = [
            ...new Map(
              [...ccEmailsFromEnvelope, ...filteredCC, ...CCEmailsFromTo].map(
                (email) => [email.email, email]
              )
            ).values(),
          ]
            ?.filter((ele: any) => ele.email !== userEmail)
            ?.filter(
              (ele: any) =>
                !filteredSender.some(
                  (sender: any) => sender.email === ele.email
                )
            );
          if (combinedCCEmails.length > 0) {
            setSelectedCCEmails(combinedCCEmails);
            setShowCc(true);
          } else {
            setSelectedCCEmails([]);
            setShowCc(false);
          }

          const bccEmailsFromEnvelope =
            email_message?.email_data?.envelope?.bcc?.map((bcc: any) => ({
              name: bcc?.address,
              email: bcc?.address,
              _id: '',
            })) || [];

          const combinedBCCEmails = [
            ...new Map(
              [...bccEmailsFromEnvelope, ...filteredBCC].map((email) => [
                email.email,
                email,
              ])
            ).values(),
          ];

          if (combinedBCCEmails.length > 0) {
            setSelectedBCCEmails(combinedBCCEmails);
            setShowBcc(true);
          } else {
            setSelectedBCCEmails([]);
            setShowBcc(false);
          }
        }

        const replyObj: any = {
          in_reply_to: email_message?.envelope?.messageId,
          references: conversation?.message_ids,
        };

        setReplyObj(replyObj);
      }
    }
  }, [props.data, props.type]);

  useEffect(() => {
    const toolbarDiv = document.querySelector<HTMLDivElement>('.ql-toolbar');
    const targetDiv = document.querySelector<HTMLDivElement>('.target-div');
    if (toolbarDiv && targetDiv) {
      targetDiv.appendChild(toolbarDiv);
    }
    setTimeout(() => {
      const toolbarDiv = document.querySelector<HTMLDivElement>('.ql-toolbar');
      const targetDiv = document.querySelector<HTMLDivElement>('.target-div');
      if (toolbarDiv && targetDiv) {
        targetDiv.appendChild(toolbarDiv);
      }
    }, 2000);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newFileName = `ic_cid_${file.name}`;
        setImgAttachments((prevAttachments: any) => [
          ...prevAttachments,
          new File([file], newFileName, { type: file.type }),
        ]);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const editor = document.querySelector('.ql-editor');
          if (editor) {
            const img = document.createElement('img');
            img.src = base64String;
            img.alt = 'img';
            img.id = `ic_cid_${file.name}`;
            img.style.width = '100px';
            img.style.height = '100px';
            editor.appendChild(img);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateImageTag = (htmlString: string): string => {
    const imgRegex = /<img\s+([^>]*)src="([^"]*)"([^>]*)id="([^"]*)"([^>]*)>/g;

    const updatedHtml = htmlString.replace(
      imgRegex,
      (match, beforeSrc, src, between, id, after) => {
        return `<img ${beforeSrc} src="cid:${id}" ${between} ${after}>`;
      }
    );

    return updatedHtml;
  };

  function getValue(i: any) {
    return i ?? 0;
  }

  return (
    <>
      <div
        className={`w-[775px] drop-shadow-xl border border-gray-200 rounded-t-[12px] ${props?.type ? 'my-5 border border-gray-200' : 'my-0.5 mx-10'
          }  bg-white`}
      >
        <div className="flex justify-between items-center rounded-t-[12px] border-b border-gray-200 px-[16px] py-[12px] bg-[#F9FAFB]">
          <h2 className="text-[14px] text-gray-400">
            {props?.type ? props?.type : 'Compose'}
          </h2>
          <button
            className="text-gray-400"
            onClick={() => {
              props?.toggle();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[20px] w-[20px]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="border-b-[1px] border-gray-300">
          <div className="relative">
            <label
              className="text-[14px] text-black absolute top-[11px] left-[16px]"
              htmlFor="to"
            >
              To:
            </label>
            <div className="flex flex-wrap items-center  pl-[40px] pr-4 py-2">
              {selectedEmails.map((email, index) => (
                <div key={index} className="flex items-center mx-1">
                  <span className="text-[14px] text-gray-900 font-[500]">
                    {email?.name?.trim() && email?.participant_type !== 'external' ? email?.name : email?.email}
                    {index < selectedEmails.length - 1 && <span>,</span>}
                  </span>
                </div>
              ))}
              <input
                id="to"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder=""
                autoComplete="off"
                autoFocus
                className="flex-grow outline-none"
              />
              {!showCc && (
                <button
                  className="text-[14px] text-black underline ml-2"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  className="text-[14px] text-black underline ml-2"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </button>
              )}
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-auto z-10 left-[32px] top-[38px]">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectEmail(suggestion)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    <div className="text-sm font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">
                      {suggestion.email}
                    </div>
                  </li>
                ))}{' '}
              </ul>
            )}
          </div>

          {/* CC Input Box */}
          {(showCc || selectedCCEmails?.length > 0) && (
            <div className="relative">
              <label
                className="text-[14px] text-black  absolute top-[11px] left-[16px]"
                htmlFor="CC"
              >
                Cc:
              </label>
              <div className="flex flex-wrap items-center  pl-[43px] pr-4 py-2">
                {selectedCCEmails.map((email, index) => (
                  <div key={index} className="flex items-center mx-1">
                    <span className="text-[14px] text-gray-900 font-[500]">
                      {email.name?.trim() ? email.name : email.email}
                      {index < selectedCCEmails.length - 1 && <span>,</span>}
                    </span>
                  </div>
                ))}
                <input
                  id="CC"
                  type="text"
                  value={inputValueCC}
                  onChange={handleInputChangeCC}
                  onKeyDown={handleKeyDownCC}
                  placeholder=""
                  autoComplete="off"
                  autoFocus
                  className="flex-grow outline-none"
                />
              </div>
              {suggestionsCC.length > 0 && (
                <ul className="absolute bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-auto z-10 left-[32px] top-[38px]">
                  {suggestionsCC.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectCCEmail(suggestion)}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    >
                      <div className="text-sm font-medium">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.email}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {(showBcc || selectedBCCEmails?.length > 0) && (
            <div className="relative">
              <label
                className="text-[14px] text-black  absolute top-[11px] left-[16px]"
                htmlFor="BCC"
              >
                Bcc:
              </label>
              <div className="flex flex-wrap items-center pl-[50px] pr-4 py-2">
                {selectedBCCEmails?.map((email, index) => (
                  <div key={index} className="flex items-center mx-1">
                    <span className="text-[14px] text-gray-900 font-[500]">
                      {email.name?.trim() ? email.name : email.email}
                      {index < selectedBCCEmails.length - 1 && <span>,</span>}
                    </span>
                  </div>
                ))}
                <input
                  id="BCC"
                  type="text"
                  value={inputValueBCC}
                  onChange={handleInputChangeBCC}
                  onKeyDown={handleKeyDownBCC}
                  placeholder=""
                  autoFocus
                  autoComplete="off"
                  className="flex-grow outline-none "
                />
              </div>
              {suggestionsBCC.length > 0 && (
                <ul className="absolute bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-auto z-10 left-[32px] top-[38px]">
                  {suggestionsBCC.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectBCCEmail(suggestion)}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    >
                      <div className="text-sm font-medium">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.email}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Subject Input */}
        <div className="mb-4">
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e: any) => {
              setSubject(e?.target?.value);
            }}
            autoComplete="off"
            placeholder="Subject"
            className="w-full px-[16px] py-2 mt-1 border-b-[1px] border-gray-300 placeholder:text-[14px] placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-4 h-[205px] overflow-y-auto">
          <div className={`${helpmeWrite ? 'invisible h-[0px]' : ''}`}>
            <Suspense>
              <ReactQuillLazy
                // ref={quillRef}
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Write your mail here,"
                className="barScroll"
                theme="snow"
                //   formats={}
                modules={{
                  toolbar: {
                    container: [
                      [{ size: [] }],
                      ['bold', 'italic'],
                      ['attachment'],
                      ['link'],
                      ['uploadimage'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ indent: '-1' }, { indent: '+1' }, { align: [] }],
                    ],
                  },
                }}
              />
            </Suspense>
          </div>
          <div className={`${helpmeWrite ? '' : 'hidden'} h-[365px] mx-[16px]`}>
            <div className="w-full mx-auto bg-gray-100 border border-gray-300 rounded-[20px] py-[20px] px-[24px]">
              <div className="flex items-start">
                {/* Icon */}
                <div className="mr-2">
                  <svg
                    width="17"
                    height="20"
                    viewBox="0 0 17 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.2305 3.89346L9.65822 5.48379C9.02173 7.24883 7.632 8.63851 5.86703 9.27498L4.2767 9.84728C4.13318 9.89898 4.13318 10.1022 4.2767 10.1539L5.86703 10.7262C7.63207 11.3627 9.02175 12.7525 9.65822 14.5174L10.2305 16.1078C10.2822 16.2513 10.4855 16.2513 10.5372 16.1078L11.1095 14.5174C11.746 12.7524 13.1357 11.3627 14.9007 10.7262L16.491 10.1539C16.6345 10.1022 16.6345 9.89899 16.491 9.84728L14.9007 9.27498C13.1356 8.63849 11.7459 7.24876 11.1095 5.48379L10.5372 3.89346C10.4855 3.74905 10.2822 3.74905 10.2305 3.89346Z"
                      fill="#1A75FF"
                    />
                    <path
                      d="M3.07026 0.0711168L2.77967 0.876069C2.45696 1.76929 1.75363 2.47351 0.859515 2.79622L0.0545626 3.08682C-0.0185342 3.11356 -0.0185342 3.21608 0.0545626 3.24193L0.859515 3.53253C1.75274 3.85523 2.45696 4.55856 2.77967 5.45268L3.07026 6.25763C3.09701 6.33073 3.19952 6.33073 3.22537 6.25763L3.51597 5.45268C3.83868 4.55945 4.54201 3.85523 5.43612 3.53253L6.24108 3.24193C6.31417 3.21518 6.31417 3.11267 6.24108 3.08682L5.43612 2.79622C4.5429 2.47351 3.83868 1.77018 3.51597 0.876069L3.22537 0.0711168C3.19952 -0.00287227 3.09612 -0.00287227 3.07026 0.0711168Z"
                      fill="#1A75FF"
                    />
                    <path
                      d="M3.07026 13.7423L2.77967 14.5473C2.45696 15.4405 1.75363 16.1447 0.859515 16.4674L0.0545626 16.758C-0.0185342 16.7848 -0.0185342 16.8873 0.0545626 16.9131L0.859515 17.2037C1.75274 17.5264 2.45696 18.2298 2.77967 19.1239L3.07026 19.9288C3.09701 20.0019 3.19952 20.0019 3.22537 19.9288L3.51597 19.1239C3.83868 18.2307 4.54201 17.5264 5.43612 17.2037L6.24108 16.9131C6.31417 16.8864 6.31417 16.7839 6.24108 16.758L5.43612 16.4674C4.5429 16.1447 3.83868 15.4414 3.51597 14.5473L3.22537 13.7423C3.19952 13.6692 3.09612 13.6692 3.07026 13.7423Z"
                      fill="#1A75FF"
                    />
                  </svg>
                </div>

                <div className="flex-grow">
                  <p className="text-[14px] font-semibold text-gray-700 mb-2">
                    Help me write
                  </p>
                </div>
                <div
                  onClick={() => {
                    setHelpMeWrite(false);
                    setEditorContent(helpmeRes);
                    setHelpmeRes('');
                    setHelpmeText('');
                  }}
                  className="text-gray-400 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[20px] w-[20px]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {helpmeRes?.length != 0 ? (
                <div>
                  <div>
                    <p className="helpEditor">
                      {
                        <Suspense>
                          <ReactQuillLazy
                            value={helpmeRes}
                            className="h-[200px] barScroll"
                            modules={{
                              toolbar: {
                                container: [],
                              },
                            }}
                          />
                        </Suspense>
                      }
                    </p>
                  </div>
                  {/* Write Button */}
                  <div className="flex justify-start mt-3">
                    <button
                      onClick={() => {
                        setHelpMeWrite(false);
                        setEditorContent(helpmeRes);
                        setHelpmeRes('');
                        setHelpmeText('');
                      }}
                      className="px-[12px] py-[9.5px] bg-gray-100 text-gray-800 border  disabled:text-gray-400 disabled:border-gray-400 text-[14px] border-gray-800 rounded-[6px] font-[600] cursor-pointer"
                    >
                      Replace with this
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Input Field */}
                  <div>
                    <input
                      type="text"
                      onChange={(e: any) => setHelpmeText(e?.target?.value)}
                      placeholder="Eg. Write response that engineering team is working on the issue. Make it sound professional"
                      className="w-full text-[14px] mb-[24px] mt-[16px] text-gray-800 placeholder:text-gray-400 bg-gray-100  outline-none "
                    />
                  </div>
                  {/* Write Button */}
                  <div className="flex justify-start mt-3">
                    <button
                      disabled={helpmeText?.length == 0}
                      onClick={() => {
                        getResponse();
                      }}
                      className="px-[12px] py-[9.5px] bg-gray-100 text-gray-800 border  disabled:text-gray-400 disabled:border-gray-400 text-[14px] border-gray-800 rounded-[6px]"
                    >
                      Write
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {attachments?.length > 0 && (
            <div className="insertAttachments">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center w-[50%] mx-[20px] my-2 justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div>
                    <span className="block text-gray-800 font-medium">
                      {file.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {convertBytes(file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="remove-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[20px] w-[20px]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* <div className="mb-4">
          <CKEditor
            editor={ClassicEditor}
            config={{
              toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                'attachment',
                'insertImage',
                'insertTable',
                'numberedList',
                'bulletedList',
                'alignment',
              ],
            }}
            data={editorContent}
            onChange={(event, editor) => {
              handleEditorChange(editor?.getData());
            }}
          />
        </div> */}

        {/* Footer Actions */}
        <div className="relative my-2">
          <div className="flex items-center">
            <input
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="hidden"
              id="attachment-input"
            />
            <label
              htmlFor="attachment-input"
              className="absolute cursor-pointer bottom-[-46px] left-[305px]"
            >
              <Paperclip className="w-[16px] h-[18px] size-[18px] transform rotate-[315deg]" />
            </label>
          </div>
        </div>
        <div className="relative my-2">
          <div className="flex items-center">
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="uploadimage-input"
            />
            <label
              htmlFor="uploadimage-input"
              className="absolute cursor-pointer bottom-[-39px] left-[376px]"
            >
              <Image className="w-[16px] h-[18px] size-[18px] transform" />
            </label>
          </div>
        </div>
        <div className="mx-[16px]">
          <div className="flex pb-4 justify-between">
            <button
              className={`px-[12px] py-[9.5px] bg-[#3B82F6] text-white text-[14px] font-[500]  rounded-[6px] ${isSubmmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
              onClick={handleSubmit}
              disabled={isSubmmitting}
            >
              Send
            </button>
            <div className="flex  justify-between target-div"></div>
            <div className="w-36"></div>
            {/* <div
              className={`${
                helpmeWrite ? 'invisible' : 'visible'
              } flex border-[1px] rounded-[20px] border-gray-200 px-[12px] py-[8px] bg-gray-100 cursor-not-allowed `}
              // onClick={() => setHelpMeWrite(true)}
            >
              <span className="w-6 pt-1 items-center">
                <svg
                  width="17"
                  height="20"
                  viewBox="0 0 17 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.2295 3.87686L9.65724 5.46719C9.02075 7.23223 7.63102 8.62191 5.86605 9.25838L4.27573 9.83068C4.1322 9.88238 4.1322 10.0856 4.27573 10.1373L5.86605 10.7096C7.63109 11.3461 9.02077 12.7359 9.65724 14.5008L10.2295 16.0912C10.2812 16.2347 10.4845 16.2347 10.5362 16.0912L11.1085 14.5008C11.745 12.7358 13.1347 11.3461 14.8997 10.7096L16.49 10.1373C16.6335 10.0856 16.6335 9.88239 16.49 9.83068L14.8997 9.25838C13.1347 8.62189 11.745 7.23216 11.1085 5.46719L10.5362 3.87686C10.4845 3.73245 10.2813 3.73245 10.2295 3.87686Z"
                    fill="#1A75FF"
                  ></path>
                  <path
                    d="M3.06929 0.0554918L2.77869 0.860444C2.45598 1.75367 1.75265 2.45789 0.858538 2.7806L0.053586 3.07119C-0.0195107 3.09794 -0.0195107 3.20045 0.053586 3.2263L0.858538 3.5169C1.75176 3.83961 2.45598 4.54294 2.77869 5.43705L3.06929 6.242C3.09603 6.3151 3.19855 6.3151 3.2244 6.242L3.515 5.43705C3.8377 4.54383 4.54103 3.83961 5.43515 3.5169L6.2401 3.2263C6.3132 3.19956 6.3132 3.09704 6.2401 3.07119L5.43515 2.7806C4.54192 2.45789 3.8377 1.75456 3.515 0.860444L3.2244 0.0554918C3.19855 -0.0184973 3.09514 -0.0184973 3.06929 0.0554918Z"
                    fill="#1A75FF"
                  ></path>
                  <path
                    d="M3.06929 13.7277L2.77869 14.5326C2.45598 15.4258 1.75265 16.1301 0.858538 16.4528L0.053586 16.7434C-0.0195107 16.7701 -0.0195107 16.8726 0.053586 16.8985L0.858538 17.1891C1.75176 17.5118 2.45598 18.2151 2.77869 19.1092L3.06929 19.9142C3.09603 19.9873 3.19855 19.9873 3.2244 19.9142L3.515 19.1092C3.8377 18.216 4.54103 17.5118 5.43515 17.1891L6.2401 16.8985C6.3132 16.8717 6.3132 16.7692 6.2401 16.7434L5.43515 16.4528C4.54192 16.1301 3.8377 15.4267 3.515 14.5326L3.2244 13.7277C3.19855 13.6546 3.09514 13.6546 3.06929 13.7277Z"
                    fill="#1A75FF"
                  ></path>
                </svg>
              </span>
              <span className="text-[14px] mt-[1px] text-gray-800">
                Help me write
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {getValue(fwdAttachment?.length) > 0 ? (
        <ConfirmationModalForEmail
          header="Attachments to this email will not be forwarded. If you wish to attach the files, please download and attach them again"
          handleCancel={() => setFwdAttachment([])}
          handleYes={() => {
            setFwdAttachment([]);
          }}
          yesText="Yes"
          modalOpen={getValue(fwdAttachment?.length) > 0}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default ComposeEmail;
