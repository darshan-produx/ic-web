import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Flatpickr from 'react-flatpickr';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllAttributeConfig,
  getAllAttributes,
} from '../../../api/customers/customers';
import { useUpdateCustomerAttributes } from '../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';

type AttributeConfigItem = {
  _id: string;
  name: string;
  type: string;
  data_type: string;
  list_options: string[];
  is_multi_select?: boolean; // <-- added
  aggregate?: string;
  key_for_aggregation?: string;
  org_id?: string;
};

type Attribute = {
  _id: string;
  customer_id: number;
  org_id: string;
  base_collection?: string;
  base_collection_id?: string;
  attribute_id: string;
  attribute_value: any;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
};

export default function CustomerAttributesPanel({
  onClose,
  customerAttributesModal,
  customerId,
  base_collection,
  base_collection_id,
  attribute_type,
}: {
  onClose: () => void;
  customerAttributesModal?: boolean;
  customerId: number;
  base_collection?: string;
  base_collection_id?: string;
  attribute_type?: string;
}) {
  const { data: attributeConfigResponse } = useQuery({
    queryKey: ['getAllAttributeConfig'],
    queryFn: () => getAllAttributeConfig(attribute_type),
    enabled: !!attribute_type,
    refetchOnWindowFocus: false,
  });

  const { data: attributesResponse } = useQuery({
    queryKey: ['getAllAttributes', customerId],
    queryFn: () =>
      getAllAttributes(customerId, base_collection_id, base_collection),
    enabled: !!customerId && !!attribute_type,
    refetchOnWindowFocus: false,
  });

  const attributesConfig: AttributeConfigItem[] =
    attributeConfigResponse?.data?.data ?? [];

  const attributes: Attribute[] = attributesResponse?.data?.data ?? [];

  const fields = useMemo(() => {
    return attributesConfig.map((attr) => {
      const fieldKey = attr._id;
      return {
        ...attr,
        fieldKey,
      };
    });
  }, [attributesConfig]);

  // Build dynamic yup schema with multi-select awareness
  const dynamicShape: Record<string, any> = {};
  fields.forEach((f) => {
    const dtype = (f.data_type || '').toLowerCase();
    switch (dtype) {
      case 'string':
        dynamicShape[f.fieldKey] = yup.string().nullable();
        break;
      case 'list':
        // if list is multi-select, validate as array of strings, else single string
        if (f.is_multi_select) {
          dynamicShape[f.fieldKey] = yup.array().of(yup.string()).nullable();
        } else {
          dynamicShape[f.fieldKey] = yup.string().nullable();
        }
        break;
      case 'boolean':
        dynamicShape[f.fieldKey] = yup.boolean().nullable();
        break;
      case 'float':
        dynamicShape[f.fieldKey] = yup.number().nullable();
        break;
      case 'number':
        dynamicShape[f.fieldKey] = yup.number().nullable();
        break;
      case 'integer':
        dynamicShape[f.fieldKey] = yup
          .number()
          .typeError('Must be a number')
          .nullable();
        break;
      case 'date':
        dynamicShape[f.fieldKey] = yup.date().nullable();
        break;
      default:
        dynamicShape[f.fieldKey] = yup.mixed().nullable();
        break;
    }
  });

  const schema = yup.object().shape(dynamicShape);

  // default values: respect multi-select as array
  const defaultValues: Record<string, any> = {};
  fields.forEach((f) => {
    const matchedAttr = attributes.find(
      (a) => a.attribute_id?.toString() === f._id.toString()
    );
    const provided = matchedAttr?.attribute_value ?? null;
    const dtype = (f.data_type || '').toLowerCase();

    switch (dtype) {
      case 'string':
        defaultValues[f.fieldKey] =
          typeof provided === 'string' ? provided : provided ?? '';
        break;
      case 'list':
        if (f.is_multi_select) {
          // Expecting stored value to be array (string[])
          defaultValues[f.fieldKey] = Array.isArray(provided)
            ? provided
            : provided
            ? // sometimes backend might give comma-separated string; try to normalize
              typeof provided === 'string'
              ? provided.split(',')
              : [provided]
            : [];
        } else {
          defaultValues[f.fieldKey] =
            typeof provided === 'string' ? provided : provided ?? '';
        }
        break;
      case 'boolean':
        defaultValues[f.fieldKey] =
          typeof provided === 'boolean' ? provided : !!provided;
        break;
      case 'float':
        defaultValues[f.fieldKey] =
          typeof provided === 'number' ? provided : provided ?? 0;
        break;
      case 'number':
        defaultValues[f.fieldKey] =
          typeof provided === 'number' ? provided : provided ?? 0;
        break;
      case 'integer':
        defaultValues[f.fieldKey] =
          typeof provided === 'number'
            ? provided
            : provided
            ? Number(provided)
            : null;
        break;
      case 'date':
        defaultValues[f.fieldKey] = provided ? dayjs(provided).toDate() : null;
        break;
      default:
        defaultValues[f.fieldKey] = provided ?? null;
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<Record<string, any>>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [attributesResponse?.data, attributeConfigResponse?.data]);

  const handleResetToDefault = () => reset(defaultValues);

  const valuesAreEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (a == null && b == null) return true;
    if (a instanceof Date && b instanceof Date)
      return a.getTime() === b.getTime();
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
      return false;
    }
  };

  const updateCustomerAttributes = useUpdateCustomerAttributes();
  const queryClient = useQueryClient();
  const onSubmit = async (data: Record<string, any>) => {
    try {
      const payload = Object.entries(data).reduce(
        (acc: any[], [fieldKey, value]) => {
          const fieldConfig = fields.find((f) => f.fieldKey === fieldKey);
          if (!fieldConfig) return acc;

          const defaultVal = defaultValues[fieldKey];

          if (!valuesAreEqual(value, defaultVal)) {
            acc.push({
              attribute_id: fieldConfig._id,
              attribute_value:
                value instanceof Date ? value.toISOString() : value,
              base_collection: base_collection ? base_collection : null,
              base_collection_id: base_collection_id
                ? base_collection_id
                : null,
            });
          }
          return acc;
        },
        [] as any[]
      );
      const result = await updateCustomerAttributes.mutateAsync({
        data: payload,
        id: customerId,
        base_collection: base_collection,
        base_collection_id: base_collection_id,
      });
      if (result?.status == 200 || result?.status == 201) {
        queryClient.invalidateQueries({
          queryKey: ['getAllAttributes', customerId],
        });

        toast.success('Attributes updated successfully');
      }

      handleResetToDefault();
      onClose();
    } catch (err: any) {
      console.error(err?.response?.data?.message);
      toast.error(err?.response?.data?.message);
    }
  };

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div
      className={`${
        customerAttributesModal
          ? 'fixed inset-0 bg-black bg-opacity-50 z-[999] flex'
          : 'hidden'
      }`}
      onClick={() => {
        handleResetToDefault();
        onClose();
      }}
    >
      <div
        className={`ml-auto w-[420px] h-screen bg-white z-[501] transform transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#CED2DA] bg-white">
            <h3 className="text-[16px] font-normal text-[#202B37] leading-6">
              Attributes
            </h3>
            <button
              type="button"
              onClick={() => {
                handleResetToDefault();
                onClose();
              }}
              className="text-[16px] text-[#637083] px-2 py-1"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-5 py-4 flex-1 overflow-auto min-h-0 scroll">
              {fields.length === 0 && (
                <div className="text-sm text-[#637083]">
                  No dynamic attributes available.
                </div>
              )}

              {fields.map((field) => {
                const key = field.fieldKey;
                const label = field.name;
                const dtype = (field.data_type || '').toLowerCase();
                return (
                  <div className="mb-4" key={field._id}>
                    <label className="text-[14px] font-medium text-[#344051] block mb-2">
                      {label}
                    </label>

                    {dtype === 'string' && (
                      <>
                        <input
                          id={`attr-${field._id}`}
                          {...register(key)}
                          className="w-full px-3 py-2 rounded-lg border border-[#CED2DA] text-[16px] text-[#141C24]"
                        />
                        {errors[key] && (
                          <p className="text-red-600 text-xs mt-1">
                            {(errors as any)[key]?.message}
                          </p>
                        )}
                      </>
                    )}

                    {dtype === 'list' && (
                      <Controller
                        name={key}
                        control={control}
                        render={({ field: ctlField }) => {
                          const options =
                            field.list_options?.map((o) => ({
                              value: o,
                              label: o,
                            })) ?? [];

                          if (field.is_multi_select) {
                            // multi-select value: array of option objects
                            const valueOptions = (
                              Array.isArray(ctlField.value)
                                ? ctlField.value
                                : []
                            )
                              .map((v: string) =>
                                options.find((o) => o.value === v)
                              )
                              .filter(Boolean) as {
                              value: string;
                              label: string;
                            }[];

                            return (
                              <Select
                                {...ctlField}
                                options={options}
                                value={valueOptions}
                                onChange={(selected) =>
                                  // selected is Option[] | null
                                  ctlField.onChange(
                                    Array.isArray(selected)
                                      ? (selected as any[]).map((s) => s.value)
                                      : []
                                  )
                                }
                                isMulti
                                closeMenuOnSelect={false}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                menuPortalTarget={portalTarget}
                                menuPlacement="auto"
                                menuPosition="fixed"
                                isClearable={false}
                              />
                            );
                          } else {
                            // single-select
                            const valueOption =
                              options.find((o) => o.value === ctlField.value) ??
                              null;
                            return (
                              <Select
                                {...ctlField}
                                options={options}
                                value={valueOption}
                                onChange={(selected) =>
                                  ctlField.onChange(
                                    (selected as any)?.value ?? ''
                                  )
                                }
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                menuPortalTarget={portalTarget}
                                menuPlacement="auto"
                                menuPosition="fixed"
                                isClearable={false}
                              />
                            );
                          }
                        }}
                      />
                    )}

                    {(dtype === 'float' ||
                      dtype === 'number' ||
                      dtype === 'integer') && (
                      <>
                        <input
                          id={`attr-${field._id}`}
                          {...register(key)}
                          type="number"
                          step={dtype === 'integer' ? '1' : 'any'}
                          className="w-full px-3 py-2 rounded-lg border border-[#CED2DA] text-[16px] text-[#141C24] no-spinner"
                        />
                        {errors[key] && (
                          <p className="text-red-600 text-xs mt-1">
                            {(errors as any)[key]?.message}
                          </p>
                        )}
                      </>
                    )}

                    {dtype === 'date' && (
                      <Controller
                        name={key}
                        control={control}
                        render={({ field: ctlField }) => (
                          <Flatpickr
                            value={ctlField.value ?? undefined}
                            onChange={(selected) =>
                              ctlField.onChange(selected[0] ?? null)
                            }
                            options={{
                              dateFormat: 'M d, Y',
                              disableMobile: true,

                            }}
                            className="w-full px-3 py-2 rounded-lg border border-[#CED2DA] text-[16px] text-[#141C24]"
                          />
                        )}
                      />
                    )}

                    {dtype === 'boolean' && (
                      <Controller
                        name={key}
                        control={control}
                        render={({ field: ctlField }) => (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-[#637083]">{`Enable ${label}`}</div>
                            <button
                              type="button"
                              onClick={() => ctlField.onChange(!ctlField.value)}
                              aria-pressed={ctlField.value}
                              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-150 ${
                                ctlField.value
                                  ? 'bg-[#1A75FF] justify-end'
                                  : 'bg-[#E6E9EE] justify-start'
                              } p-1`}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>
                        )}
                      />
                    )}

                    {/* fallback for unknown types */}
                    {![
                      'string',
                      'list',
                      'float',
                      'number',
                      'integer',
                      'date',
                      'boolean',
                    ].includes(dtype) && (
                      <input
                        id={`attr-${field._id}`}
                        {...register(key)}
                        className="w-full px-3 py-2 rounded-lg border border-[#CED2DA] text-[16px] text-[#141C24]"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex-shrink-0 bg-white border-t border-[#CED2DA] px-5 py-4">
              <div className="flex items-center gap-3 justify-end">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className={`px-3 py-2 rounded-lg border border-[#CED2DA] text-[14px] font-medium text-[#344051] leading-5 ${
                      isDirty ? '' : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!isDirty || isSubmitting}
                  >
                    Reset to default
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium text-[#FFFFFF] leading-5 ${
                    isDirty
                      ? 'bg-[#1A75FF] text-white'
                      : 'bg-[#CCE0FF] text-[#FFFFFF] cursor-not-allowed'
                  }`}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
