import { getTimeAgo } from '../../../../common/SupportFunctions';
import dayjs from 'dayjs';
import Link from 'next/link';
import { format } from 'path';
import React, { useState } from 'react';
interface props {
  email: any;
  getInitials: any;
  setDraggedItemData: any;
}
function PriorityEmails({ email, getInitials, setDraggedItemData }: props) {
  const [sDragged, setIsDragged] = useState('');

  const getSvgAsDataUrl = () => {
    const svg = `
      <svg
        width="40mm"
        height="40mm"
        viewBox="0 0 40 40"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-35.60495,-4.182745)">
          <circle style="fill:#c7c7c7;fill-opacity:1;stroke:none;" cx="55.60495" cy="24.182745" r="20" />
          <text xml:space="preserve" style="font-size:16px; font-family:'Inter', sans-serif; font-weight:600; text-anchor:middle; fill:#323232;" x="55.60495" y="29.5">NA</text>
        </g>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };
  return (
    <Link
      className="flex gap-[12px] m-[20px] cursor-pointer first:py-0 py-[20px] first:pb-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7]"
      href={`/app/emails?email_message_id=${email?._id}`}
      draggable={true}
      onDragStart={(e) => {
        setDraggedItemData({
          ref_type: 'email',
          ref_id: email?._id,
          title: email?.envelope?.subject,
          customer_id: email?.customer_id,
        }),
          setIsDragged('!text-white');
      }}
      onDragEnd={(e) => {
        setDraggedItemData(null);
        setIsDragged('');
      }}
    >
      <div className=" w-[44px]">
        {/* <img
      src="https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg"
      alt=""
      className="w-[44px] h-[44px] rounded-full"
    /> */}
        <img
          src={
            email?.stakeholder_ids[0]
              ? `/api/app-service/v1/picture/customer_stakeholder_master/${email?.stakeholder_ids[0]
              }?org_id=${localStorage?.getItem(
                'org_id'
              )}&initials=${getInitials(
                email?.envelope?.from[0]?.name
                  ? email?.envelope?.from[0]?.name
                  : email?.envelope?.from[0]?.address
              )}&ts=${email?.datetime}`
              : getSvgAsDataUrl()
          }
          className="w-[44px] h-[44px] rounded-full"
          alt=""
        />
      </div>
      <div className="flex w-[654px]  flex-col gap-[6px]">
        <div className="flex justify-between">
          <span className="text-[14px] font-normal text-[#141C24]">
            {email?.envelope?.from[0]?.name
              ? email?.envelope?.from[0]?.name
              : email?.envelope?.from[0]?.address}
            {email?.customer_name && ` (${email?.customer_name})`}
          </span>
          <span className="flex items-center gap-[12px] text-xs text-[#97A1AF]">
            {Math.round(email?.priority) > 0 && (
              <span className="flex justify-between gap-[4px]">
                {Array?.from({ length: 5 })?.map((_, index) => (
                  <div
                    key={index}
                    className={
                      index < email?.priority
                        ? 'bg-[#249782] w-[4px] h-[10px] rounded-[4px]' // Green bars
                        : 'bg-[#F2F4F7] w-[4px] h-[10px] rounded-[4px]' // Gray bars
                    }
                  ></div>
                ))}
              </span>
            )}
            {getTimeAgo(email?.datetime)}
          </span>
        </div>
        <div className="leading-5">
          <p className="text-xs text-[#414E62]">{email?.envelope?.subject}</p>
          <p className="overflow-hidden text-ellipsis text-nowrap">
            {email?.body_text_initial}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default PriorityEmails;
