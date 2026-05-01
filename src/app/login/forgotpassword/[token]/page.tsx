'use client';
import React, { useEffect, useState } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MainLogo,
} from '../../../assests/icons/icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
  useCreateNewPassword,
  useValidateToken,
} from '../../../../services/mutations/usersMutations';

const schema = yup.object({
  newPassword: yup
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Please enter password'),
  reEnteredPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), ''], 'Passwords must match')
    .required('Please enter password'),
});
const PasswordReset = ({ params }: { params: { token: string } }) => {
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMesssage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const newPasswordMutation = useCreateNewPassword();
  const validateToken = useValidateToken();
  const onSubmitHandler = async (data: any) => {
    try {
      const response = await newPasswordMutation.mutateAsync({
        password: data.newPassword,
        token: params.token,
      });
      if (response.status === 201) {
        setIsPasswordChanged(true);
      }
    } catch (err: any) {
      if (err?.response?.data?.status === 404) {
        setError('newPassword', {
          type: 'manual',
          message: err?.response?.data?.message,
        });
        return;
      }
    }
  };

  const onEyeClick = () => {
    setShowPassword(!showPassword);
  };
  const validateTokenHandler = async () => {
    try {
      const response = await validateToken.mutateAsync(params.token);
    } catch (error: any) {
      if (
        error?.response?.data?.statusCode === 400 ||
        error?.response?.data?.statusCode === 404
      ) {
        setErrorMesssage(error?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (params.token) {
      validateTokenHandler();
    }
  }, [params.token]);
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
            {errorMessage ? (
              <div>
                <MainLogo className="h-10 mx-auto" />
                <div className="flex justify-center text-center border rounded-lg border-slate-300 p-4">
                  {' '}
                  {errorMessage}
                </div>
              </div>
            ) : (
              <>
                {' '}
                <div className="relative">
                  <MainLogo className="h-10 mx-auto" />
                  {!isPasswordChanged && (
                    <div className="mt-4 text-center">
                      <p className="text-slate-500 dark:text-zink-200">
                        Reset your password
                      </p>
                    </div>
                  )}
                </div>
                {!isPasswordChanged ? (
                  <form
                    className="mt-10"
                    onSubmit={handleSubmit(onSubmitHandler)}
                  >
                    <div className="mb-2">
                      <div className="relative  rounded b">
                        <span>
                          <LockIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5  text-slate-400 cursor-pointer"></LockIcon>
                        </span>
                        <input
                          {...register('newPassword')}
                          type={!showPassword ? 'password' : 'text'}
                          id="newPassword"
                          tabIndex={2}
                          className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                          placeholder="New Password"
                        />
                        {!showPassword ? (
                          <span onClick={onEyeClick}>
                            <EyeIcon className="absolute top-0  right-0 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></EyeIcon>
                          </span>
                        ) : (
                          <span onClick={onEyeClick}>
                            <EyeOffIcon className="absolute top-0 right-0 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></EyeOffIcon>
                          </span>
                        )}
                      </div>
                      <div
                        id="newPasswordError"
                        className="text-start text-xs text-red-500 semibold pt-1"
                      >
                        {errors.newPassword?.message}
                      </div>
                    </div>
                    <div className="mb-8">
                      <div className="relative  rounded b">
                        <span>
                          <LockIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5  text-slate-400 cursor-pointer"></LockIcon>
                        </span>
                        <input
                          {...register('reEnteredPassword')}
                          type={!showPassword ? 'password' : 'text'}
                          id="reEnteredPassword"
                          tabIndex={2}
                          className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                          placeholder="Re-enter password"
                        />
                        {!showPassword ? (
                          <span onClick={onEyeClick}>
                            <EyeIcon className="absolute top-0  right-0 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></EyeIcon>
                          </span>
                        ) : (
                          <span onClick={onEyeClick}>
                            <EyeOffIcon className="absolute top-0 right-0 h-6 mr-1 my-1.5 text-slate-400 cursor-pointer"></EyeOffIcon>
                          </span>
                        )}
                      </div>
                      <div
                        id="passwordError"
                        className="text-start text-xs text-red-500 semibold pt-1"
                      >
                        {errors.reEnteredPassword?.message}
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
                      {/* <!--Forgot password link--> */}
                    </div>
                  </form>
                ) : (
                  <div className=" justify-center text-center border rounded-lg border-slate-300 p-4">
                    You have updated your password successfully.
                    <div>
                      <a
                        id="forgotPassword"
                        className="underline cursor-pointer w-fit text-blue-500  forgotPas"
                        href={'/app'}
                      >
                        Go to login page
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default PasswordReset;
