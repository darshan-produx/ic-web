import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { HoverIcon } from '../../../assests/icons/icons';
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
interface props {
  referencesType: string;
  setReferencesType: any;
  eventAndReferences: any;
  setDraggedItemData: any;
  getInitial: any;
  onHover: string;
  setOnHover: any;
}
export default function References({
  referencesType,
  setReferencesType,
  eventAndReferences,
  setDraggedItemData,
  getInitial,
  onHover,
  setOnHover,
}: props) {
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

  const checkEventProximity = (eventDateStr: string, type?: string) => {
    const today = dayjs().startOf('day');
    let eventDate: dayjs.Dayjs;
    let monthDay: string;

    if (eventDateStr?.length === 5) {
      monthDay = eventDateStr;
    } else if (eventDateStr?.length === 10) {
      const parsedDate = dayjs(eventDateStr, 'YYYY-MM-DD', true);
      if (!parsedDate.isValid()) {
        return 'Invalid date format';
      }
      monthDay = parsedDate.format('MM-DD');
    } else {
      const parsedEvent = dayjs(eventDateStr);
      if (!parsedEvent.isValid()) {
        return 'Invalid date format';
      }
      monthDay = parsedEvent.format('MM-DD');
    }

    const thisYearEvent = dayjs(`${dayjs().year()}-${monthDay}`, 'YYYY-MM-DD');
    const lastYearEvent = dayjs(
      `${dayjs().year() - 1}-${monthDay}`,
      'YYYY-MM-DD'
    );
    const nextYearEvent = dayjs(
      `${dayjs().year() + 1}-${monthDay}`,
      'YYYY-MM-DD'
    );

    if (thisYearEvent.isBefore(today)) {
      if (today.diff(thisYearEvent, 'day') <= 2) {
        eventDate = thisYearEvent;
      } else {
        eventDate = nextYearEvent;
      }
    } else {
      if (today.diff(lastYearEvent, 'day') <= 2) {
        eventDate = lastYearEvent;
      } else {
        eventDate = thisYearEvent;
      }
    }

    const diffDays = eventDate.diff(today, 'day');

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === 2) {
      return 'In 2 days';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays === -2) {
      return '2 days ago';
    } else {
      if (type === 'news') {
        return dayjs().to(dayjs(eventDateStr));
      } else {
        return dayjs().to(thisYearEvent);
      }
    }
  };

  return (
    <>
      <div className="flex p-[20px] border-b border-[#F2F4F7] gap-[12px]">
        <span
          className={
            referencesType === 'all'
              ? 'inline bg-[#3B82F6] px-[12px] cursor-pointer  py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
              : 'inline bg-[#F2F4F7] px-[12px] cursor-pointer py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
          }
          onClick={() => setReferencesType('all')}
        >
          All
        </span>
        <span
          className={
            referencesType === 'events'
              ? 'inline bg-[#3B82F6] px-[12px] cursor-pointer  py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
              : 'inline bg-[#F2F4F7] px-[12px] cursor-pointer py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
          }
          onClick={() => setReferencesType('events')}
        >
          Personal events
        </span>
        <span
          className={
            referencesType === 'news'
              ? 'inline bg-[#3B82F6] px-[12px] cursor-pointer  py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
              : 'inline bg-[#F2F4F7] px-[12px] cursor-pointer py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent'
          }
          onClick={() => setReferencesType('news')}
        >
          News and social
        </span>
      </div>
      <div className="h-[430px] overflow-auto scroll">
        <div className="">
          {eventAndReferences?.map((item: any) => (
            <a href={item?.url ?? '#'} target="_blank" rel="noreferrer">
              <div
                className="flex relative mx-[20px] gap-[12px] !py-[20px]  text-[#97A1AF] text-xs border-b border-[#F2F4F7]"
                draggable={true}
                onMouseEnter={() => setOnHover(item._id)}
                onMouseLeave={() => setOnHover('')}
                onDragStart={(e) => {
                  setDraggedItemData({
                    ref_type:
                      item?.type === 'stakeholder_dob' ||
                      item?.type === 'stakeholder_work_anniversary'
                        ? item?.type
                        : 'add-hoc',
                    ref_id: item?.customer_id,
                    title:
                      item?.type === 'stakeholder_dob'
                        ? `Greet ${item?.stakeholder_name} Happy Birthday`
                        : item?.type === 'stakeholder_work_anniversary'
                        ? `Greet ${item?.stakeholder_name} Happy Work Anniversary`
                        : item?.type === 'stakeholder_custom'
                        ? item?.description
                        : item?.type === 'news'
                        ? item?.title
                        : item?.title,
                    metadata: item?.type === 'news' ? { url: item?.url } : {},
                  });
                }}
                onDragEnd={(e) => {
                  setDraggedItemData(null);
                }}
              >
                <div className="w-[55px]">
                  {item?.type === 'news' ? (
                    <img
                      src={item?.image}
                      alt=""
                      className="!w-[44px] !h-[44px]  rounded-full"
                    />
                  ) : (
                    <img
                      src={
                        item?.stakeholder_id
                          ? `/api/app-service/v1/picture/customer_stakeholder_master/${
                              item?.stakeholder_id
                            }?org_id=${localStorage?.getItem(
                              'org_id'
                            )}&initials=${getInitial(item?.stakeholder_name)}`
                          : getSvgAsDataUrl()
                      }
                      className="w-[44px] h-[44px] rounded-full"
                      alt=""
                    />
                  )}
                </div>
                <div className=" w-full flex-col gap-[6px]">
                  <div className="flex min-w-full justify-between">
                    <span className="text-[12px] font-normal text-[#637083]">
                      {item?.type === 'news'
                        ? `${item?.customer_name}`
                        : item?.stakeholder_name +
                          ' ' +
                          `(${item?.customer_name})`}
                    </span>
                    <span className="flex items-center justify-end gap-[12px] text-xs text-[#637083]">
                      {item?.type === 'news'
                        ? checkEventProximity(item?.dateTimePub, 'news')
                        : checkEventProximity(item?.date)}
                    </span>
                  </div>
                  <div className="leading-5 pt-[2px] overflow-hidden text-ellipsis">
                    <p className="text-[14px] w-full text-[#141C24] ">
                      {item?.type === 'stakeholder_dob'
                        ? 'Birthday!'
                        : item?.type === 'stakeholder_work_anniversary'
                        ? 'Work Anniversary!'
                        : item?.type === 'stakeholder_custom'
                        ? item?.description
                        : item?.type === 'news'
                        ? item?.title
                        : null}
                    </p>
                  </div>
                </div>
                {onHover === item._id && (
                  <span className="absolute top-4 left-[-18px]">
                    <HoverIcon />
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
