import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import Modal from '../../../../../common/components/Modal';
import { useQuery } from '@tanstack/react-query';
import { getCustomerSegments } from '../../../api/segments/segments';
import { getRecipeConfig } from '../../../api/config/recipe_config';
import { getInsightMasters } from '../../../api/config/insight';
import Select from 'react-select';

const schema = yup.object({
  recipe_id: yup.number().required('Recipe id is required'),
  insight_id: yup.number().required('Insight id is required'),
  customer_segment_id: yup.number().required('Customer segment id is required'),
});

interface IFormInputs {
  recipe_id: number;
  insight_id: number;
  customer_segment_id: number;
}

interface FormProps {
  editData?: IFormInputs;
  setAddModal?: (open: boolean) => void;
  setEditModal?: (open: boolean) => void;
  onSubmit: (data: IFormInputs) => Promise<any>;
}

export default function TargetThresholdForm({
  editData,
  setAddModal,
  setEditModal,
  onSubmit,
}: FormProps) {
  const { data: recipes } = useQuery({
    queryKey: ['recipe-configs'],
    queryFn: getRecipeConfig,
  });

  const { data: customerSegments } = useQuery({
    queryKey: ['allCustomerSegments'],
    queryFn: getCustomerSegments,
  });

  const { data: insights } = useQuery({
    queryKey: ['insight-masters'],
    queryFn: getInsightMasters,
  });

  const [recipeOption, setRecipeOption] = useState<
    | {
        label: string;
        value: number;
      }[]
    | undefined
  >();

  const [customerSegmentOption, setCustomerSegmentOption] = useState<
    | {
        label: string;
        value: number;
      }[]
    | undefined
  >();

  const [insightOption, setInsightOption] = useState<
    | {
        label: string;
        value: number;
      }[]
    | undefined
  >();
  useEffect(() => {
    setRecipeOption(
      recipes?.data?.data?.map((recipe: any) => ({
        label: recipe?.recipe_name,
        value: recipe?.id,
      }))
    );
    setInsightOption(
      insights?.data?.data?.map((insight: any) => ({
        label: insight?.insight_name,
        value: insight?.insight_id,
      }))
    );
    setCustomerSegmentOption(
      customerSegments?.data?.data?.map((segment: any) => ({
        label: segment?.segment_name,
        value: segment?.id,
      }))
    );
  }, [recipes, insights, customerSegments]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
    control,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: editData,
  });

  const onSubmitHandler = (data: IFormInputs) => {
    try {
      data = {
        ...data,
        recipe_id: data.recipe_id,
        insight_id: data.insight_id,
        customer_segment_id: data.customer_segment_id,
      };

      const response = onSubmit(data);

      response.then(({ data }) => {
        if (data?.status === 200) {
          toast.success(
            `${
              editData
                ? 'Recipe insight segment updated'
                : 'Recipe insight segment  added'
            } successfully`
          );
        } else if (data?.status === 400) {
          toast.error(data?.error);
        }
      });

      reset();
      if (setAddModal) setAddModal(false);
      if (setEditModal) setEditModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (editData) {
      clearErrors();
      setValue('recipe_id', editData.recipe_id);
      setValue('insight_id', editData.insight_id);
      setValue('customer_segment_id', editData.customer_segment_id);
    } else {
      reset();
    }
  }, [editData, reset, setValue, clearErrors]);

  const handleClose = () => {
    if (setAddModal) setAddModal(false);
    if (setEditModal) setEditModal(false);
  };
  return (
    <Modal
      show={true}
      onHide={handleClose}
      id="largeModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[40rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        <Modal.Title className="text-16">
          <div className="flex justify-between mx-4">
            <div className="block">
              <h6 className="font-semibold text-[24px] text-black">
                {editData
                  ? 'Edit recipe insight segment'
                  : 'Add recipe insight segment'}
              </h6>
              {!editData && (
                <p className="font-normal my-1 text-[16px] tracking-normal leading-5 text-[#cccccc]">
                  Enter the required information.
                </p>
              )}
            </div>
            <div className="mt-1 cursor-pointer" onClick={handleClose}></div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="rounded pt-3">
            <div className="flex flex-col justify-between gap-5">
              <div className="grid grid-cols-5 justify-between px-4">
                <label htmlFor="recipe_id" className="form-label col-span-1">
                  Recipe
                </label>
                <div className="w-2/3 col-span-4">
                  <select
                    {...register('recipe_id')}
                    className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    defaultValue="" // Set default value to an empty string
                  >
                    <option value="" disabled selected hidden>
                      Select a recipe
                    </option>
                    {recipes?.data?.data?.map((recipe: any) => (
                      <option key={recipe.recipe_id} value={recipe.recipe_id}>
                        {recipe.recipe_id + ' - ' + recipe.recipe_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-5 justify-between px-4">
                <label htmlFor="recipe_id" className="form-label col-span-1">
                  Insight
                </label>
                <div className="w-2/3 col-span-4">
                  <select
                    {...register('insight_id')}
                    className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    defaultValue="" // Set default value to an empty string
                  >
                    <option value="" disabled selected hidden>
                      Select an insight
                    </option>
                    {insights?.data?.data?.map((insight: any) => (
                      <option
                        key={insight.insight_id}
                        value={insight.insight_id}
                      >
                        {insight.insight_id + ' - ' + insight.insight_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-5 justify-between px-4">
                <label htmlFor="recipe_id" className="form-label col-span-1">
                  Customer segment
                </label>
                <div className="w-2/3 col-span-4">
                  <select
                    {...register('customer_segment_id')}
                    className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    defaultValue="" // Set default value to an empty string
                  >
                    <option value="" disabled selected hidden>
                      Select a customer segment
                    </option>
                    {customerSegments?.data?.data?.map((segment: any) => (
                      <option
                        key={segment.customer_segment_id}
                        value={segment.customer_segment_id}
                      >
                        {segment.customer_segment_id +
                          ' - ' +
                          segment.segment_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              id="cancel_button"
              title="Click to cancel"
              onClick={handleClose}
              type="button"
              className="text-gray-500 bg-white border border-gray-500 btn hover:text-gray-500 hover:bg-gray-100 focus:text-gray-500 focus:bg-gray-100 active:text-gray-500 active:bg-gray-100 dark:bg-zinc-700 dark:hover:bg-gray-500/10 dark:focus:bg-gray-500/10 dark:active:bg-gray-500/10"
            >
              Cancel
            </button>
            <button
              id="submit_button"
              title={`Click to ${editData ? 'update' : 'add'} information`}
              type="submit"
              className="mx-2 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
            >
              {editData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
