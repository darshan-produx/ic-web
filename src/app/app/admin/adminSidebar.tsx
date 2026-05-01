'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Tooltip } from '@material-tailwind/react';
import {
  UserRound,
  Settings,
  Users,
  PieChart,
  Mail,
  Activity,
  Headset,
  Bot,
} from 'lucide-react'; // Assuming lucide for all, adjust imports as needed
import { LeftArrow } from '../../assests/icons/icons'; // Keep your custom imports

// 1. Define Menu Data Structure
const NAV_ITEMS = [
  {
    name: 'User Management',
    href: '/app/admin/users',
    icon: <UserRound />,
    id: 'user_management',
  },
  {
    name: 'Customers',
    href: '/app/admin/customers',
    icon: <Users />, // Replaced with generic lucide icon, swap back if needed
    id: 'customer_management',
  },
  {
    name: 'Segments',
    href: '/app/admin/segments',
    icon: <PieChart />, // Replaced with generic lucide icon
    id: 'segment_management',
  },
  {
    name: 'Email settings',
    href: '/app/admin/emailsettings',
    icon: <Settings />,
    id: 'email_settings',
  },
  {
    name: 'Group customers',
    href: '/app/admin/groupcustomers',
    icon: <UserRound />, // Replaced with generic lucide icon
    id: 'group_customer_management',
  },
  {
    name: 'KPI settings',
    href: '/app/admin/kpisettings',
    icon: <Activity />, // Replaced with generic lucide icon
    id: 'kpi_settings',
  },
  {
    name: 'Agents',
    href: '/app/admin/agents',
    icon: <Bot />, // Replaced with generic lucide icon
    id: 'agents',
  },
];

// 2. Extract the massive class string to keep JSX clean
const getLinkClasses = (isActive: boolean) => {
  const baseClasses =
    "relative flex items-center ltr:pl-3 rtl:pr-3 ltr:pr-5 rtl:pl-5 mx-3 my-1 group/menu-link text-vertical-menu-item-font-size font-normal transition-all duration-75 ease-linear rounded-md py-2.5 text-vertical-menu-item group-data-[sidebar=dark]:text-vertical-menu-item-dark group-data-[sidebar=dark]:hover:text-vertical-menu-item-hover-dark group-data-[sidebar=dark]:dark:hover:text-custom-500 group-data-[layout=horizontal]:dark:hover:text-custom-500 group-data-[sidebar=dark]:hover:bg-vertical-menu-item-bg-hover-dark group-data-[sidebar=dark]:dark:hover:bg-zink-600 group-data-[sidebar=brand]:text-vertical-menu-item-brand group-data-[sidebar=brand]:hover:text-vertical-menu-item-hover-brand group-data-[sidebar=brand]:hover:bg-vertical-menu-item-bg-hover-brand group-data-[sidebar=brand]:[&.active]:bg-vertical-menu-item-bg-active-brand group-data-[sidebar=brand]:[&.active]:text-vertical-menu-item-active-brand group-data-[sidebar=modern]:text-vertical-menu-item-modern group-data-[sidebar=modern]:hover:bg-vertical-menu-item-bg-hover-modern group-data-[sidebar=modern]:hover:text-vertical-menu-item-hover-modern group-data-[sidebar=modern]:[&.active]:bg-vertical-menu-item-bg-active-modern group-data-[sidebar=modern]:[&.active]:text-vertical-menu-item-active-modern group-data-[sidebar-size=md]:block group-data-[sidebar-size=md]:text-center group-data-[sidebar-size=sm]:group-hover/sm:w-[calc(theme('spacing.vertical-menu-sm')_*_3.63)] group-data-[sidebar-size=sm]:group-hover/sm:bg-vertical-menu group-data-[sidebar-size=sm]:group-data-[sidebar=dark]:group-hover/sm:bg-vertical-menu-dark group-data-[sidebar-size=sm]:group-data-[sidebar=modern]:group-hover/sm:bg-vertical-menu-border-modern group-data-[sidebar-size=sm]:group-data-[sidebar=brand]:group-hover/sm:bg-vertical-menu-brand group-data-[sidebar-size=sm]:my-0 group-data-[sidebar-size=sm]:rounded-b-none group-data-[layout=horizontal]:m-0 group-data-[layout=horizontal]:ltr:pr-8 group-data-[layout=horizontal]:rtl:pl-8 group-data-[layout=horizontal]:hover:bg-transparent group-data-[layout=horizontal]:[&.active]:bg-transparent [&.dropdown-button]:before:absolute [&.dropdown-button]:[&.show]:before:content-['\\ea4e'] [&.dropdown-button]:before:content-['\\ea6e'] [&.dropdown-button]:before:font-remix ltr:[&.dropdown-button]:before:right-2 rtl:[&.dropdown-button]:before:left-2 [&.dropdown-button]:before:text-16 group-data-[sidebar-size=sm]:[&.dropdown-button]:before:hidden group-data-[sidebar-size=md]:[&.dropdown-button]:before:hidden group-data-[sidebar=dark]:dark:text-zink-200 group-data-[layout=horizontal]:dark:text-zink-200 rtl:[&.dropdown-button]:before:rotate-180 group-data-[layout=horizontal]:[&.dropdown-button]:before:rotate-90 group-data-[layout=horizontal]:[&.dropdown-button]:[&.show]:before:rotate-0 rtl:[&.dropdown-button]:[&.show]:before:rotate-0";

  const activeClasses =
    'text-vertical-menu-item-active bg-vertical-menu-item-bg-active group-data-[sidebar=dark]:[&.active]:text-vertical-menu-item-active-dark group-data-[sidebar=dark]:[&.active]:bg-vertical-menu-item-bg-active-dark group-data-[sidebar=dark]:[&.active]:dark:bg-zink-600 group-data-[layout=horizontal]:dark:[&.active]:text-custom-500';
  const inactiveClasses =
    'hover:text-vertical-menu-item-hover hover:bg-vertical-menu-item-bg-hover';

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

const iconClasses =
  'h-4 group-data-[sidebar-size=sm]:h-5 group-data-[sidebar-size=sm]:w-5 transition group-hover/menu-link:animate-icons fill-slate-100 group-hover/menu-link:fill-blue-200 group-data-[sidebar=dark]:fill-vertical-menu-item-bg-active-dark group-data-[sidebar=dark]:dark:fill-zink-600 group-data-[layout=horizontal]:dark:fill-zink-600 group-data-[sidebar=brand]:fill-vertical-menu-item-bg-active-brand group-data-[sidebar=modern]:fill-vertical-menu-item-bg-active-modern group-data-[sidebar=dark]:group-hover/menu-link:fill-vertical-menu-item-bg-active-dark group-data-[sidebar=dark]:group-hover/menu-link:dark:fill-custom-500/20 group-data-[layout=horizontal]:dark:group-hover/menu-link:fill-custom-500/20 group-data-[sidebar=brand]:group-hover/menu-link:fill-vertical-menu-item-bg-active-brand group-data-[sidebar=modern]:group-hover/menu-link:fill-vertical-menu-item-bg-active-modern group-data-[sidebar-size=md]:block group-data-[sidebar-size=md]:mx-auto group-data-[sidebar-size=md]:mb-2';

const AdminSidebar = () => {
  const isTabletMid = useMediaQuery({ query: '(max-width: 768px)' });
  const pathname = usePathname();
  const [open, setOpen] = useState(!isTabletMid);

  // Sync state with media query
  useEffect(() => {
    if (isTabletMid) {
      setOpen(false);
    } else {
      setOpen(false);
    }
  }, [isTabletMid]);

  // Close sidebar on navigation (mobile)
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
        x: isTabletMid ? -250 : 0, // Slide off screen on mobile, shrink on desktop
        width: isTabletMid ? '0px' : '70px',
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
        className={`md:hidden fixed inset-0 z-[998] bg-black/50 ${
          open ? 'block' : 'hidden'
        }`}
      />

      <motion.div
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={animationVariants}
        className={`text-white shadow-xl md:relative fixed !h-[calc(100vh-4.4rem)] bg-white dark:bg-zinc-900 ${
          open ? 'overflow-hidden' : ''
        }`}
      >
        <div
          className={`flex flex-col pt-[20px] h-[81vh] 2xl:h-[81vh] ${
            isTabletMid && !open ? 'hidden' : ''
          }`}
        >
          {/* Menu Items Loop */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.includes(item.href);

              return (
                <div key={item.id} className="py-1.5">
                  <Link href={item.href} replace>
                    <Tooltip
                      content={open ? '' : item.name}
                      placement="right"
                      arrow={true}
                      className={
                        open ? 'bg-transparent' : 'bg-black text-white'
                      }
                    >
                      <div id={item.id} className={getLinkClasses(isActive)}>
                        <span className="min-w-[1.75rem] group-data-[sidebar-size=sm]:h-[1.75rem] inline-block text-start text-[16px] group-data-[sidebar-size=md]:block group-data-[sidebar-size=sm]:flex group-data-[sidebar-size=sm]:items-center">
                          {React.cloneElement(item.icon, {
                            className: iconClasses,
                          })}
                        </span>

                        {open && (
                          <span
                            className="group-data-[sidebar-size=sm]:ltr:pl-10 group-data-[sidebar-size=sm]:rtl:pr-10 align-middle group-data-[sidebar-size=sm]:group-hover/sm:block group-data-[sidebar-size=sm]:hidden whitespace-nowrap ml-3"
                            data-key={`t-${item.id}`}
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

        {/* Toggle Button (Desktop Only) */}
        {!isTabletMid && (
          <div
            className={`absolute bottom-4 right-0 w-full flex justify-end px-4`}
          >
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LeftArrow
                className={`cursor-pointer text-black dark:text-white w-6 h-6 transition-transform duration-300 ${
                  open ? '' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSidebar;