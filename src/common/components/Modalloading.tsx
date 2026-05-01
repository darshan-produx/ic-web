'use client';

export default function ModalLoading() {
  return (
    <>
      <div className="h-[276px] flex flex-col items-center justify-center space-y-2 ">
        <div
          className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-[#80c2fe] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            {/* Loading... */}
          </span>
        </div>
        {/* <span className="text-white mx-10">Loading...</span> */}
      </div>
    </>
  );
}
