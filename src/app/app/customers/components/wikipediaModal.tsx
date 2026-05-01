import React from 'react';

type WikipediaModalProps = {
  onGoBack: (value: boolean) => void;
  onSaveChanges: (data: any) => void;
  data: any;
};

const WikipediaModal: React.FC<WikipediaModalProps> = ({
  onGoBack,
  onSaveChanges,
  data,
}) => {
  return (
    <div className="w-[418px] flex flex-col rounded-xl max-h-[calc(100vh_-_180px)] overflow-y-auto py-5">
      <h3 className="w-full px-5 h-[28px] text-lg font-medium text-[#202B37] leading-[28px]">
        Add Wikipedia link for better results
      </h3>
      <p className="w-full px-5 h-[60px] mt-[14px] text-[14px] font-normal text-[#414E62] leading-5">
        You have selected this as enterprise customer, scanning external data is
        effective when Wikipedia URL is entered. Do you want to go back to enter
        the URL.
      </p>

      <span className="border-[1px] border-[#E2E8F0] w-full mt-4"></span>

      {/* Buttons */}
      <div className="w-full px-5 mt-5 flex justify-end space-x-2 ">
        <button
          onClick={() => onGoBack(false)}
          className="w-[85px] h-[39px] px-3 py-[9.5px] bg-white text-[#637083] text-[14px] font-semibold leading-5 rounded-md border border-[#637083] focus:outline-none"
        >
          Go back
        </button>
        <button
          onClick={() => onSaveChanges(data)}
          className="w-[135px] h-[39px] px-5 py-[9.5px]  bg-[#249782] text-white text-[14px] font-semibold leading-5 rounded-md focus:outline-none"
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export default WikipediaModal;
