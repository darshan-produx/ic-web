'use client';
import { useEffect } from 'react';
import { MainLogo } from '../app/assests/icons/icons';

export default function LicenseInvalid() {
  useEffect(() => {
    const bodyElement = document.body;

    bodyElement.classList.add(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      'py-16',
      'lg:py-10',
      'bg-slate-50',
      'dark:bg-zink-800',
      'dark:text-zink-100',
      'font-public'
    );

    return () => {
      bodyElement.classList.remove(
        'flex',
        'items-center',
        'justify-center',
        'min-h-screen',
        'py-16',
        'lg:py-10',
        'bg-slate-50',
        'dark:bg-zink-800',
        'dark:text-zink-100',
        'font-public'
      );
    };
  }, []);
  return (
    <div className="relative">
      <div className="mb-0 w-screen lg:mx-auto lg:w-[500px] card shadow-lg border-none shadow-slate-100 relative">
        <div className="!px-10 !py-12 card-body">
          <div className="relative">
            <MainLogo className="h-10 mx-auto" />
            <div className="mt-4 text-center">
              <p className="text-slate-500 dark:text-zink-200">
                {/* Sign in to continue to ImpactCraft. */}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="mt-6">Invalid status :(</div>

            <div className=" text-center mt-[10px]">
              <a
                className="underline cursor-pointer w-fit text-blue-500  forgotPas"
                tabIndex={4}
                href={'/'}
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('org_id');
                }}
              >
                Continue as another user
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
