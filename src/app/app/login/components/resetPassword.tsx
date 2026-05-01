import { yupResolver } from '@hookform/resolvers/yup';
import {
  useCreateNewPassword,
  useValidateToken,
} from '../../../../services/mutations/usersMutations';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
const schema = yup.object({
  newPassword: yup
    .string()
    .min(12, 'Requires 12 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .test('oneUppercase', 'Requires one uppercase character', (value: any) =>
      /[A-Z]/.test(value)
    )
    .test('oneLowercase', 'Requires one lowercase character', (value: any) =>
      /[a-z]/.test(value)
    )
    .test('oneSpecialChar', 'Requires one special character', (value: any) =>
      /[!@#$%^&*]/.test(value)
    )
    .test('oneNumber', 'Requires one number', (value: any) =>
      /[0-9]/.test(value)
    )
    .test('noSpace', 'No spaces allowed', (value: any) => !value.includes(' '))
    .required('Please enter password'),
  reEnteredPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), ''], `Passwords don't match`)
    .required('Please enter password'),
});
export default function ResetPassword({ token, setLoadingPage }: any) {
  const newPasswordMutation = useCreateNewPassword();
  const validateToken = useValidateToken();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const validateTokenHandler = async () => {
    try {
      const response = await validateToken.mutateAsync(token);
    } catch (error: any) {
      if (
        error?.response?.data?.statusCode === 400 ||
        error?.response?.data?.statusCode === 404
      ) {
        setLoadingPage('invalideToken');
      }
    }
  };

  useEffect(() => {
    validateTokenHandler();
  }, []);

  const onSubmitResetPasswordHandler = async (data: any) => {
    try {
      const response = await newPasswordMutation.mutateAsync({
        password: data.newPassword,
        token: token,
      });
      if (response.status === 201) {
        setLoadingPage('resetPasswordSuccess');
        toast.success(response.data.message);
        window.history.replaceState({}, '', '/app');
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error(err?.response?.data?.message);

        return;
      }
    }
  };
  return (
    <form className="" onSubmit={handleSubmit(onSubmitResetPasswordHandler)}>
      <div className="w-[360px] h-full items-center flex justify-center">
        <div className="w-full">
          <div className="w-full flex-col bg-white items-center gap-[16px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[20px] mt-[20px]">
            <span className="pt-[10px] text-[16px] text-[#637083]">
              Reset password
            </span>
            <span className="text-[12px] text-[#637083] px-[50px] pb-[10px] text-center">
              Password must be at least 12 characters long and include one
              uppercase letter, one special character, and one number
            </span>
            <div className="w-full flex flex-col gap-[16px]">
              <div className="w-full px-[30px] ">
                <div className="h-[54px]">
                  <input
                    {...register('newPassword')}
                    type={'password'}
                    id="newPassword"
                    tabIndex={1}
                    className={`form-input w-full text-[16px] placeholder:text-[#637083] !h-full border-slate-200 rounded-[16px] dark:border-zink-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200`}
                    placeholder="New password"
                  />
                </div>
                {errors.newPassword?.message && (
                  <div
                    id="passwordError"
                    className="text-start text-xs text-red-500 semibold pt-1"
                  >
                    {errors.newPassword?.message}
                  </div>
                )}
              </div>
              <div className="w-full px-[30px] ">
                <div className="h-[54px]">
                  <input
                    {...register('reEnteredPassword')}
                    type={'password'}
                    id="reEnteredPassword"
                    tabIndex={2}
                    className={`form-input w-full text-[16px] placeholder:text-[#637083] !h-full border-slate-200 rounded-[16px] dark:border-zink-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200`}
                    placeholder="Re-Enter password"
                  />
                </div>
                {errors.reEnteredPassword?.message &&
                  !errors.newPassword?.message && (
                    <div
                      id="passwordError"
                      className="text-start text-xs text-red-500 semibold pt-1"
                    >
                      {errors.reEnteredPassword?.message}
                    </div>
                  )}
              </div>
            </div>
            <div className="w-full px-[29px] mb-4">
              <button
                id="forgot"
                type="submit"
                disabled={!watch('newPassword') || !watch('reEnteredPassword')}
                className={`py-[10px] w-full rounded-2xl flex justify-center text-[16px] font-semibold ${
                  watch('newPassword') && watch('reEnteredPassword')
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
