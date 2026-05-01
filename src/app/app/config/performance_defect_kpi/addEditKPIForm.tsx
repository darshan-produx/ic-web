import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import Select from 'react-select';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { X as CloseIcon } from 'lucide-react';
import { getCustomers } from '../../../api/customers/customers';
import { getUniquePerformanceDefectsKpiMetrics } from '../../../api/config/performance_defect_kpi';
import {
  useAddPerformanceDefectsKPI,
  useEditPerformanceDefectsKPI,
} from '../../../services/mutations/configMutations';

export default function AddEditKPIForm({
  editData,
  setCreateUpdateModalOpen,
}: {
  editData?: any;
  setCreateUpdateModalOpen: (open: boolean) => void;
}) {
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
    refetchOnWindowFocus: false,
  });

  const { data: uniqueMetrics } = useQuery({
    queryKey: ['uniqueMetrics'],
    queryFn: getUniquePerformanceDefectsKpiMetrics,
    refetchOnWindowFocus: false,
  });

  // raw arrays
  const metricOptionsRaw: any[] = uniqueMetrics?.data ?? [];
  const customerOptionsRaw: any[] = allCustomers?.data?.data ?? [];

  // --- SELECT STYLE: make react-select borders look like form-input ---
  // Tailwind's form-input default border is usually tailwind's gray-300 (#D1D5DB).
  // We'll match that and provide a focused box-shadow similar to native focus.
  const selectStyles = useMemo(
    () => ({
      control: (base: any, state: any) => ({
        ...base,
        borderColor: state.isFocused ? '#93C5FD' : '#D1D5DB', // focused tint and default
        // boxShadow: state.isFocused
        //   ? '0 0 0 3px rgba(59,130,246,0.08)'
        //   : undefined,
        '&:hover': { borderColor: '#D1D5DB' },
        minHeight: '38px',
        borderRadius: 6,
      }),
      // keep menuPortal high z-index as before
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      // small adjustments for value container / placeholder to vertically center
      valueContainer: (base: any) => ({ ...base, padding: '6px 10px' }),
      indicatorsContainer: (base: any) => ({ ...base, padding: '0 6px' }),
    }),
    []
  );

  // --- SORT + MAP metric options by numeric ID ascending ---
  const metricOptions = useMemo(
    () =>
      metricOptionsRaw
        .slice()
        .sort((a, b) => {
          const ai =
            a?.ID !== undefined && a?.ID !== null
              ? Number(a.ID)
              : Number.MAX_SAFE_INTEGER;
          const bi =
            b?.ID !== undefined && b?.ID !== null
              ? Number(b.ID)
              : Number.MAX_SAFE_INTEGER;
          return ai - bi;
        })
        .map((m) => ({
          value: m.ID !== undefined ? Number(m.ID) : null,
          label: `${m.ID ?? ''} - ${m.metric_name ?? ''}`,
          raw: m,
        })),
    [metricOptionsRaw]
  );

  // --- SORT + MAP customer options by numeric customer_id ascending ---
  const customerOptions = useMemo(
    () =>
      customerOptionsRaw
        .slice()
        .sort((a, b) => {
          const ai =
            a?.customer_id !== undefined && a?.customer_id !== null
              ? Number(a.customer_id)
              : a?._id
              ? Number(a._id)
              : Number.MAX_SAFE_INTEGER;
          const bi =
            b?.customer_id !== undefined && b?.customer_id !== null
              ? Number(b.customer_id)
              : b?._id
              ? Number(b._id)
              : Number.MAX_SAFE_INTEGER;
          return ai - bi;
        })
        .map((c) => ({
          value: c.customer_id !== undefined ? Number(c.customer_id) : null,
          label: `${c.customer_id ?? c._id} - ${
            c.customer_name ?? c.name ?? ''
          }`,
          raw: c,
        })),
    [customerOptionsRaw]
  );

  const metricTypeOptions = useMemo(
    () => [
      { value: 'performance', label: 'performance' },
      { value: 'defects', label: 'defects' },
    ],
    []
  );

  const aggregationMethodOptions = useMemo(
    () => [
      { value: 'sum', label: 'sum' },
      { value: 'mean', label: 'mean' },
      { value: 'median', label: 'median' },
      { value: 'mode', label: 'mode' },
      { value: 'count', label: 'count' },
      { value: 'min', label: 'min' },
      { value: 'max', label: 'max' },
      { value: 'std', label: 'std' },
      { value: 'var', label: 'var' },
      { value: 'ratio', label: 'ratio' },
      { value: 'nunique', label: 'nunique' },
    ],
    []
  );

  const statusAggregationOptions = useMemo(
    () => [
      { value: 'daily', label: 'daily' },
      { value: 'weekly', label: 'weekly' },
      { value: 'monthly', label: 'monthly' },
    ],
    []
  );

  const schema = yup
    .object({
      ID: yup.number().typeError('Please select a metric'),

      customer_id: yup
        .number()
        .typeError('Please select a customer')
        .required('Please select a customer'),

      metric_name: yup.string().max(50).required('Metric name is required'),

      metric_display_str: yup.string().max(200).nullable(),

      metric_type: yup
        .string()
        .oneOf(['performance', 'defects', 'Performance', 'Defects'])
        .required('Metric type is required'),

      aggregation_method: yup
        .string()
        .oneOf([
          'mean',
          'median',
          'mode',
          'sum',
          'count',
          'max',
          'min',
          'std',
          'var',
          'ratio',
          'nunique',
        ])
        .required('Aggregation method is required'),

      status_aggregation_level: yup
        .string()
        .oneOf(['daily', 'weekly', 'monthly'])
        .required('Status aggregation level is required'),

      // history_to_consider_for_trend: yup
      //   .number()
      //   .nullable()
      //   .min(0, 'Must be >= 0'),

      threshold: yup
        .number()
        .required('Threshold is required')
        .typeError('Must be a number'),
      target: yup
        .number()
        .required('Target is required')
        .typeError('Must be a number'),

      unit: yup.string().max(20).nullable().typeError('Must be a string'),

      // momentum_threshold: yup.number().nullable().typeError('Must be a number'),

      status_flag: yup.boolean().nullable(),
      insight_flag: yup.boolean().nullable(),
    })
    .required();

  type FormValues = yup.InferType<typeof schema>;
  const resolver = yupResolver(schema) as Resolver<FormValues>;

  const defaultValues: Partial<FormValues> = {
    ID: undefined,
    customer_id: undefined,
    metric_name: '',
    metric_display_str: '',
    metric_type: 'performance',
    aggregation_method: 'sum',
    status_aggregation_level: 'monthly',
    // history_to_consider_for_trend: 0,
    threshold: 0,
    target: 0,
    unit: '',
    // momentum_threshold: undefined,
    status_flag: true,
    insight_flag: true,
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: defaultValues as FormValues,
    mode: 'onBlur',
  });

  // const useDateRange = Boolean(watch('use_date_range'));
  const portalTarget =
    typeof document !== 'undefined' ? document.body : undefined;

  // ---------- map editData -> form (use ID) ----------
  useEffect(() => {
    if (editData) {
      const d = editData;
      let idVal: number | null = null;
      if (d.ID !== undefined && d.ID !== null) {
        idVal = Number(d.ID);
      } else if (d.metric_name) {
        const found = metricOptions.find(
          (m) =>
            m.label === d.metric_name ||
            (m.raw &&
              (m.raw.metric_name === d.metric_name ||
                m.raw.metric_display_str === d.metric_name))
        );
        if (found) idVal = found.value as number;
      }

      const mapped: Partial<FormValues> = {
        ...defaultValues,
        ID: idVal ?? (defaultValues.ID as any),
        customer_id:
          d.customer_id !== undefined
            ? Number(d.customer_id)
            : (defaultValues.customer_id as any),
        metric_name: d.metric_name ?? '',
        metric_display_str: d.metric_display_str ?? d.metric_name ?? '',
        metric_type: d.metric_type ?? (defaultValues.metric_type as any),
        aggregation_method:
          d.aggregation_method ?? (defaultValues.aggregation_method as any),
        status_aggregation_level:
          d.status_aggregation_level ??
          (defaultValues.status_aggregation_level as any),
        // history_to_consider_for_trend:
        //   d.history_to_consider_for_trend !== undefined
        //     ? Number(d.history_to_consider_for_trend)
        //     : (defaultValues.history_to_consider_for_trend as any),
        threshold:
          d.threshold !== undefined
            ? Number(d.threshold)
            : defaultValues.threshold,
        target:
          d.target !== undefined ? Number(d.target) : defaultValues.target,
        unit: d.unit ?? defaultValues.unit,
        // momentum_threshold:
        //   d.momentum_threshold !== undefined
        //     ? Number(d.momentum_threshold)
        //     : defaultValues.momentum_threshold,
        status_flag:
          typeof d.status_flag === 'boolean'
            ? d.status_flag
            : defaultValues.status_flag,
        insight_flag:
          typeof d.insight_flag === 'boolean'
            ? d.insight_flag
            : defaultValues.insight_flag,
      };

      reset(mapped as FormValues);
    } else {
      reset(defaultValues as FormValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, metricOptionsRaw, customerOptionsRaw]);

  // ---------- mutations & submit ----------
  const addMutation = useAddPerformanceDefectsKPI();
  const editMutation = useEditPerformanceDefectsKPI();
  const queryClient = useQueryClient();

  const onSubmit = async (formData: FormValues) => {
    try {
      const payload: any = formFormToPayload(formData);

      if (editData) {
        await editMutation.mutateAsync({ id: editData._id, body: payload });
        toast.success('KPI updated successfully');
        queryClient.invalidateQueries({ queryKey: ['performance-defect-kpis'] });
      } else {
        await addMutation.mutateAsync(payload);
        toast.success('KPI created successfully');
        queryClient.invalidateQueries({ queryKey: ['performance-defect-kpis'] });
      }

      setCreateUpdateModalOpen(false);
      reset(defaultValues as FormValues);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    }
  };

  function formFormToPayload(formData: FormValues) {
    const payload: any = {
      ...formData,
      ID:
        formData.ID !== null && formData.ID !== undefined
          ? Number(formData.ID)
          : null,
      metric_name:
        formData.metric_name !== null && formData.metric_name !== undefined
          ? String(formData.metric_name)
          : null,
      metric_display_str:
        formData.metric_display_str !== null &&
        formData.metric_display_str !== undefined
          ? String(formData.metric_display_str)
          : null,
      customer_id:
        formData.customer_id !== null && formData.customer_id !== undefined
          ? Number(formData.customer_id)
          : null,
      // history_to_consider_for_trend:
      //   formData.history_to_consider_for_trend !== undefined &&
      //   formData.history_to_consider_for_trend !== null
      //     ? Number(formData.history_to_consider_for_trend)
      //     : undefined,
      threshold:
        formData.threshold !== undefined && formData.threshold !== null
          ? Number(formData.threshold)
          : undefined,
      target:
        formData.target !== undefined && formData.target !== null
          ? Number(formData.target)
          : undefined,
      // momentum_threshold:
      //   formData.momentum_threshold !== undefined &&
      //   formData.momentum_threshold !== null
      //     ? Number(formData.momentum_threshold)
      //     : undefined,
      unit: formData.unit ? String(formData.unit) : '',
      start_date: editData
        ? editData.start_date
        : dayjs().add(-1, 'year').toDate(),
      end_date: editData ? editData.end_date : dayjs().add(40, 'year').toDate(),
      status_flag: Boolean(formData.status_flag),
      insight_flag: Boolean(formData.insight_flag),
      file_name: editData ? editData.file_name : '',
      org_id: editData ? editData.org_id : localStorage.getItem('org_id'),
    };

    return payload;
  }

  const isEditMode = Boolean(editData);

  return (
    <div className="p-4 scroll">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-semibold">
            {editData ? 'Edit KPI' : 'Add new KPI'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {editData
              ? 'Update KPI details'
              : 'Enter required information to create KPI'}
          </p>
        </div>
        <button
          onClick={() => setCreateUpdateModalOpen(false)}
          className="text-slate-600"
        >
          <CloseIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Metric (Controller + react-select) */}
          <div>
            <label className="block mb-1 font-medium">
              Metric <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="ID"
              render={({ field }) => {
                const selected =
                  metricOptions.find((o) => o.value === field.value) ?? null;
                return (
                  <Select
                    value={selected}
                    onChange={(opt: any) => {
                      if (opt) {
                        field.onChange(opt.value); // set ID
                        setValue('metric_name', opt.raw.metric_name ?? '', {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue(
                          'metric_display_str',
                          opt.raw.metric_display_str ??
                            opt.raw.metric_name ??
                            '',
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        );
                        setValue('metric_type', opt.raw.metric_type, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue(
                          'aggregation_method',
                          opt.raw.aggregation_method,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        );
                        setValue(
                          'status_aggregation_level',
                          opt.raw.status_aggregation_level,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        );
                        // setValue(
                        //   'momentum_threshold',
                        //   Number(opt.raw.momentum_threshold),
                        //   {
                        //     shouldValidate: true,
                        //     shouldDirty: true,
                        //   }
                        // );
                        // setValue(
                        //   'history_to_consider_for_trend',
                        //   Number(opt.raw.history_to_consider_for_trend),
                        //   {
                        //     shouldValidate: true,
                        //     shouldDirty: true,
                        //   }
                        // );
                        setValue('threshold', Number(opt.raw.threshold), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue('target', Number(opt.raw.target), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue('unit', String(opt.raw.unit), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      } else {
                        field.onChange(null);
                        setValue('metric_name', '');
                        setValue('metric_display_str', '');
                        // setValue('momentum_threshold', 0);
                        // setValue('history_to_consider_for_trend', 0);
                        setValue('threshold', 0);
                        setValue('target', 0);
                        setValue('unit', '');
                      }
                    }}
                    options={metricOptions}
                    placeholder="Select metric"
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                    menuPlacement="auto"
                    styles={{
                      ...selectStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                    isDisabled={isEditMode}
                  />
                );
              }}
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).ID?.message}
            </p>
          </div>

          {/* Customer (Controller + react-select) */}
          <div>
            <label className="block mb-1 font-medium">
              Customer <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="customer_id"
              render={({ field }) => {
                const selected =
                  customerOptions.find((o) => o.value === field.value) ?? null;
                return (
                  <Select
                    value={selected}
                    onChange={(opt: any) =>
                      field.onChange(opt ? opt.value : null)
                    }
                    options={customerOptions}
                    placeholder="Select customer"
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                    menuPlacement="auto"
                    styles={{
                      ...selectStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                    isDisabled={isEditMode}
                  />
                );
              }}
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).customer_id?.message}
            </p>
          </div>

          {/* Metric display string */}
          <div>
            <label className="block mb-1 font-medium">
              Metric display string
            </label>
            <input
              {...register('metric_display_str')}
              className="form-input w-full border-gray-300 h-[46px] focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
              placeholder="Optional display string"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).metric_display_str?.message}
            </p>
          </div>

          {/* Metric type */}
          <div>
            <label className="block mb-1 font-medium">Metric type</label>
            <Controller
              control={control}
              name="metric_type"
              render={({ field }) => {
                const selected =
                  metricTypeOptions.find((o) => o.value === field.value) ??
                  null;
                return (
                  <Select
                    value={selected}
                    onChange={(opt: any) =>
                      field.onChange(opt ? opt.value : null)
                    }
                    options={metricTypeOptions}
                    placeholder="Select metric type"
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                    menuPlacement="auto"
                    styles={{
                      ...selectStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                    isDisabled={isEditMode}
                  />
                );
              }}
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).metric_type?.message}
            </p>
          </div>

          {/* ... rest unchanged ... */}

          {/* Aggregation method */}
          <div>
            <label className="block mb-1 font-medium">Aggregation method</label>
            <Controller
              control={control}
              name="aggregation_method"
              render={({ field }) => {
                const selected =
                  aggregationMethodOptions.find(
                    (o) => o.value === field.value
                  ) ?? null;
                return (
                  <Select
                    value={selected}
                    onChange={(opt: any) =>
                      field.onChange(opt ? opt.value : null)
                    }
                    options={aggregationMethodOptions}
                    placeholder="Select aggregation method"
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                    menuPlacement="auto"
                    styles={{
                      ...selectStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                );
              }}
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).aggregation_method?.message}
            </p>
          </div>

          {/* Status aggregation level */}
          <div>
            <label className="block mb-1 font-medium">
              Status aggregation level
            </label>
            <Controller
              control={control}
              name="status_aggregation_level"
              render={({ field }) => {
                const selected =
                  statusAggregationOptions.find(
                    (o) => o.value === field.value
                  ) ?? null;
                return (
                  <Select
                    value={selected}
                    onChange={(opt: any) =>
                      field.onChange(opt ? opt.value : null)
                    }
                    options={statusAggregationOptions}
                    placeholder="Select status aggregation"
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                    menuPlacement="auto"
                    styles={{
                      ...selectStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                );
              }}
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).status_aggregation_level?.message}
            </p>
          </div>

          {/* Numeric fields */}

          <div>
            <label className="block mb-1 font-medium">Target</label>
            <input
              type="number"
              {...register('target')}
              step={1}
              className="form-input w-full appearance-none border-gray-300 h-[46px]  focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).target?.message}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">Threshold</label>
            <input
              type="number"
              {...register('threshold')}
              step={1}
              className="form-input w-full appearance-none border-gray-300 h-[46px] focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).threshold?.message}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">Unit</label>
            <input
              {...register('unit')}
              className="form-input w-full border-gray-300 h-[46px] focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).unit?.message}
            </p>
          </div>

          {/* <div>
            <label className="block mb-1 font-medium">
              History to consider for trend
            </label>
            <input
              type="number"
              {...register('history_to_consider_for_trend')}
              className="form-input w-full border-gray-300 h-[46px] focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).history_to_consider_for_trend?.message}
            </p>
          </div> */}

          {/* <div>
            <label className="block mb-1 font-medium">Momentum threshold</label>
            <input
              type="number"
              {...register('momentum_threshold')}
              className="form-input w-full border-gray-300 h-[46px] focus:outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD] transition-colors duration-150 border"
            />
            <p className="text-xs text-red-600 mt-1">
              {(errors as any).momentum_threshold?.message}
            </p>
          </div> */}

          {/* Flags */}
          <div className="flex gap-6 items-center mt-3">
            <Controller
              control={control}
              name="status_flag"
              render={({ field }) => (
                <label className="flex items-center gap-3">
                  <div className="text-sm font-medium">Status flag</div>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors duration-150 ${
                      field.value
                        ? 'bg-[#1A75FF] justify-end'
                        : 'bg-[#E6E9EE] justify-start'
                    } p-1`}
                    aria-pressed={Boolean(field.value)}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </label>
              )}
            />

            <Controller
              control={control}
              name="insight_flag"
              render={({ field }) => (
                <label className="flex items-center gap-3">
                  <div className="text-sm font-medium">Insight flag</div>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors duration-150 ${
                      field.value
                        ? 'bg-[#1A75FF] justify-end'
                        : 'bg-[#E6E9EE] justify-start'
                    } p-1`}
                    aria-pressed={Boolean(field.value)}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </label>
              )}
            />
          </div>
        </div>

        {/* Actions (Cancel + Add/Save) - CSS and behaviour as requested */}
        <div className="flex gap-4 justify-end mt-6">
          <div className="mx-3">
            <button
              id="cancel_button"
              title="Click to cancel"
              onClick={() => {
                setCreateUpdateModalOpen(false);
              }}
              className={`text-black bg-transparent border-[#4AA8FE] border-[1px] hover:border-[#4AA8FE]/75 font-medium rounded-lg text-sm px-10 py-2 text-center h-9 w-full items-center  me-2 mb-2 ${
                editData ? 'px-6' : 'px-4'
              }`}
            >
              {'Cancel'}
            </button>
          </div>
          <div className="mx-3">
            <button
              id="create_user"
              title={
                !editData
                  ? 'Click to add new KPI information'
                  : 'Click to save KPI information'
              }
              type="submit"
              disabled={isSubmitting}
              className={`text-white bg-[#4AA8FE]  hover:bg-[#4AA8FE]/75 font-medium rounded-lg text-sm px-8 py-2 text-center h-9 w-full items-center  me-2 mb-2 ${
                editData ? 'px-6' : 'px-4'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {editData ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
