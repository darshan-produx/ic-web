export default function LandingSkeleton() {
  return (
    <div className=" w-[1200px] mx-auto ">
      <div
        className="!w-[1200px] flex flex-row overflow-auto h-[40px] my-[40px]"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex flex-row gap-[39.7px]">
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
          <div className="w-[167px] "></div>
        </div>
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
