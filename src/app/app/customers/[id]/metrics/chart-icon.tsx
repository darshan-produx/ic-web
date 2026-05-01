'use client';
import {
  ChartGreenTickIcon,
  ChartRedCrossIcon,
  ChartYellowHelpIcon,
} from '../../../../../app/assests/icons/icons';
import React from 'react';
import { CircleHelp } from 'lucide-react';
export function ChartIcon(props: { color: string }) {
  const { color } = props;
  return (
    <div>
      {color && color?.toLowerCase() === 'green' ? (
        <div>
          <ChartGreenTickIcon />
        </div>
      ) : color && color?.toLowerCase() === 'red' ? (
        <ChartRedCrossIcon />
      ) : color && color?.toLowerCase() === 'yellow' ? (
        <ChartYellowHelpIcon />
      ) : // <CircleHelp
      //   size={6}
      //   strokeWidth={2}
      //   className="w-[25px] h-[25px] top-[2.5px] left-[81.5px]  text-[#97A1AF] rounded-full  font-bold p-0.5"
      // />
      null}
    </div>
  );
}

export default ChartIcon;
