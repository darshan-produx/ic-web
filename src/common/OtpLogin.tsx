import { LockIcon, UserIcon } from 'lucide-react';
import { MainLogo } from '../app/assests/icons/icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSendOTP, useVerifyOTP } from '../services/mutations/usersMutations';
import { emailRegEx } from '../app/utils/constant';
import { redirect } from 'next/navigation';

export default function OtpLogin() {
  const [verifyOtp, setVerifyOtp] = useState(false);
  const [OTPId, setOTPId] = useState('');

  const schema = yup.object({
    username: yup.string().max(50).required('Please enter email'),
  });

  const schemaOtp = yup.object({
    otpVerify: yup
      .string()
      .required('Please enter verify OTP')
      .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schemaOtp) });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    setError: setErrorEmail,
    formState: { errors: errorEmail },
  } = useForm({ resolver: yupResolver(schema) });

  const sendOTPEmail = useSendOTP();
  const verifyOtpApi = useVerifyOTP();
  const onSubmitHandler = async (data: any) => {
    try {
      if (OTPId) {
        const data1 = { otp_id: OTPId, otp_value: data?.otpVerify };

        const res = await verifyOtpApi.mutateAsync(data1);
        if (res.status == 200 || res.status == 201) {
          setOTPId('');
          localStorage.setItem('access_token', res.data.access_token);
          localStorage.setItem('org_id', res.data.org_id);
          setTimeout(() => {
            window?.location?.reload();
            setVerifyOtp(false);
          }, 2000);
        } else {
          setError('otpVerify', {
            type: 'manual',
            message: 'Please enter valid OTP',
          });
        }
      }
    } catch (err: any) {
      setError('otpVerify', {
        type: 'manual',
        message: 'Please enter valid OTP',
      });
    }
  };

  const onSubmitEmail = async (data: any) => {
    if (!emailRegEx.test(data.username)) {
      setErrorEmail('username', {
        type: 'manual',
        message: 'Please enter valid email address',
      });
    } else {
      try {
        const res = await sendOTPEmail?.mutateAsync(data?.username);
        if (res?.status == 200 || res?.status == 201) {
          setVerifyOtp(true);
          setOTPId(res.data?.otp_id);
        }
      } catch (err: any) {
        setErrorEmail('username', {
          type: 'manual',
          message: 'Please enter valid email address',
        });
      }
    }
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

              <div className="mt-4 flex text-center justify-center">
                <p className="text-slate-500 dark:text-zink-200">
                  {verifyOtp
                    ? 'OTP sent to your email. Please check and verify'
                    : 'OTP verification'}
                </p>
              </div>
            </div>

            {verifyOtp ? (
              <>
                <form
                  className="mt-10"
                  onSubmit={handleSubmit(onSubmitHandler)}
                >
                  <div className="mb-8">
                    <div className="relative  rounded ">
                      <span>
                        <LockIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></LockIcon>
                      </span>
                      <input
                        {...register('otpVerify')}
                        type="text"
                        name="otpVerify"
                        autoFocus
                        tabIndex={1}
                        id="otpVerify"
                        className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                        placeholder="Verify OTP"
                      />
                    </div>
                    <div
                      id="otpVerifyError"
                      className="text-start text-xs text-red-500 semibold pt-1"
                    >
                      {errors.otpVerify?.message}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      id="signin"
                      type="submit"
                      tabIndex={3}
                      className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <form
                className="mt-10"
                onSubmit={handleSubmitEmail(onSubmitEmail)}
              >
                <div className="mb-8">
                  <div className="relative  rounded ">
                    <span>
                      <UserIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></UserIcon>
                    </span>
                    <input
                      {...registerEmail('username')}
                      type="text"
                      autoFocus
                      tabIndex={1}
                      id="username"
                      className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                      placeholder="Enter email"
                    />
                  </div>
                  <div
                    id="usernameError"
                    className="text-start text-xs text-red-500 semibold pt-1"
                  >
                    {errorEmail.username?.message}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    id="signin"
                    type="submit"
                    tabIndex={3}
                    className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
