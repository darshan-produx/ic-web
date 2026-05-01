import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../common/components/Modal';
const isYamlFile = (value: any) => {
  if (!value || !value[0]) {
    return false;
  }
  const fileName = value[0].name;
  const yamlRegex = /\.(yml|yaml)$/i;
  return yamlRegex.test(fileName);
};

// Validation schema
const schema = yup.object().shape({
  file: yup
    .mixed()
    .required('File is required')
    .test('fileType', 'Only .yml or .yaml files are allowed', (value) =>
      isYamlFile(value)
    ),
});

const UploadFile = ({
  uploadModalOpen,
  setUploadModalOpen,
  onSubmitHandler,
}: any = {}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);
    onSubmitHandler(formData);
  };

  return (
    <Modal
      show={uploadModalOpen}
      onHide={() => setUploadModalOpen(false)}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        <Modal.Title className="text-16">Upload File</Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              type="file"
              {...register('file')}
              className="cursor-pointer form-file form-file-lg border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500"
            />
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
            )}
          </div>

          <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
            <div className="flex justify-end">
              <button
                type="button"
                className="mx-3 text-slate-500 btn bg-slate-200 border-slate-200 hover:text-slate-600 hover:bg-slate-300 hover:border-slate-300 focus:text-slate-600 focus:bg-slate-300 focus:border-slate-300 focus:ring focus:ring-slate-100 active:text-slate-600 active:bg-slate-300 active:border-slate-300 active:ring active:ring-slate-100 dark:bg-zink-600 dark:hover:bg-zink-500 dark:border-zink-600 dark:hover:border-zink-500 dark:text-zink-200 dark:ring-zink-400/50"
                onClick={() => setUploadModalOpen(false)}
              >
                No
              </button>
              <button
                type="submit"
                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
              >
                Yes
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default UploadFile;
