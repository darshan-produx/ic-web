'use client';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DownloadIcon,
  MoreHorizontal,
  Search,
  Trash2,
  UploadIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useDeleteCustomerProjectConfig,
  useUploadCustomerProjectConfig,
} from '../../../services/mutations/configMutations';
import * as yaml from 'js-yaml';
import { saveAs } from 'file-saver';
import DownloadModal from '../../../../common/components/DownloadModal';
import ErrorTable from '../../../../common/components/ErrorTable';
import TableContainer from '../../../../common/components/TableContainer';
import DeleteModal from '../../../../common/components/DeleteModal';
import { Dropdown } from '../../../../common/Dropdown';
import UploadFile from '../../../../common/components/uploadYAMLfile';
import {
  // downloadTemplateCustomerProjectConfig,
  getCustomerProjectConfig,
  // templateCustomerProjectConfig,
} from '../../../api/config/customer_project_config';
import { AxiosError } from 'axios';
const yamlContent = `
name: onboarding   # Plan Type - onboarding, retention, reactivation, adoption driving, etc.
description: description of the project
plan_tasks:
  - s_no: 1
    type: "task"  # task type - task, milestone
    title: "Introduction"  # task title
    notes: "some notes"  # task description
    start_date: 0  # start date of the task in days from the start date of the plan.
    duration_days: 3  # task duration in days
    is_critical: true  # whether the task is critical or not - true or false

  - s_no: 2
    type: "task"
    title: "Setup profile"  # task title
    notes: "some notes"  # task description
    depends_on: 
      - s_no: 1 # Reference to the previous task number. E.g. if we want task 2 and 3 both to begin after task 1, then both 2 & 3 will have depends_on s_no 1. Also if no depends_on exists, the task begins on a start date of the plan
        offset: 1   #  Gap/Overlap with previous task’s end date.optional field, default value is 1. offset indicates if we want to have a gap or overlap with previous task’s end; 1 means start this task immediate next day after the previous task’s end date, -1 means start this task 1 day before the previous task’s end date,0 means start this task on same day as previous task’s end date etc.
    duration_days: 4
    is_critical: false

  - s_no: 3
    type: "milestone"
    title: "Finalize Milestone"  # milestone title
    depends_on: 
      - s_no: 1
        offset: -1  # This means that this milestone will be set on the day before the end of task 1.
      - s_no: 2  # Reference to the previous task number. E.g. if we want task 3 to begin after task 1 and 2, then task 3 will have depends_on s_no 1 and s_no 2. Also if no depends_on exists, the task begins on a start date of the plan
        offset: 0   # This means that this milestone will be set on the same day as the end of task 2.
    duration_days: 1
    is_critical: false
`;

const CustomerProjectConfig = () => {
  const [open, setOpen] = useState(false);
  const [customerProjectConfigData, setCustomerProjectConfigData] =
    useState<any>();
  const [searchPh, setSearchPh] = useState('');
  const [downloadModalOpen, setdownloadModalOpen] = useState(false);
  const [downloadAllModalOpen, setdownloadAllModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorResponseData, setErrorResponseData] = useState();

  const { data: existingCustomerProjectConfigs, isLoading } = useQuery({
    queryKey: ['customer-project-config'],
    queryFn: getCustomerProjectConfig,
    refetchOnWindowFocus: false,
  });
  const columns = useMemo(
    () => [
      {
        header: 'Project name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.name}>
            <div className="truncate">{cell?.row?.original?.name ?? '-'}</div>
          </div>
        ),
      },
      {
        header: 'Description',
        enableColumnFilter: false,
        cell: (cell: any) => {
          const plan_tasks = cell?.row?.original?.description;
          return (
            <div className="max-w-64" title={cell?.row?.original?.description}>
              <div className="truncate">
                {cell?.row?.original?.description ?? '-'}
              </div>
            </div>
          );
        },
      },
      {
        header: 'Action',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell: any) => (
          <Dropdown className="relative">
            <Dropdown.Trigger
              className="flex items-center justify-center size-[30px] p-0 text-slate-500 btn bg-slate-100 hover:text-white hover:bg-slate-600 focus:text-white focus:bg-slate-600 focus:ring focus:ring-slate-100 active:text-white active:bg-slate-600 active:ring active:ring-slate-100 dark:bg-slate-500/20 dark:text-slate-400 dark:hover:bg-slate-500 dark:hover:text-white dark:focus:bg-slate-500 dark:focus:text-white dark:active:bg-slate-500 dark:active:text-white dark:ring-slate-400/20"
              id="usersAction1"
            >
              <MoreHorizontal className="size-3" />
            </Dropdown.Trigger>
            <Dropdown.Content
              placement={'bottom'}
              className="absolute z-50 py-2 mt-1 ltr:text-left rtl:text-right list-none bg-white rounded-md shadow-md min-w-[10rem] dark:bg-zink-600"
              aria-labelledby="usersAction1"
            >
              <li
                className={`cursor-pointer block px-3 py-1 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setdownloadModalOpen(true);
                  setCustomerProjectConfigData(cell?.row?.original);
                }}
              >
                <DownloadIcon className="inline-block size-3 ltr:mr-1 rtl:ml-1" />
                <span className="pl-1 align-middle">Download</span>
              </li>
              <li
                className={`cursor-pointer block px-3 py-1 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setDeleteModalOpen(true);
                  setCustomerProjectConfigData(cell?.row?.original);
                }}
              >
                <Trash2 className="inline-block size-3 ltr:mr-1 rtl:ml-1" />
                <span className="pl-1 align-middle">Delete</span>
              </li>
            </Dropdown.Content>
          </Dropdown>
        ),
      },
    ],
    []
  );

  const { mutateAsync } = useUploadCustomerProjectConfig();
  const handleOnsubmit = async (formData: any) => {
    try {
      const res = await mutateAsync(formData);
      if (res?.data?.status === 200) {
        setUploadModalOpen(false);
        toast.success(
          `Success! Created: ${res?.data?.createdCount}, Updated: ${res?.data?.updatedCount}`
        );
      } else if (res?.data?.status === 400) {
        if (res?.data?.errors) {
          setUploadModalOpen(false);
          setErrorResponseData(res?.data);
          setErrorModalOpen(true);
        }
      }
    } catch (error: AxiosError | any) {
      toast.error(error?.response?.data?.message);
    }
  };

  // const { data: allTemplateData } = useQuery({
  //   queryKey: ['template-customer-project-configs'],
  //   queryFn: downloadTemplateCustomerProjectConfig,
  // });
  // const { data: templateData } = useQuery({
  //   queryKey: ['template-customer-project-config'],
  //   queryFn: templateCustomerProjectConfig,
  // });

  const handleDownload = async () => {
    if (downloadModalOpen) {
      const customerProjectConfigDataModified = customerProjectConfigData;
      delete customerProjectConfigDataModified?._id;
      const yamlData = yaml.dump(customerProjectConfigDataModified);
      const blob = new Blob([yamlData], { type: 'application/x-yaml' });
      saveAs(blob, 'project_config.yaml');
      setdownloadModalOpen(false);
    }

    if (downloadAllModalOpen) {
      // const yamlData = yaml.dump(templateData?.data);
      const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
      saveAs(blob, 'project_config.yaml');
      setdownloadAllModalOpen(false);
    }
  };
  const handleCancel = () => {
    setdownloadModalOpen(false);
    setdownloadAllModalOpen(false);
  };

  const deleteCustomerProjectConfig = useDeleteCustomerProjectConfig();
  const handleDelete = async () => {
    try {
      const res = await deleteCustomerProjectConfig.mutateAsync(
        customerProjectConfigData?._id
      );
      if (res?.data?.status === 200) {
        setUploadModalOpen(false);
        toast.success(res?.data?.message);
      }
    } catch (error: AxiosError | any) {
      toast.error(error?.response?.data?.message);
    }
    handleCloseModal();
  };
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="w-full top-0 z-30  box  bg-top px-4">
        <div className="grid grid-cols-1 border-b-[1px] border-[#80c2fe]   pt-4   ">
          <div className="">
            <h6 className="p-2 font-semi-bold text-black text-[32px] text-left">
              Configure projects
            </h6>
          </div>
          <div className=""></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-12 mx-4">
        <div className="xl:col-span-12">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <h6 className="text-15 grow">
                  <div className="block">
                    <h6 className="font-semibold text-[20px] text-black">
                      {`Projects  (${
                        existingCustomerProjectConfigs?.data?.data?.length ?? 0
                      })`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-[#cccccc] ">
                      Manage existing project configurations
                    </p>
                  </div>
                </h6>
                <div className="shrink-0">
                  <div>
                    <button
                      title="Click to download template"
                      type="button"
                      className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                      onClick={() => {
                        setdownloadAllModalOpen(true);
                      }}
                    >
                      <div className="flex items-center">
                        <DownloadIcon
                          className={`h-6 w-4 ${open ? '' : 'm-auto'}`}
                        />
                        <p className="ml-2">Download template</p>
                      </div>
                    </button>
                    {/* <button
                      title="Click to download table"
                      type="button"
                      className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                      onClick={() => {
                        setdownloadModalOpen(true);
                      }}
                    >
                      <div className="flex items-center">
                        <DownloadIcon
                          className={`h-6 w-4 ${open ? '' : 'm-auto'}`}
                        />
                        <p className="pl-2">Download table</p>
                      </div>
                    </button> */}
                    <button
                      title="Click to upload template"
                      type="button"
                      className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                      onClick={() => {
                        setUploadModalOpen(true);
                      }}
                    >
                      <div className="flex items-center">
                        <UploadIcon
                          className={`h-6 w-4 ${open ? '' : 'm-auto'}`}
                        />
                        <p className="pl-2">Upload</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="!py-3.5 card-body border-y border-dashed border-slate-200 dark:border-zink-500">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="relative xl:col-span-2">
                  <input
                    type="text"
                    className="px-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    placeholder="Search "
                    autoComplete="off"
                    autoFocus
                    value={searchPh}
                    onChange={(e: any) => setSearchPh(e?.target?.value)}
                  />
                  <Search className="mx-2 inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600" />
                </div>
              </div>
            </div>
            <div className="card-body">
              {existingCustomerProjectConfigs?.data?.data &&
              existingCustomerProjectConfigs?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columns || []}
                  data={existingCustomerProjectConfigs?.data?.data ?? []}
                  customPageSize={5}
                  // isGlobalFilter={true}
                  searchTerm={searchPh}
                  divclassName="-mx-5 -mb-5 overflow-x-auto"
                  tableclassName="w-full border-separate table-custom border-spacing-y-1 whitespace-nowrap"
                  theadclassName="text-left relative rounded-md bg-slate-100 dark:bg-zink-600 after:absolute ltr:after:border-l-2 rtl:after:border-r-2 ltr:after:left-0 rtl:after:right-0 after:top-0 after:bottom-0 after:border-transparent [&.active]:after:border-custom-500 [&.active]:bg-slate-100 dark:[&.active]:bg-zink-600"
                  thclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 font-semibold"
                  tdclassName="px-3.5 py-2.5 first:pl-5 last:pr-5"
                  PaginationClassName="flex flex-col items-center mt-8 md:flex-row"
                />
              ) : (
                <div className="noresult">
                  <div className="py-6 text-center">
                    <h5 className="mt-2 mb-1">Sorry! No Result Found</h5>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {deleteModalOpen && (
        <DeleteModal
          show={deleteModalOpen}
          onHide={handleCloseModal}
          onDelete={handleDelete}
          title="Project config"
        />
      )}
      {errorModalOpen && (
        <ErrorTable
          setErrorModalOpen={setErrorModalOpen}
          errorResponseData={errorResponseData}
        />
      )}
      {uploadModalOpen && (
        <UploadFile
          uploadModalOpen={uploadModalOpen}
          setUploadModalOpen={setUploadModalOpen}
          setErrorModalOpen={setErrorModalOpen}
          setErrorResponseData={setErrorResponseData}
          onSubmitHandler={handleOnsubmit}
        />
      )}
      {downloadModalOpen && (
        <DownloadModal
          downloadModalOpen={downloadModalOpen}
          handleCancel={handleCancel}
          handleDownload={handleDownload}
          title="Are you sure you want to download table data"
        />
      )}
      {downloadAllModalOpen && (
        <DownloadModal
          downloadModalOpen={downloadAllModalOpen}
          handleCancel={handleCancel}
          handleDownload={handleDownload}
          title="Are you sure you want to download template"
        />
      )}
    </div>
  );
};

export default CustomerProjectConfig;
