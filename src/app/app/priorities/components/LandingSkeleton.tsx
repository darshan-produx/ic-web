export default function LandingSkeleton() {
  return (
    <div
      className=" w-[1200px] mx-auto overflow-hidden"
      style={{
        scrollbarWidth: 'none',
      }}
    >
      <div
        className="!w-[1200px] flex flex-row overflow-auto  py-[40px] justify-end"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="justify-end gap-[50px] w-[600px] flex flex-row items-center  ">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex w-[100px] flex-col gap-2 animate-pulse"

              // style={{ animationDuration: `${1 + i}sec` }}
            >
              <div className="bg-gray-200 h-[18px] w-[54px] rounded-md"></div>
              <div className="bg-gray-200 h-[18px] w-[88px] rounded-md"></div>
            </div>
          ))}
        </div>
        {/* <div className="flex flex-row gap-[39.7px]">
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
        </div> */}
      </div>
      <div className="flex h-[585px] gap-[20px]">
        <div className="flex flex-col gap-[16px] w-[750px] ">
          <div className="flex justify-between gap-[16px]">
            <div className="w-full border rounded-xl border-[#E4E7EC] h-[73px] "></div>
            <div className="w-full border rounded-xl border-[#E4E7EC] h-[73px]"></div>
            <div className="w-full border rounded-xl border-[#E4E7EC] h-[73px]"></div>
          </div>
          <div className="border rounded-xl border-[#E4E7EC] h-[496px]"></div>
        </div>
        <div className="w-[430px] border border-[#E4E7EC] rounded-[10px]"></div>
      </div>
      <div className="flex mt-[40px] h-[500px] gap-[20px] rounded-lg">
        <div className=" w-[750px] border border-[#E4E7EC] rounded-xl "></div>
        <div className="w-[430px] border border-[#E4E7EC] rounded-xl"></div>
      </div>
    </div>
  );
}
