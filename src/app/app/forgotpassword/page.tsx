'use client';
import { MainLogo, UserIcon } from '../../assests/icons/icons';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { emailRegEx } from '../../utils/constant';
import { useForgotPassword } from '../../../services/mutations/usersMutations';
import { toast } from 'react-toastify';

const schema = yup.object({
  username: yup.string().max(50).required('Please enter username'),
});
const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const forgotPassword = useForgotPassword();
  const onSubmitHandler = async (data: any) => {
    if (!emailRegEx.test(data.email)) {
      setError('username', {
        type: 'manual',
        message: 'Please enter valid email address',
      });
    } else {
      try {
        const res = forgotPassword.mutateAsync(data);
        toast.success(
          'your request has been successfully submitted. Please check your email'
        );
      } catch (err: any) {
        setError('username', {
          type: 'manual',
          message: 'Please enter registered email address',
        });
      }
    }
  };
  return (
    <div className="relative">
      <div className="mb-0 w-screen lg:mx-auto lg:w-[500px] card shadow-lg border-none shadow-slate-100 relative">
        <div className="!px-10 !py-12 card-body">
          <div className="relative">
            <MainLogo className="h-10 mx-auto" />
            <div className="mt-4 text-center">
              <p className="text-slate-500 dark:text-zink-200">
                Sign in to continue to ImpactCraft
              </p>
            </div>
          </div>

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
                  placeholder="Enter email"
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
                Sign In
              </button>
              {/* <!--Forgot password link--> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
