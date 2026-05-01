import ButtonLoader from '../../../../common/components/buttonloader';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Static credentials � no backend required
const STATIC_USERNAME = 'Admin';
const STATIC_PASSWORD = '@Admin001';

export default function LoginPage({ setLoadingPage }: any) {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { register, handleSubmit, watch } = useForm<{ username: string; password: string }>();

  const onSubmitLoginHandler = async (data: { username: string; password: string }) => {
    setUsernameError('');
    setPasswordError('');
    setIsLoginLoading(true);

    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (data.username !== STATIC_USERNAME) {
      setUsernameError('User not found. Please try again.');
      setIsLoginLoading(false);
      return;
    }

    if (data.password !== STATIC_PASSWORD) {
      setPasswordError('Password failed. Please try again.');
      setIsLoginLoading(false);
      return;
    }

    // Store a static session marker so LogoutListener does not trigger a reload
    localStorage.setItem('access_token', 'static_session');
    router.push('/app/priorities');
  };

  return (
    <form className="" id="login" onSubmit={handleSubmit(onSubmitLoginHandler)}>
      <div className="w-[360px]  transition-all duration-500 ease-in-out">
        <div className="w-full flex-col bg-white items-center gap-[16px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[20px] mt-[30px]">
          <span className="py-[10px] text-[16px] text-[#637083]">
            Sign in
          </span>
          <div className="w-full px-[30px]">
            <div className="h-[54px]">
              <input
                {...register('username')}
                type="text"
                tabIndex={1}
                id="username"
                className={`form-input w-full text-[16px] text-[#202B37] placeholder:text-[#637083] !h-full border-slate-200 rounded-[16px] dark:border-zink-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200`}
                placeholder="Username"
              />
            </div>
            {usernameError && (
              <div
                id="usernameError"
                className="text-start text-xs text-red-500 semibold pt-1"
              >
                {usernameError}
              </div>
            )}
          </div>
          <div className="w-full px-[30px]">
            <div className="h-[54px]">
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="off"
                tabIndex={2}
                className={`form-input w-full text-[16px] text-[#202B37] !h-full placeholder:text-[#637083] border-slate-200 rounded-[16px] dark:border-zink-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200`}
                placeholder="Password"
              />
            </div>
            {passwordError && (
              <div
                id="passwordError"
                className="text-start text-xs text-red-500 semibold pt-1"
              >
                {passwordError}
              </div>
            )}
          </div>

          <div className="w-full px-[30px]">
            <button
              id="signin"
              type="submit"
              disabled={!watch('username') || !watch('password')}
              className={`py-[15px] w-full items-center rounded-2xl flex justify-center font-semibold text-[16px] ${
                watch('username') && watch('password')
                  ? 'text-white bg-[#1A75FF]'
                  : 'text-[#97A1AF] bg-[#F9FAFB]'
              }`}
            >
              <span className="items-center flex">
                Sign in &nbsp;
                {isLoginLoading && <ButtonLoader />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
