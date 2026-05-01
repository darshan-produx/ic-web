import { FilePlusIcon } from '../../assests/icons/icons';
export default function NoInsightsPage({ userinfo }: any) {
  return (
    <div className="flex flex-col gap-5 items-center w-full h-screen">
      <div className="flex flex-col items-center pt-[150px] gap-5">
        <span>
          <FilePlusIcon className="text-[#141C24]" />
        </span>
        <div className="flex text-center !text-[#141C24] !font-normal">
          {' '}
          {userinfo?.data?.first_name}, you don’t have any insights <br />
        </div>
      </div>
    </div>
  );
}
