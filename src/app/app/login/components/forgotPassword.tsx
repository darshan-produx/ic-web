import { yupResolver } from '@hookform/resolvers/yup';
import { usePasswordReset } from '../../../../services/mutations/usersMutations';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const schema = yup.object({
  username: yup
    .string()
    .email('Please enter valid email')
    .max(50)
    .required('Please enter email'),
});

export default function ForgotPassword({ setLoadingPage }: any) {
  const passwordreset = usePasswordReset();

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmitForgotPassHandler = async (data: any) => {
    try {
      const response = await passwordreset.mutateAsync(data);
      if (response.status === 201) {
        setLoadingPage('resetRequest');
        toast.success(response.data.message);
      }
    } catch (err: any) {
      // toast.error('User not found. Please try again.');
      setError('username', {
        type: 'server',
        message: 'User not found. Please try again.',
      });
    }
  };

  return (
    <form
      className=""
      id="forgotPassword"
      onSubmit={handleSubmit(onSubmitForgotPassHandler)}
    >
      <div className="w-[360px] h-full items-center flex justify-center">
        <div className="w-full">
          {' '}
          <span
            className="text-[16px] text-[#3B82F6] flex gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault(), setLoadingPage('login');
            }}
          >
            <ChevronLeft className="h-6 w-4" /> Back
          </span>
          <div className="w-full flex-col bg-white items-center gap-[16px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[20px] mt-[20px]">
            <span className="py-[10px] text-[16px] text-[#637083]">
              Forgot Password
            </span>
            <div className="w-full px-[30px]">
              <div className="h-[54px]">
                <input
                  {...register('username')}
                  type="text"
                  autoComplete="off"
                  tabIndex={1}
                  id="username"
                  className={`form-input w-full text-[16px] !h-full text-[#202B37] placeholder:text-[#637083] border-slate-200 rounded-[16px] dark:border-zink-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200`}
                  placeholder="Email address"
                />
              </div>
              <div
                id="usernameError"
                className="text-start text-xs text-red-500 semibold pt-1"
              >
                {errors.username?.message}
              </div>
            </div>
            <div className="w-full px-[29px] mb-4">
              <button
                id="forgot"
                type="submit"
                disabled={watch('username') ? false : true}
                className={`py-[10px] w-full rounded-2xl flex justify-center text-[16px] font-semibold  ${
                  watch('username')
                    ? 'text-white bg-[#1A75FF]'
                    : 'text-[#97A1AF] bg-[#F9FAFB]'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
