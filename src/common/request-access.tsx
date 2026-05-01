import { useEffect, useState } from 'react';
import { MainLogo } from '../app/assests/icons/icons';
import { useRequestAccess } from '../services/mutations/usersMutations';
import { toast } from 'react-toastify';

export default function RequestAccess() {
  const requestAccess = useRequestAccess();
  const [disabled, setDisabled] = useState(false);
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
            <div className="mt-6">
              You do not have access to the system. Please request access if you
              want to login
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  try {
                    const res = requestAccess.mutateAsync(
                      localStorage.getItem('org_id') ?? ''
                    );
                    toast.success(
                      'Your access request has been submitted. We will get back to you shortly'
                    );
                    setDisabled(true);
                  } catch (err: any) {
                    toast.error(err?.message);
                  }
                }}
                id="request_access"
                disabled={disabled}
                className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 disabled:border-custom-600/25 disabled:bg-custom-600/25 disabled:cursor-not-allowed"
              >
                Request Access
              </button>
              {/* <!--Forgot password link--> */}
            </div>
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
