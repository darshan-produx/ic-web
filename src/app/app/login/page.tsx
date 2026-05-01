'use client';
import React, { useEffect, useState } from 'react';

import LoginPage from './components/login';

import ResetPassword from './components/resetPassword';
import ResetRequest from './components/resetRequest';
import ResetPasswordSuccess from './components/resetPasswordSuccess';
import InvalideToken from './components/invalideToken';
import ForgotPassword from './components/forgotPassword';
import LoginContent from './components/loginContent';

const Login = (props: any) => {
  const [ssoLogin, setSSOLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPage, setLoadingPage] = useState('login');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token');
    if (t) {
      setToken(t);
      setLoadingPage('resetPassword');
    }
  }, []);

  useEffect(() => {
    const bodyElement = document.body;

    bodyElement.classList.add(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',

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

        'bg-slate-50',
        'dark:bg-zink-800',
        'dark:text-zink-100',
        'font-public'
      );
    };
  }, []);

  const onEyeClick = () => {
    setShowPassword(!showPassword);
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <>
      {/* <div className="relative">
        <div className="mb-0 w-screen lg:mx-auto lg:w-[500px] card shadow-lg border-none shadow-slate-100 relative">
          <div className="!px-10 !py-12 card-body ">
            <div className="relative">
              <MainLogo className="h-10 mx-auto" />
              <div className="mt-4 text-center">
                <p className="text-slate-500 dark:text-zink-200">
                  Sign in to continue to ImpactCraft
                </p>
              </div>
            </div>
            {ssoLogin ? (
              <div className="relative text-center mt-6 before:absolute before:top-3 before:left-0 before:right-0 ">
                <a
                  href="/api/app-service/v1/auth/oauth2/redirect"
                  className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                >
                  SSO Sign In
                </a>
                <div className="mt-6">
                  <a
                    id="forgotPassword"
                    className="underline cursor-pointer w-fit text-blue-500  forgotPas"
                    tabIndex={4}
                    href={'#'}
                    onClick={() => setSSOLogin(false)}
                  >
                    Back to login
                  </a>
                </div>
              </div>
            ) : (
              <form className="mt-10" onSubmit={handleSubmit(onSubmitHandler)}>
                <div className="mb-2">
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
                <div className="mb-8">
                  <div className="relative  rounded b">
                    <span>
                      <LockIcon className="absolute top-0 left-1 h-6 mr-1 my-1.5  text-slate-400 cursor-pointer"></LockIcon>
                    </span>
                    <input
                      {...register('password')}
                      type={!showPassword ? 'password' : 'text'}
                      id="password"
                      tabIndex={2}
                      className={`form-input px-8 border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200`}
                      placeholder="Password"
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
                    {errors.password?.message}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    id="signin"
                    type="submit"
                    tabIndex={3}
                    className="w-full text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                  >
                    Sign In
                  </button>
                </div>
                <div className=" text-center mt-[10px] flex justify-between">
                  <Link
                    id="forgotPassword"
                    className="underline cursor-pointer w-fit text-blue-500  forgotPas"
                    href={'/login/forgotpassword'}
                  >
                    Forgot password?
                  </Link>
                  <a
                    id="forgotPassword"
                    className="underline cursor-pointer w-fit text-blue-500  forgotPas"
                    tabIndex={4}
                    href={'#'}
                    onClick={() => setSSOLogin(true)}
                  >
                    Sign in with SSO
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div> */}
      <div
        className="w-screen h-screen bg-no-repeat bg-cover"
        style={{ backgroundImage: 'url(/loginTexture.png)' }}
      >
        <div className=" h-[calc(100vh-32px)]  items-center flex flex-col justify-center">
          <div className="flex justify-between w-[1200px] mx-auto transition-all duration-500 ease-in-out">
            <LoginContent />
            {loadingPage === 'login' ? (
              <LoginPage setLoadingPage={setLoadingPage} />
            ) : loadingPage === 'forgotPassword' ? (
              <ForgotPassword setLoadingPage={setLoadingPage} />
            ) : loadingPage === 'resetRequest' ? (
              <ResetRequest closeTab={closeTab} />
            ) : loadingPage === 'resetPassword' ? (
              <ResetPassword token={token} setLoadingPage={setLoadingPage} />
            ) : loadingPage === 'resetPasswordSuccess' ? (
              <ResetPasswordSuccess setLoadingPage={setLoadingPage} />
            ) : loadingPage === 'invalideToken' ? (
              <InvalideToken setLoadingPage={setLoadingPage} />
            ) : null}
          </div>
        </div>
        <div className="h-[32px] justify-end w-[1200px] mx-auto flex text-[#637083] text-[12px] gap-6">
          <a
            href="https://www.impactcraft.ai/terms-of-use/"
            className="underline-none"
          >
            Terms of Use
          </a>
          <a
            href="https://www.impactcraft.ai/privacy-policy/"
            className="underline-none"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
};

export default Login;
