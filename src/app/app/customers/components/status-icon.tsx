'use client';
import React from 'react';
import { CircleAlert, Check, X, CircleHelp } from 'lucide-react';
import { TickIcon } from '../../../assests/icons/icons';
export function Icon(props: { color: string }) {
  const { color } = props;
  return (
    <div>
      {color?.toLowerCase() === 'green' ? (
        // <div className="bg-[#249782] rounded-full ml-[10px] w-[22px] h-[22px] top-[2.5px] left-[81.5px] p-0.5">
        //   <Check
        //     size={6}
        //     strokeWidth={3}
        //     className=" size-[25] w-[14px] h-[14px] mx-auto mt-[3px] text-white font-[900]"
        //   />
        // </div>
        <div className="ml-[10px]">
          <TickIcon />
        </div>
      ) : color?.toLowerCase() === 'red' ? (
        <X
          size={5}
          strokeWidth={3}
          className="ml-[10px] w-[22px] h-[22px] top-[2.5px] left-[81.5px]  bg-[#EF4444] rounded-full text-white font-bold p-0.5"
        />
      ) : color?.toLowerCase() === 'yellow' ? (
        <CircleAlert
          size={8}
          className="ml-[10px] w-[22px] h-[22px] top-[2.5px] left-[81.5px] bg-[#EAB308] rounded-full text-white font-bold"
        />
      ) : (
        <CircleHelp
          size={6}
          strokeWidth={2}
          className="ml-[10px] w-[25px] h-[25px] top-[2.5px] left-[81.5px]  text-[#97A1AF] rounded-full  font-bold p-0.5"
        />
      )}
    </div>
  );
}

export default Icon;
