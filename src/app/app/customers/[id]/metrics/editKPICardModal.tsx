import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { EditKPIInfoCircleIcon } from '../../../../../app/assests/icons/icons';
import Tippy from '@tippyjs/react';
import {
  useAdoptionBusinessKPIParametersMutation,
  usePerformanceDefectKPIParametersMutation,
} from '../../../../../services/mutations/customer360ChartMutations';
import History from './historyCard';
import Flatpickr from 'react-flatpickr';
import { useQueryClient } from '@tanstack/react-query';
const schema = yup.object({
  Target: yup.number().typeError('Must be a number'),
  Threshold: yup.number().typeError('Must be a number'),
  status_flag: yup.boolean(),
  insight_flag: yup.boolean(),
  kpi_snooze_till: yup.date().nullable(),
});

export default function EditKPICardModal({
  id,
  target,
  threshold,
  pillar,
  frequency,
  status_flag,
  insight_flag,
  history,
  setOnExpandChartSetting,
  isTargetThresholdEditEnabled,
  allowStatusInsightsToggle,
  kpiSnoozeTill,
}: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Target: target,
      Threshold: threshold,
      status_flag: status_flag,
      insight_flag: insight_flag,
      kpi_snooze_till: kpiSnoozeTill
        ? dayjs(kpiSnoozeTill).toDate()
        : dayjs().add(30, 'day').toDate(),
    },
  });
  const [comment, setComment] = useState('');
  const statusFlag = watch('status_flag');
  const insightFlag = watch('insight_flag');
  const kpiSnoozeTillWatch = watch('kpi_snooze_till');
  const [checked, setChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const updateAdoptionBusinessParameter =
    useAdoptionBusinessKPIParametersMutation();
  const updatePerformanceDefectsParameter =
    usePerformanceDefectKPIParametersMutation();

  const queryClient = useQueryClient();

  const handleDateChange = (selectedDates: Date[]) => {
    setValue('kpi_snooze_till', selectedDates[0], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setIsOpen(false);
  };
  const onSubmitHandler = async (data: any) => {
    try {
      const payload = {
        ...data,
        id,
        threshold: data?.Threshold,
        target: data?.Target,
        comment,
      };
      delete payload?.Threshold;
      delete payload?.Target;
      if (insightFlag === true && statusFlag === true) {
        payload.kpi_snooze_till = null;
      }
      if (
        pillar?.toLowerCase() === 'adoption' ||
        pillar?.toLowerCase() === 'business'
      ) {
        const response = await updateAdoptionBusinessParameter.mutateAsync(
          payload
        );
        if (response.status === 200 || response.status === 201) {
          setOnExpandChartSetting('');
          toast.success(
            <div>
              <div className="text-[14px] font-medium leading-5 text-[#202B37]">
                KPI changed
              </div>
              <div className="mt-1 text-[12px] font-normal leading-4 text-[#637083]">
                Changes visible after next update
              </div>
            </div>
          );
          queryClient.invalidateQueries({
            queryKey: ['getPillarStatus'],
            exact: false,
          });
          reset();
        }
      } else if (pillar?.toLowerCase() === 'performance') {
        const response = await updatePerformanceDefectsParameter.mutateAsync(
          payload
        );
        if (response.status === 200 || response.status === 201) {
          setOnExpandChartSetting('');
          toast.success(
            <div>
              <div className="text-[14px] font-medium leading-5 text-[#202B37]">
                KPI changed
              </div>
              <div className="mt-1 text-[12px] font-normal leading-4 text-[#637083]">
                Changes visible after next update
              </div>
            </div>
          );
          queryClient.invalidateQueries({
            queryKey: ['getPillarStatus'],
            exact: false,
          });
          reset();
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    clearErrors();
    setValue('Target', target);
    setValue('Threshold', threshold);
    setValue('status_flag', status_flag);
    setValue('insight_flag', insight_flag);
    kpiSnoozeTill ? setChecked(true) : setChecked(false);
  }, []);
  const formValues = watch();

  const disableTargetThreshold =
    (!statusFlag && !insightFlag) || !isTargetThresholdEditEnabled;

  return (
    <form className="" onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="bg-[#FFFFFF] shadow-[0px_0.73px_36.69px_0px_rgba(172,172,172,0.149)] border-[#ACACAC26]/15% py-[25px] px-[30px] rounded-xl flex gap-[40px] z-{9999}">
        <div className="flex flex-col gap-[37px]">
          <div>
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-[14px] font-medium leading-5 text-[#249782] ${
                  disableTargetThreshold ? 'opacity-50' : ''
                }`}
              >
                Target
              </label>
              <input
                {...register('Target')}
                className={`max-w-[248px] max-h-10 pl-3 pt-2 pr-2 pb-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] no-spinner ${
                  disableTargetThreshold ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Enter Target"
                autoComplete="off"
                disabled={disableTargetThreshold}
                type="number"
                step="any"
                inputMode="decimal"
              />
            </div>
            {/* {errors.Target && (
                <p className="text-red-600 text-[14px]">
                  {errors.Target.message}
                </p>
              )} */}
          </div>
          <div>
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-[14px] font-medium leading-5 text-[#EF4444] ${
                  disableTargetThreshold ? 'opacity-50' : ''
                }`}
              >
                Threshold
              </label>
              <input
                {...register('Threshold')}
                className={`max-w-[248px] max-h-10 pl-3 pt-2 pr-2 pb-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] no-spinner ${
                  disableTargetThreshold ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Enter Threshold"
                autoComplete="off"
                disabled={disableTargetThreshold}
                type="number"
                step="any"
                inputMode="decimal"
              />
            </div>
            {/* {errors.Threshold && (
                <p className="text-red-600 text-[14px]">
                  {errors.Threshold.message}
                </p>
              )} */}
          </div>
          <div className="flex gap-[27.33px] items-center whitespace-nowrap">
            <div className="flex gap-[5px] items-center">
              <div
                className={`text-[14px] font-medium leading-5 text-[#344051] ${
                  !allowStatusInsightsToggle ? 'opacity-50' : ''
                }`}
              >
                Track status
              </div>
              <div>
                <Tippy
                  content={
                    <div className="text-[12px] font-semibold leading-4 text-[#202B37]">
                      Include this status in the top pillar's total. <br />
                      Turn on to add it; off to separate it
                    </div>
                  }
                  interactive={true}
                  placement="top"
                  theme="transparent"
                  key="TrackStatus"
                >
                  <span
                    className={`${
                      !allowStatusInsightsToggle ? 'opacity-50' : ''
                    }`}
                  >
                    <EditKPIInfoCircleIcon />
                  </span>
                </Tippy>
              </div>
            </div>
            <div className="flex w-[106px] min-h-8 rounded-lg border border-[#CED2DA] text-[14px] font-semibold leading-5 text-[#344051] cursor-pointer">
              <button
                type="button"
                className={`flex-1 px-4 py-[6px] border-r border-[#CED2DA] text-center ${
                  statusFlag ? 'bg-[#F2F4F7] rounded-l-lg' : ''
                } ${
                  !allowStatusInsightsToggle
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={() =>
                  setValue('status_flag', true, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={!allowStatusInsightsToggle}
              >
                On
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-[6px] text-center ${
                  !statusFlag
                    ? 'bg-[#F2F4F7]  rounded-r-lg border-r border-[#CED2DA]'
                    : ''
                } ${
                  !allowStatusInsightsToggle
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={() =>
                  setValue('status_flag', false, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={!allowStatusInsightsToggle}
              >
                Off
              </button>
            </div>
          </div>
          <div className="flex gap-[16.33px] items-center whitespace-nowrap">
            <div className="flex gap-[5px] items-center">
              <div
                className={`text-[14px] font-medium leading-5 text-[#344051] ${
                  !allowStatusInsightsToggle ? 'opacity-50' : ''
                }`}
              >
                Track insights
              </div>
              <div>
                <Tippy
                  content={
                    <div className="text-[12px] font-semibold leading-4 text-[#202B37]">
                      Turn on to monitor trends over time; <br />
                      turn off to skip tracking for this metric
                    </div>
                  }
                  interactive={true}
                  placement="bottom"
                  theme="transparent"
                  key="Trackinsights"
                >
                  <span
                    className={`${
                      !allowStatusInsightsToggle ? 'opacity-50' : ''
                    }`}
                  >
                    <EditKPIInfoCircleIcon />
                  </span>
                </Tippy>
              </div>
            </div>
            <div className="flex w-[106px] min-h-8 rounded-lg border border-[#CED2DA] text-[14px] font-semibold leading-5 text-[#344051] cursor-pointer">
              <button
                type="button"
                className={`flex-1 px-4 py-[6px] border-r border-[#CED2DA] text-center ${
                  insightFlag ? 'bg-[#F2F4F7] rounded-l-lg' : ''
                } ${
                  !allowStatusInsightsToggle
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={() =>
                  setValue('insight_flag', true, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={!allowStatusInsightsToggle}
              >
                On
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-[6px] text-center ${
                  !insightFlag
                    ? 'bg-[#F2F4F7] rounded-r-lg border-r border-[#CED2DA]'
                    : ''
                } ${
                  !allowStatusInsightsToggle
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={() =>
                  setValue('insight_flag', false, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={!allowStatusInsightsToggle}
              >
                Off
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          <div className="flex flex-col gap-[10px]">
            <textarea
              className="max-w-[252px] min-h-[168px] rounded-[8px] pl-3 mt-[2.5px] pt-2 pb-2 text-[14px] font-normal leading-5 text-[#637083] border-[1px] border-[#CED2DA] bg-white"
              id="comment"
              placeholder="Add a note about this update"
              rows={4}
              style={{ whiteSpace: 'pre-wrap' }}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
            />
            <div className="flex gap-[9.33px]">
              <p className="text-[12px] font-medium leading-5 text-[#344051]">
                Last updated on:{' '}
                {history?.updated_at
                  ? dayjs(history?.updated_at).format('MMM DD, YYYY')
                  : 'N/A'}
              </p>
              <span className="">
                <Tippy
                  content={<History history={history} />}
                  interactive={true}
                  placement="top"
                  theme="transparent"
                  key="Track history"
                  zIndex={9999}
                  appendTo={document.body}
                >
                  <EditKPIInfoCircleIcon />
                </Tippy>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[22px] mt-auto">
            {(!statusFlag || !insightFlag) && (
              <div className="flex items-center space-x-1 whitespace-nowrap">
                <label className="inline-flex items-center gap-2 cursor-pointer relative ">
                  <input
                    id="checkboxDefault1"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setChecked(e.target.checked);
                      kpiSnoozeTill
                        ? setValue(
                            'kpi_snooze_till',
                            dayjs(kpiSnoozeTill).toDate(),
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            }
                          )
                        : setValue(
                            'kpi_snooze_till',
                            dayjs().add(30, 'day').toDate(),
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            }
                          );
                    }}
                    disabled={statusFlag === true && insightFlag === true}
                    className="w-5 h-5 rounded-md border border-gray-300 text-white checked:bg-[#1A75FF] appearance-none"
                  />
                  <svg
                    width="10"
                    height="7"
                    viewBox="0 0 10 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute w-3.5 h-3.5 text-white pointer-events-none top-[3px] left-[3px] right-[3px] bottom-[3px] "
                  >
                    <path
                      d="M1.66797 3.66667L3.66797 5.66667L8.33464 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-gray-500 text-base leading-tight">
                    {checked && kpiSnoozeTillWatch
                      ? 'Restart tracking from:'
                      : 'Restart tracking'}
                  </span>
                </label>
                {checked && kpiSnoozeTillWatch && (
                  <Flatpickr
                    {...register('kpi_snooze_till')}
                    value={
                      dayjs(kpiSnoozeTillWatch).isValid()
                        ? new Date(kpiSnoozeTillWatch as Date)
                        : undefined
                    }
                    onChange={handleDateChange}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    disabled={statusFlag === true && insightFlag === true}
                    options={{
                      dateFormat: 'M d, Y',
                      disableMobile: true,
                      minDate: 'today',
                    }}
                    placeholder="MMM DD, YYYY"
                    className="text-sm text-[#3B82F6] border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:shadow-none p-0 m-0 w-[100px] leading-tight placeholder:text-sm items-center mt-[0.5px]"
                  />
                )}
              </div>
            )}
            <div className="flex gap-5 ">
              <button
                type="button"
                className="w-[116px] min-h-10 py-[10px] px-5 border-[1px] border-[#CED2DA] text-[14px] font-semibold leading-5 text-[#344051] rounded-lg"
                onClick={() => {
                  setOnExpandChartSetting('');
                  reset();
                }}
              >
                Cancel
              </button>
              <button
                className={`w-[116px] min-h-10 py-[10px] text-[#FFFFFF] px-5 text-[14px] font-semibold leading-5 rounded-lg ${
                  isDirty
                    ? 'bg-[#1A75FF] cursor-pointer'
                    : 'bg-[#CCE0FF] cursor-not-allowed'
                }`}
                type="submit"
                disabled={!isDirty || isSubmitting}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
