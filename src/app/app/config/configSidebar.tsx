'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Tooltip } from '@material-tailwind/react';
import {
  BriefcaseBusiness,
  Activity,
  Smile,
  Workflow,
  ScrollText,
  FolderKanban,
  PieChart,
  Lightbulb,
  Clock,
} from 'lucide-react';
import { LeftArrow } from '../../assests/icons/icons';

// 1. Configuration Data
const NAV_ITEMS = [
  {
    name: 'Adoption and business impact metrics',
    shortName: 'Adoption KPI',
    href: '/app/config/adoption_business_kpi',
    icon: <BriefcaseBusiness />,
  },
  {
    name: 'Performance / quality metrics',
    shortName: 'Performance KPI',
    href: '/app/config/performance_defect_kpi',
    icon: <Activity />,
  },
  {
    name: 'NPS metrics',
    shortName: 'NPS Config',
    href: '/app/config/nps_metric',
    icon: <Smile />,
  },
  {
    name: 'Configure use-cases',
    shortName: 'Use-cases',
    href: '/app/config/usecase-config',
    icon: <Workflow />,
  },
  {
    name: 'Configure recipes',
    shortName: 'Recipes',
    href: '/app/config/recipe-config',
    icon: <ScrollText />,
  },
  {
    name: 'Configure projects',
    shortName: 'Projects',
    href: '/app/config/customer-project-config',
    icon: <FolderKanban />,
  },
  {
    name: 'Configure recipe insight segments',
    shortName: 'Insight Segments',
    href: '/app/config/recipe_insight_segment',
    icon: <PieChart />,
  },
  {
    name: 'Insight master',
    shortName: 'Insight Master',
    href: '/app/config/insight_master',
    icon: <Lightbulb />,
  },
  {
    name: 'Ticket SLA',
    shortName: 'SLA Master',
    href: '/app/config/sla_master',
    icon: <Clock />,
  },
];

// 2. Style Helper
const getLinkClasses = (isActive: boolean, isOpen: boolean) => {
  const baseClasses =
    'flex items-center font-[0.875rem] rounded-lg px-2 py-2 mx-3 transition-all duration-200 border hover:text-vertical-menu-item-hover hover:bg-vertical-menu-item-bg-hover';

  // Preserving your specific hex colors from the original code
  if (isActive) {
    return `${baseClasses} bg-[#eff6ff] text-[#3b82f6] border-[#eff6ff] ${
      isOpen ? 'w-[151px]' : ''
    }`;
  }
  return `${baseClasses} border-transparent text-[#94a3b8] hover:bg-gray-50 cursor-pointer`;
};

const ConfigSidebar = (props: any) => {
  const isTabletMid = useMediaQuery({ query: '(max-width: 768px)' });
  const pathname = usePathname();
  const [open, setOpen] = useState(!isTabletMid);

  useEffect(() => {
    setOpen(!isTabletMid);
  }, [isTabletMid]);

  useEffect(() => {
    if (isTabletMid) setOpen(false);
  }, [pathname, isTabletMid]);

  const animationVariants = useMemo(
    () => ({
      open: {
        x: 0,
        width: '232px',
        transition: { damping: 0 },
      },
      closed: {
        x: isTabletMid ? -250 : 0,
        width: isTabletMid ? '0px' : '88px',
        transition: { damping: 0 },
      },
    }),
    [isTabletMid]
  );

  return (
    <div>
      {/* Mobile Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 z-[998] bg-black/20 ${
          open ? 'block' : 'hidden'
        }`}
      />

      <motion.div
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={animationVariants}
        className={`text-white shadow-xl md:relative fixed !h-[calc(100vh-4.4rem)] bg-white ${
          open ? 'overflow-hidden' : ''
        }`}
      >
        <div
          className={`flex flex-col justify-between pt-[20px] h-[81vh] 2xl:h-[81vh] ${
            isTabletMid && !open ? 'hidden' : ''
          }`}
        >
          {/* Scrollable Menu Area */}
          <div
            className={`overflow-y-auto overflow-x-hidden ${
              open ? 'hover:overflow-y-auto' : ''
            }`}
          >
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname.includes(item.href);

              return (
                <div key={index} className="py-1.5">
                  <Link href={item.href}>
                    <Tooltip
                      content={item?.name} // Using shortName for tooltip when closed
                      placement="right"
                      arrow={true}
                      className="bg-black text-white"
                    >
                      <div className={getLinkClasses(isActive, open)}>
                        {/* Icon Wrapper */}
                        <div
                          className={`h-6 w-4 flex items-center justify-center ${
                            open ? '' : 'm-auto'
                          }`}
                        >
                          {React.cloneElement(item.icon as React.ReactElement, {
                            className: 'h-5 w-5', // Unified icon size
                          })}
                        </div>

                        {/* Text Label */}
                        {open && (
                          <span
                            className="px-2 whitespace-nowrap overflow-hidden text-ellipsis"
                            // title={item.name}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                    </Tooltip>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggle Button */}
        {!isTabletMid && (
          <div className={`mb-10 ${open ? 'w-[220px]' : ''}`}>
            <div
              className={`float-end cursor-pointer p-2 ${
                open ? '' : 'mr-[5px]'
              }`}
              onClick={() => setOpen(!open)}
            >
              <LeftArrow
                className={`text-black w-6 h-6 transition-transform duration-300 ${
                  open ? '' : 'rotate-180 mr-[1.625rem]'
                }`}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConfigSidebar;