import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface props {
  synthesisData: any;
  meetingSuggetion?: boolean;
}
export function getShortDescription(description: string, length?: number) {
  const MAX_SHORT_DESCRIPTION_LENGTH = 300;
  const descriptionLength = length ? length : MAX_SHORT_DESCRIPTION_LENGTH;
  if (!description) {
    return description;
  }
  if (description.length <= descriptionLength) {
    return description;
  }
  let index = descriptionLength;
  while (index < description.length && index < descriptionLength + 15) {
    if (description[index] === ' ') {
      break;
    }
    index++;
  }
  return description.substring(0, index);
}
function Synthesis({ synthesisData, meetingSuggetion }: props) {
  const [expanded, setExpanded] = useState(meetingSuggetion);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  //   const synthesisData =
  //     'jwheb jwecwje cjweh jw hcjw cuq cwjqw cqugw qjw cqj kje wekcwe we wke wjeh wejwe ejh wej ejvweh w e weh we jqeh a aw cqjhw cjqhw cjqwh cjq wcjq wjc qjwhc jqhw cjqwh cqw jehc uwye cjwhevbwjh vsryuw kvzucbaj scusyej sdjwyec ajh uyo    wh ecljqsh dcksyegfwc ,ansbc qou3dgyuw c,na o7qduwhc jasbco2vclaj  72eg7cgu';
  return (
    <div
      className="truncate mx-auto w-full group flex items-center space-x-2 left-0 right-0 relative pb-[28px]"
      // title={synthesisData}
    >
      <p
        // ref={textRef}
        className={`relative whitespace-normal text-justify text-[#000000] text-[14px] font-normal leading-5 ${
          expanded ? 'max-h-none' : 'max-h-[36px] overflow-hidden'
        }`}
        // style={{
        //   display: '-webkit-box',
        //   WebkitBoxOrient: 'vertical',
        //   WebkitLineClamp: expanded ? 'none' : 2,
        // }}
        // title={!expanded ? synthesisData : ''}
      >
        <ReactMarkdown
          children={getShortDescription(
            synthesisData,
            !expanded ? 310 : synthesisData?.length
          )}
          remarkPlugins={[remarkGfm]}
          className={'markdown list-disc list-inside'}
        />
      </p>
      {expanded && (
        <span
          className="absolute right-0 cursor-pointer font-medium text-[#000000] text-[14px] leading-5 bottom-1"
          onClick={toggleExpanded}
        >
          Read less
        </span>
      )}
      {!expanded && synthesisData?.length > 310 && (
        <span
          className="absolute right-0 cursor-pointer font-medium text-[#000000] text-[14px] leading-5 bottom-1"
          onClick={toggleExpanded}
        >
          ...Read More
        </span>
      )}
    </div>
  );
}
export default Synthesis;
