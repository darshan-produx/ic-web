import { useEffect, useRef } from 'react';
import {
  EmailIcon,
  LightBulb,
  Clipboard,
  RoundedCheckIcon,
} from '../../../assests/icons/icons';
import { useRouter, useSearchParams } from 'next/navigation';

interface props {
  tabName: string;
  setTabName: any;
  insightCount: any;
  emailCount: any;
  taskCount: any;
}
const Tabs = ({
  tabName,
  setTabName,
  insightCount,
  emailCount,
  taskCount,
}: props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasSetInitialTab = useRef(false);
 useEffect(() => {
    // Only set the tab automatically on initial load
      if (searchParams && searchParams.get('tab') === 'notes') {
      const newUrl = window.location.pathname;
      router.replace(newUrl, { scroll: false });
      setTabName('notes');
    } else if(!hasSetInitialTab.current && (insightCount !== undefined && emailCount !== undefined && taskCount !== undefined)){
      hasSetInitialTab.current = true;
      if (insightCount > 0) {
          setTabName('insights');
        } else if (emailCount > 0) {
          setTabName('emails');
        } else if (taskCount > 0) {
          setTabName('tasks');
        } else {
        setTabName('insights');
      }
    }
    
  }, [insightCount, emailCount, taskCount, setTabName]);
  return (
    <>
      <div
        className={
          tabName === 'insights'
            ? 'w-full border flex justify-center items-center rounded-[20px] border-[#3B82F6] bg-white h-[60px] cursor-pointer'
            : 'w-full border flex justify-center items-center rounded-[20px] border-[#E4E7EC] bg-white h-[60px] cursor-pointer'
        }
        onClick={() => setTabName('insights')}
      >
        <div className="flex items-center justify-center">
          <span
            className={
              tabName === 'insights'
                ? 'font-semibold text-[20px] text-[#3B82F6] '
                : 'font-semibold text-[20px] text-[#414E62]'
            }
          >
            {insightCount}
             </span>
            <span
              className={
                tabName === 'insights'
                  ? 'font-normal text-[16px] text-[#3B82F6] pl-[11px]'
                  : 'font-normal text-[16px] text-[#414E62] pl-[11px]'
              }
            >
              {insightCount === 1 ? '  Insight' : 'Insights'}
            </span>
        </div>
      </div>
      <div
        className={
           tabName === 'emails'
            ? 'w-full border flex justify-center items-center rounded-[20px] border-[#3B82F6] bg-white h-[60px] cursor-pointer'
            : 'w-full border flex justify-center items-center rounded-[20px] border-[#E4E7EC] bg-white h-[60px] cursor-pointer'
        }
        onClick={() => setTabName('emails')}
      >
        <div className="flex items-center justify-center">
          <span
            className={
              tabName === 'emails'
                ? 'font-semibold text-[20px] text-[#3B82F6] '
                : 'font-semibold text-[20px] text-[#414E62]'
            }
          >
            {emailCount}
            </span>
            <span
              className={
                tabName === 'emails'
                  ? 'font-normal text-[16px] text-[#3B82F6] pl-[11px]'
                  : 'font-normal text-[16px] text-[#414E62] pl-[11px]'
              }
            >
              {emailCount === 1 ? 'Email' : 'Emails'}
            </span>
          
        </div>
      </div>
      <div
        className={
           tabName === 'tasks'
            ? 'w-full border flex justify-center items-center rounded-[20px] border-[#3B82F6] bg-white h-[60px] cursor-pointer'
            : 'w-full border flex justify-center items-center rounded-[20px] border-[#E4E7EC] bg-white h-[60px] cursor-pointer'
        }
        onClick={() => setTabName('tasks')}
      >
        {/* <div
          className={
            tabName === 'insights'
              ? 'bg-slate-100 rounded-l-xl flex items-center   px-[19px]'
              : 'bg-[#F9FAFB] rounded-l-xl flex items-center   px-[19px] '
          }
        >
          <span className="">
            <LightBulb
              className={
                tabName === 'insights'
                  ? 'w-[30px] h-[30px] text-[#3B82F6] font-normal'
                  : 'w-[30px] h-[30px] text-[#637083]'
              }
            />
          </span>
        </div> */}
        <div className="flex justify-center items-center ">
          <span
            className={
              tabName === 'tasks'
                ? 'font-semibold text-[20px] text-[#3B82F6] '
                : 'font-semibold text-[20px] text-[#414E62]'
            }
          >
           {taskCount}
            </span>
            <span
              className={
                tabName === 'tasks'
                  ? 'font-normal text-[16px] text-[#3B82F6] pl-[11px]'
                  : 'font-normal text-[16px] text-[#414E62] pl-[11px]'
              }
            >
              {taskCount === 1 ? 'Task' : 'Tasks'}
            </span>
         
        </div>
      </div>
      <div
        className={
           tabName === 'notes'
            ? 'w-full border flex justify-center items-center rounded-[20px] border-[#3B82F6] bg-white h-[60px] cursor-pointer'
            : 'w-full border flex justify-center items-center rounded-[20px] border-[#E4E7EC] bg-white h-[60px] cursor-pointer'
        }
        onClick={() => setTabName('notes')}
      >
        <div className="flex justify-center items-center h-[36px]">
          <span
            className={
              tabName === 'notes'
                ? '"flex justify-center items-center text-[20px] text-[#3B82F6]'
                : '"flex justify-center items-center text-[20px] text-[#414E62]'
            }
          >
     <Clipboard className={ tabName === 'notes'?'text-[#3B82F6]':'text-[#414E62]'}/>
          
           </span>
            <span
              className={
                tabName === 'notes'
                  ? 'font-normal text-[16px] text-[#3B82F6] pl-[5px] '
                  : 'font-normal text-[16px] text-[#414E62] pl-[5px]'
              }
            >
              Notes
            </span>
        </div>
      </div>
    </>
  );
};

export default Tabs;
