export default function EmptyState({ setAddNewProjectModal,customerDropdown}:{setAddNewProjectModal:any, customerDropdown:any}) {
  return (
    <div className=" w-full bg-[#F9FAFB] flex flex-col items-center h-[360px] justify-center gap-[16px] rounded-[10px] mt-[16px]">
      <div className="flex items-center flex-col gap-[12px]">
        <span>
          <svg
            width="69"
            height="69"
            viewBox="0 0 69 69"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M56.9607 30.4214V63.9727C56.9607 66.747 54.7118 68.9959 51.9376 68.9959H10.6716C7.89727 68.9959 5.64844 66.7469 5.64844 63.9727V11.4137C5.64844 8.63879 7.89795 6.39062 10.6716 6.39062H32.9293L56.9607 30.4214Z"
              fill="#BED8FB"
            />
            <path
              d="M17.0661 62.6054C14.2918 62.6054 12.043 60.3564 12.043 57.5822V5.02312C12.0428 2.24816 14.2923 0 17.0661 0H39.3237C43.1504 0 63.3551 20.2046 63.3551 24.0309V57.5822C63.3551 60.3565 61.1061 62.6054 58.332 62.6054H17.0661Z"
              fill="#DDEAFB"
            />
            <path
              d="M63.3553 24.0313V26.1561C63.3553 21.6826 59.7277 18.055 55.2542 18.055H50.3235C47.5499 18.055 45.3004 15.8054 45.3004 13.0318V8.10117C45.3004 3.62762 41.6728 0 37.1992 0H39.3241C43.1501 0 46.8207 1.52016 49.526 4.22558L59.1299 13.8295C61.835 16.5348 63.3553 20.2053 63.3553 24.0313Z"
              fill="#BED8FB"
            />
          </svg>
        </span>
        <span className="text-[#97A1AF] text-[16px] font-medium">
          {customerDropdown?.value ==='active_projects'? " No active projects":"No completed projects"}
        </span>
      </div>
      <div>
        <button
          className="border-[1px] border-[#CED2DA] rounded-[8px] text-[14px] font-semibold px-[20px] py-2 items-center flex text-[#344051] cursor-pointer"
          onClick={() => setAddNewProjectModal(true)}
        >
          Create new project
        </button>
      </div>
    </div>
  );
}
