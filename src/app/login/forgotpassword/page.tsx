'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../common/api-request';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MainLogo } from '../../assests/icons/icons';
import { UserIcon } from 'lucide-react';

import * as yup from 'yup';
import { usePasswordReset } from '../../../services/mutations/usersMutations';
import { ToastContainer, toast } from 'react-toastify';
const ForgotPassword = () => {
  const [resetRequestSent, setResetRequestSent] = useState(false);
  const passwordreset = usePasswordReset();
  const schema = yup.object({
    username: yup.string().max(50).required('Please enter username'),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmitHandler = async (data: any) => {
    try {
      const response = await passwordreset.mutateAsync(data);
      if (response.status === 201) {
        setResetRequestSent(true);
        toast.success(response.data.message);
      }
    } catch (err: any) {
      toast.error('User not found. Please try again.');
    }
    setError('username', {
      type: 'server',
      message: 'User not found. Please try again.',
    });
  };

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
    <>
      <div className="relative">
        <div className="mb-0 w-screen lg:mx-auto lg:w-[500px] card shadow-lg border-none shadow-slate-100 relative">
          <div className="!px-10 !py-12 card-body">
            <div className="relative">
              <MainLogo className="h-10 mx-auto" />
              {!resetRequestSent && (
                <div className="mt-4 flex text-center justify-center">
                  <p className="text-slate-500 dark:text-zink-200">
                    Forgot Password
                  </p>
                </div>
              )}
            </div>
            {!resetRequestSent ? (
              <form className="mt-10" onSubmit={handleSubmit(onSubmitHandler)}>
                <div className="mb-8">
                  <div className="relative  rounded ">
                    <span>
                      <UserIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></UserIcon>
                    </span>
                    <input
                      {...register('username')}
                      type="text"
                      autoFocus
                      tabIndex={1}
                      id="username"
                      className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                      placeholder="Username"
                    />
                  </div>
                  <div
                    id="usernameError"
                    className="text-start text-xs text-red-500 semibold pt-1"
                  >
                    {errors.username?.message}
                  </div>
                </div>

                {/* <!-- Login button --> */}
                <div className="text-center">
                  <button
                    id="signin"
                    type="submit"
                    tabIndex={3}
                    className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                  >
                    Submit
                  </button>
                  <div className="pt-5">
                    <a
                      id="forgotPassword"
                      className="underline cursor-pointer w-fit text-blue-500 py-4"
                      href={'/app'}
                    >
                      Go to login page
                    </a>
                  </div>
                  {/* <!--Forgot password link--> */}
                </div>
              </form>
            ) : (
              <div className="flex justify-center text-center border rounded-lg border-slate-300 p-4">
                We have sent a password reset link to your registered email ID.
                Please follow the instructions mentioned in the link to reset
                your password. If the e-mail is not received, please check the
                Spam/Junk folders. You may close this browser tab.
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default ForgotPassword;
