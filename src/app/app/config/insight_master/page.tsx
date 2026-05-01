'use client';
import { useMemo, useState } from 'react';
import {
  downloadTemplateInsightMaster,
  getInsightMaster,
  templateInsightMaster,
} from '../../../api/config/insight_master';

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
  useDeleteInsightMaster,
  useUploadInsightMaster,
} from '../../../services/mutations/configMutations';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DownloadModal from '../../../../common/components/DownloadModal';
import ErrorTable from '../../../../common/components/ErrorTable';
import TableContainer from '../../../common/components/TableContainer';
import DeleteModal from '../../../common/components/DeleteModal';
import { Dropdown } from '../../../common/Dropdown';
import UploadFile from '../../../common/components/uploadXLSXfile';
import { formatDate } from '../../../utils/constant';
import { Axios, AxiosError } from 'axios';

const InsightMaster = () => {
  const [open, setOpen] = useState(false);
  const [InsightMasterData, setInsightMasterData] = useState<any>();
  const [searchPh, setSearchPh] = useState('');
  const [downloadModalOpen, setdownloadModalOpen] = useState(false);
  const [downloadAllModalOpen, setdownloadAllModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorResponseData, setErrorResponseData] = useState();

  const { data: existingInsightMasters, isLoading } = useQuery({
    queryKey: ['insight-master'],
    queryFn: getInsightMaster,
    refetchOnWindowFocus: false,
  });

  const getPlacement = (id: any) => {
    const isTopStart =
      id >= 4 &&
      id <= 1000 &&
      (id % 5 === 0 || (id % 5 !== 0 && String(id / 5).endsWith('.8')));

    const placementState = 'bottom-start';
    return placementState;
  };

  const columns = useMemo(
    () => [
      {
        header: 'Insight id',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.insight_id}>
            <div className="text-center truncate">
              {cell?.row?.original?.insight_id ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Insight name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.insight_name}>
            <div className="truncate">
              {cell?.row?.original?.insight_name ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Insight type',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.insight_type}>
            <div className="truncate">
              {cell?.row?.original?.insight_type ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'pillar',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.pillar}>
            <div className="truncate">{cell?.row?.original?.pillar ?? '-'}</div>
          </div>
        ),
      },
      {
        header: 'Metric id',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.metric_id}>
            <div className="text-center truncate">
              {cell?.row?.original?.metric_id ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Insight data type',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.insight_data_type}
          >
            <div className="text-center truncate">
              {cell?.row?.original?.insight_data_type ?? '-'}
            </div>
          </div>
        ),
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
                className={`cursor-pointer block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setDeleteModalOpen(true);
                  setInsightMasterData(cell?.row?.original);
                }}
              >
                <Trash2 className="inline-block size-3 ltr:mr-1 rtl:ml-1" />
                <span className="align-middle">Delete</span>
              </li>
            </Dropdown.Content>
          </Dropdown>
        ),
      },
    ],
    []
  );

  const uploadInsightMaster = useUploadInsightMaster();
  const handleOnsubmit = async (formData: any) => {
    try {
      const res = await uploadInsightMaster.mutateAsync(formData);
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
      // toast.error('File upload failed.');
      setUploadModalOpen(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const { data: allTemplateData } = useQuery({
    queryKey: ['all-template-insight-master'],
    queryFn: downloadTemplateInsightMaster,
  });
  const { data: templateData } = useQuery({
    queryKey: ['template-insight-master'],
    queryFn: templateInsightMaster,
  });
  const handleDownload = () => {
    if (downloadModalOpen) {
      const jsonData: any = allTemplateData?.data?.map((item: any) => {
        return {
          insight_id: item?.insight_id ?? '',
          insight_name: item?.insight_name ?? '',
          insight_type: item?.insight_type ?? '',
          pillar: item?.pillar ?? '',
          metric_id: item?.metric_id ?? '',
          insight_data_type: item?.insight_data_type ?? '',
        };
      });
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'insight_master_upload_template.xlsx');
      setdownloadModalOpen(false);
    }
    if (downloadAllModalOpen) {
      const jsonData = templateData?.data;
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'insight_master_upload_template.xlsx');
      setdownloadAllModalOpen(false);
    }
  };
  const handleCancel = () => {
    setdownloadModalOpen(false);
    setdownloadAllModalOpen(false);
  };

  const deleteInsightMaster = useDeleteInsightMaster();
  const handleDelete = () => {
    deleteInsightMaster.mutateAsync(InsightMasterData?._id);
    handleCloseModal();

    if (deleteInsightMaster?.isSuccess) {
      toast.success('Insight Master deleted successfully');
    } else if (deleteInsightMaster?.isError) {
      toast.error('Insight Master deletion failed');
    }
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
              Insight master
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
                      {`Insight master  (${existingInsightMasters?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-[#cccccc] ">
                      Manage existing insight master
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
                    <button
                      title="Click to download table"
                      type="button"
                      className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 disabled:opacity-50"
                      onClick={() => {
                        setdownloadModalOpen(true);
                      }}
                      disabled={
                        existingInsightMasters?.data?.data?.length === 0
                      }
                    >
                      <div className="flex items-center">
                        <DownloadIcon
                          className={`h-6 w-4 ${open ? '' : 'm-auto'}`}
                        />
                        <p className="pl-2">Download table</p>
                      </div>
                    </button>
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
              {existingInsightMasters?.data?.data &&
              existingInsightMasters?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columns || []}
                  data={existingInsightMasters?.data?.data ?? []}
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
          title="insight master"
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

export default InsightMaster;
