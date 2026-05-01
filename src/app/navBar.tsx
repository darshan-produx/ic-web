'use client';
import { ChevronDown, LogOut } from 'lucide-react';
import { Dropdown } from '../common/Dropdown';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainLogo } from './assests/icons/icons';
import { useState } from 'react';
import Chatbot from './chatbot';

const Header = () => {
  const pathname = usePathname();
  // Static/mock data for roles
  const myroles = ['USER', 'ADMIN', 'CONFIGURATOR'];
  // Static/mock data for user team
  const getUserTeamData = {
    data: {
      data: [
        {
          children: [{ id: 1, name: 'Team Member 1' }],
        },
      ],
    },
  };
  // Static/mock data for user info
  const userinfo = {
    data: {
      id: 'static-user-id',
      first_name: 'Static',
      last_name: 'User',
    },
  };
  // Static/mock data for navbar config
  const navbarConfig = {
    data: {
      value: {
        Priorities: true,
        Myteam: true,
        Customers: true,
        Opportunities: true,
        Emails: true,
        Meetings: true,
        Risks: true,
        Communication: true,
        Tasks: true,
      },
    },
  };
  const [showSideChatbot, setShowSideChatbox] = useState(false);
  const isLoading = false;

  return (
    <>
      {!isLoading ? (
        <>
          <header
            id="page-topbar"
            className="ltr:md:left-vertical-menu z-[260]  !h-[3.375rem] rtl:md:right-vertical-menu group-data-[sidebar-size=md]:ltr:md:left-vertical-menu-md group-data-[sidebar-size=md]:rtl:md:right-vertical-menu-md group-data-[sidebar-size=sm]:ltr:md:left-vertical-menu-sm group-data-[sidebar-size=sm]:rtl:md:right-vertical-menu-sm group-data-[layout=horizontal]:ltr:left-0 group-data-[layout=horizontal]:rtl:right-0 fixed right-0  left-0 print:hidden group-data-[navbar=bordered]:m-4 group-data-[navbar=bordered]:[&.is-sticky]:mt-0 transition-all ease-linear duration-300 group-data-[navbar=hidden]:hidden group-data-[navbar=scroll]:absolute group/topbar"
          >
            <div className="layout-width">
              <div
                className={`flex items-center px-4 mx-auto bg-topbar  group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:border-topbar-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:border-topbar-brand ${pathname.includes('tasks') ? 'shadow-md' : 'shadow-md'
                  }  h-[3.375rem] shadow-slate-200/50 group-data-[navbar=bordered]:rounded-md group-data-[navbar=bordered]:group-[.is-sticky]/topbar:rounded-t-none group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:border-zink-700 dark:shadow-none group-data-[topbar=dark]:group-[.is-sticky]/topbar:dark:shadow-zink-500 group-data-[topbar=dark]:group-[.is-sticky]/topbar:dark:shadow-md group-data-[navbar=bordered]:shadow-none group-data-[layout=horizontal]:group-data-[navbar=bordered]:rounded-b-none group-data-[layout=horizontal]:shadow-none group-data-[layout=horizontal]:dark:group-[.is-sticky]/topbar:shadow-none`}
              >
                <div className="flex max-w-[1200px]  mx-auto items-center w-full group-data-[layout=horizontal]:mx-auto group-data-[layout=horizontal]:max-w-screen-2xl navbar-header group-data-[layout=horizontal]:ltr:xl:pr-3 group-data-[layout=horizontal]:rtl:xl:pl-3">
                  <div className="items-center justify-center hidden px-5 text-center h-[3.375rem] group-data-[layout=horizontal]:md:flex group-data-[layout=horizontal]:ltr::pl-0 group-data-[layout=horizontal]:rtl:pr-0"></div>

                  <div>
                    <MainLogo className="h-10 mx-auto" width={`135`} />
                  </div>
                  <div className="flex gap-3 ms-auto w-full justify-center">
                    <div className="flex text-center text-sm py-4 gap-[15px]">
                      {navbarConfig?.data?.value?.Priorities &&
                        myroles?.includes('USER') && (
                          <Link href="/app/priorities">
                            <span
                              className={
                                pathname.includes('priorities')
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              Priorities
                            </span>
                          </Link>
                        )}
                      {navbarConfig?.data?.value?.Myteam &&
                        myroles?.includes('USER') &&
                        getUserTeamData?.data?.data[0]?.children.length > 0 && (
                          <Link href="/app/my-team">
                            <span
                              className={
                                pathname.includes('my-team')
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              My team
                            </span>
                          </Link>
                        )}
                      {navbarConfig?.data?.value?.Customers &&
                        myroles?.includes('USER') && (
                          <Link href="/app/customers">
                            <span
                              className={
                                pathname.includes('customers')
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              Customers
                            </span>
                          </Link>
                        )}
                      {navbarConfig?.data?.value?.Opportunities &&
                        myroles?.includes('USER') && (
                          <Link href="/app/insights/opportunities">
                            <span
                              className={
                                pathname.includes('opportunities')
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              Opportunities
                            </span>
                          </Link>
                        )}
                      {navbarConfig?.data?.value?.Risks &&
                        myroles?.includes('USER') && (
                          <Link href="/app/insights">
                            <span
                              className={
                                pathname === '/app/insights'
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              Risks
                            </span>
                          </Link>
                        )}
                      {/* {myroles?.includes('USER') && (
                        <Link href="/app/communication/meetings">
                          <span
                            className={
                              pathname.includes('communication')
                                ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                            }
                          >
                            Communication
                          </span>
                        </Link>
                      )} */}
                      {navbarConfig?.data?.value?.Communication &&
                        myroles?.includes('USER') && (
                          <div
                            className={
                              pathname.includes('communication') ||
                                pathname.includes('emails')
                                ? 'border-b-2 px-[7.5px] relative -mb-[3px] top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                : 'text-gray-400 px-[7.5px] relative top-[7px] cursor-pointer'
                            }
                          >
                            <Dropdown className="relative dropdown shrink-0">
                              <Dropdown.Trigger
                                type="button"
                                className=" !p-0 ease-linear rounded-full text-topbar-item"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                              >
                                <span
                                  className={
                                    pathname.includes('communication') ||
                                      pathname.includes('emails')
                                      ? 'flex items-center gap-2 font-normal text-gray-900'
                                      : 'flex items-center gap-2 font-normal text-gray-400'
                                  }
                                >
                                  Communication
                                  <ChevronDown
                                    size={16}
                                    className="text-[#637083] "
                                  />
                                </span>
                              </Dropdown.Trigger>
                              <Dropdown.Content
                                placement="start-end"
                                data-bs-toggle="dropdown"
                                className="absolute z-[1000] px-[20px] !top-[8px] py-[15px] ltr:text-left rtl:text-right bg-white rounded-md border-[#CED2DA] border shadow-md dropdown-menu w-[8rem] dark:bg-zink-600"
                                aria-labelledby="dropdownMenuButton"
                              >
                                <div className="flex flex-col w-full text-[16px] text-[#141C24] space-y-2">
                                  {navbarConfig?.data?.value?.Emails &&
                                    myroles?.includes('USER') ? (
                                    <Link
                                      href="/app/emails"
                                      className={
                                        pathname.includes('emails')
                                          ? 'text-[#344051] cursor-pointer font-normal w-full close-dropdown'
                                          : 'text-gray-400 hover:text-[#344052] cursor-pointer font-normal w-full close-dropdown'
                                      }
                                    >
                                      <div className="flex text-[14px] items-start font-normal close-dropdown ">
                                        Emails
                                      </div>
                                    </Link>
                                  ) : (
                                    <></>
                                  )}
                                  {navbarConfig?.data?.value?.Meetings &&
                                    myroles?.includes('USER') ? (
                                    <Link
                                      href="/app/communication/meetings"
                                      className={
                                        pathname.includes('meetings')
                                          ? 'text-[#344051] cursor-pointer font-normal w-full close-dropdown'
                                          : 'text-gray-400 hover:text-[#344052] cursor-pointer font-normal w-full close-dropdown'
                                      }
                                    >
                                      <div className="flex text-[14px] items-start font-normal close-dropdown ">
                                        Meetings
                                      </div>
                                    </Link>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </Dropdown.Content>
                            </Dropdown>
                          </div>
                        )}
                      {/* {myroles?.includes('USER') && (
                        <Link href="/app/emails">
                          <span
                            className={
                              pathname.includes('email')
                                ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                            }
                          >
                            Emails
                          </span>
                        </Link>
                      )} */}
                      {navbarConfig?.data?.value?.Tasks &&
                        myroles?.includes('USER') && (
                          <Link href="/app/tasks">
                            <span
                              className={
                                pathname.includes('tasks')
                                  ? 'border-b-2 pb-[17px] pt-3 px-[7.5px] relative top-[7px] border-gray-900 text-gray-900 cursor-pointer'
                                  : 'text-gray-400 pb-[17px] pt-3 px-[7.5px] relative top-[7px] cursor-pointer'
                              }
                            >
                              Tasks
                            </span>
                          </Link>
                        )}

                      <div
                        className={`${myroles?.includes('USER') ? 'visible' : 'invisible'
                          } relative flex items-center`}
                      >
                        <span className=" h-[24px] border-r-[1px] border-gray-200 "></span>
                      </div>
                      <div
                        onClick={() => setShowSideChatbox(true)}
                        className={`flex border-gray-300 border-[1px] px-[10px] py-[5px] rounded-[6px] cursor-pointer relative ${myroles?.includes('USER') ? 'visible' : 'invisible'
                          }`}
                      >
                        <svg
                          width="17"
                          height="20"
                          viewBox="0 0 17 20"
                          fill="none"
                          className=""
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.3626 3.87784L9.7903 5.46816C9.15381 7.2332 7.76408 8.62289 5.99911 9.25936L4.40878 9.83165C4.26526 9.88335 4.26526 10.0866 4.40878 10.1383L5.99911 10.7106C7.76415 11.3471 9.15383 12.7368 9.7903 14.5018L10.3626 16.0921C10.4143 16.2357 10.6175 16.2357 10.6693 16.0921L11.2416 14.5018C11.878 12.7368 13.2678 11.3471 15.0327 10.7106L16.6231 10.1383C16.7666 10.0866 16.7666 9.88336 16.6231 9.83165L15.0327 9.25936C13.2677 8.62287 11.878 7.23314 11.2416 5.46816L10.6693 3.87784C10.6176 3.73343 10.4143 3.73343 10.3626 3.87784Z"
                            fill="#3B82F6"
                          />
                          <path
                            d="M3.20271 0.0554918L2.91211 0.860444C2.58941 1.75367 1.88607 2.45789 0.991961 2.7806L0.187009 3.07119C0.113912 3.09794 0.113912 3.20045 0.187009 3.2263L0.991961 3.5169C1.88518 3.83961 2.58941 4.54294 2.91211 5.43705L3.20271 6.242C3.22945 6.3151 3.33197 6.3151 3.35782 6.242L3.64842 5.43705C3.97113 4.54383 4.67446 3.83961 5.56857 3.5169L6.37352 3.2263C6.44662 3.19956 6.44662 3.09704 6.37352 3.07119L5.56857 2.7806C4.67535 2.45789 3.97113 1.75456 3.64842 0.860444L3.35782 0.0554918C3.33197 -0.0184973 3.22856 -0.0184973 3.20271 0.0554918Z"
                            fill="#3B82F6"
                          />
                          <path
                            d="M3.20271 13.7267L2.91211 14.5316C2.58941 15.4249 1.88607 16.1291 0.991961 16.4518L0.187009 16.7424C0.113912 16.7691 0.113912 16.8717 0.187009 16.8975L0.991961 17.1881C1.88518 17.5108 2.58941 18.2141 2.91211 19.1083L3.20271 19.9132C3.22945 19.9863 3.33197 19.9863 3.35782 19.9132L3.64842 19.1083C3.97113 18.215 4.67446 17.5108 5.56857 17.1881L6.37352 16.8975C6.44662 16.8708 6.44662 16.7682 6.37352 16.7424L5.56857 16.4518C4.67535 16.1291 3.97113 15.4258 3.64842 14.5316L3.35782 13.7267C3.33197 13.6536 3.22856 13.6536 3.20271 13.7267Z"
                            fill="#3B82F6"
                          />
                        </svg>

                        <span
                          className={
                            ' text-gray-900  font-[600] text-[14px] ml-[10px]'
                          }
                        >
                          Ask AI
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 ms-auto z-[20]">
                    <Dropdown className="relative flex items-center h-[3.375rem]">
                      <Dropdown.Trigger
                        type="button"
                        className="inline-block p-0 transition-all duration-200 ease-linear bg-topbar rounded-full text-topbar-item dropdown-toggle btn  hover:text-topbar-item-hover group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:hover:bg-topbar-item-bg-hover-dark group-data-[topbar=dark]:hover:text-topbar-item-hover-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:hover:bg-topbar-item-bg-hover-brand group-data-[topbar=brand]:hover:text-topbar-item-hover-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:hover:bg-zink-600 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:hover:text-zink-50 group-data-[topbar=dark]:dark:text-zink-200"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                      >
                        <div className="">
                          <div className="flex">
                            <div className="flex items-center justify-center w-8 h-8 my-auto mr-2 bg-[#FFB132] text-black rounded-full font-bold text-[12px]">
                              {`${userinfo?.data?.first_name
                                ?.charAt(0)
                                .toUpperCase()}${userinfo?.data?.last_name
                                  ?.charAt(0)
                                  .toUpperCase()}`}
                            </div>
                          </div>
                        </div>
                      </Dropdown.Trigger>
                      <Dropdown.Content
                        placement="right-end"
                        className="absolute z-50 p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md !top-12 !right-4 dropdown-menu min-w-[14rem] dark:bg-zink-600"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <h6 className="mb-2 text-sm font-normal text-slate-500 dark:text-zink-300">
                          {/* Welcome to ImpactCraft */}
                        </h6>
                        <a href="#!" className="flex gap-3 mb-3">
                          <div className="relative inline-block shrink-0">
                            <div className="">
                              <div className="flex">
                                <div className="flex items-center justify-center w-8 h-8 my-auto mr-2 bg-[#FFB132] text-black rounded-full font-bold text-[12px]">
                                  {`${userinfo?.data?.first_name
                                    ?.charAt(0)
                                    .toUpperCase()}${userinfo?.data?.last_name
                                      ?.charAt(0)
                                      .toUpperCase()}`}
                                </div>
                              </div>
                            </div>
                            {/* <span className="-top-1 ltr:-right-1 rtl:-left-1 absolute size-2.5 bg-green-400 border-2 border-white rounded-full dark:border-zink-600"></span> */}
                          </div>
                          <div>
                            <h6 className="mb-1 text-15">
                              {userinfo?.data?.first_name +
                                ' ' +
                                userinfo?.data?.last_name}
                            </h6>
                            <p className="text-slate-500 dark:text-zink-300">
                              {...myroles?.map((ele: any, index: number) => (
                                <span key={index}>
                                  {ele} {index < myroles.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </p>
                          </div>
                        </a>
                        <ul>
                          <li className="pt-2 mt-2 border-t border-slate-200 dark:border-zink-500 cursor-pointer">
                            <span
                              onClick={() => {
                                localStorage.removeItem('access_token');
                                localStorage.removeItem('org_id');
                                localStorage.setItem(
                                  'logout_event',
                                  Date.now().toString()
                                );
                                window.location.replace(window.location.origin);
                              }}
                              className="block ltr:pr-4 rtl:pl-4 py-1.5 text-base font-medium transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:text-custom-500 focus:text-custom-500 dark:text-zink-200 dark:hover:text-custom-500 dark:focus:text-custom-500"
                            >
                              <LogOut className="inline-block size-4 ltr:mr-2 rtl:ml-2"></LogOut>{' '}
                              Sign Out
                            </span>
                          </li>
                        </ul>
                      </Dropdown.Content>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </header>
          {/* {showSideChatbot ? ( */}
          <Chatbot
            setShowSideChatbox={setShowSideChatbox}
            showSideChatbot={showSideChatbot}
            user_id={userinfo?.data?.id ?? ''}
          />
          {/* ) : (
            ''
          )} */}
        </>
      ) : null}
    </>
  );
};

export default Header;
