'use client';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DownloadIcon,
  FileEdit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UploadIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useDeletePerformanceDefectKpi,
  useUploadPerformanceDefectKpi,
} from '../../../services/mutations/configMutations';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DownloadModal from '../../../../common/components/DownloadModal';
import ErrorTable from '../../../../common/components/ErrorTable';
import TableContainer from '../../../common/components/TableContainer';
import DeleteModal from '../../../common/components/DeleteModal';
import { Dropdown } from '../../../common/Dropdown';
import UploadFile from '../../../common/components/uploadXLSXfile';
import {
  downloadTemplatePerformanceDefectKpi,
  getPerformanceDefectKpi,
  templatePerformanceDefectKpi,
} from '../../../api/config/performance_defect_kpi';
import { formatDate } from '../../../utils/constant';
import { AxiosError } from 'axios';
import AddEditKPIForm from './addEditKPIForm';
import Modal from '../../../common/Modal';

const PerformaceDefectKpi = () => {
  const [open, setOpen] = useState(false);
  const [performanceDefectKpiData, setPerformanceDefectKpiData] =
    useState<any>();
  const [searchPh, setSearchPh] = useState('');
  const [downloadModalOpen, setdownloadModalOpen] = useState(false);
  const [downloadAllModalOpen, setdownloadAllModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorResponseData, setErrorResponseData] = useState();
  const [createUpdateModalOpen, setCreateUpdateModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const { data: existingPerformanceDefectKpis, isLoading } = useQuery({
    queryKey: ['performance-defect-kpis'],
    queryFn: getPerformanceDefectKpi,
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.ID}>
            <div className="truncate">{cell?.row?.original?.ID ?? '-'}</div>
          </div>
        ),
      },
      {
        header: 'Customer id',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.customer_id}>
            <div className="truncate">
              {cell?.row?.original?.customer_id ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Customer name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.customer_name}>
            <div className="truncate">
              {cell?.row?.original?.customer_name ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Metric name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.metric_name}>
            <div className="truncate">
              {cell?.row?.original?.metric_name ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Metric type',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.metric_type}>
            <div className="truncate">
              {cell?.row?.original?.metric_type ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Aggregation method',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.aggregation_method}
          >
            <div className="truncate">
              {cell?.row?.original?.aggregation_method ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Status aggregation level',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.status_aggregation_level}
          >
            <div className="truncate">
              {cell?.row?.original?.status_aggregation_level ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Threshold',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.threshold}>
            <div className="truncate">
              {cell?.row?.original?.threshold ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Target',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.target}>
            <div className="truncate">{cell?.row?.original?.target ?? '-'}</div>
          </div>
        ),
      },
      {
        header: 'Unit',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.unit}>
            <div className="truncate">{cell?.row?.original?.unit ?? '-'}</div>
          </div>
        ),
      },

      {
        header: 'Start date',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.start_date}>
            <div className="truncate">
              {cell?.row?.original?.start_date
                ? formatDate(cell?.row?.original?.start_date)
                : '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'End date',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.end_date}>
            <div className="truncate">
              {cell?.row?.original?.end_date
                ? formatDate(cell?.row?.original?.end_date)
                : '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Metric display string',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.metric_display_str}
          >
            <div className="truncate">
              {cell?.row?.original?.metric_display_str ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Status flag',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.status_flag ? 'True' : 'False'}
          >
            <div className="truncate">
              {cell?.row?.original?.status_flag ? 'True' : 'False'}
            </div>
          </div>
        ),
      },
      {
        header: 'Insight flag',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.insight_flag ? 'True' : 'False'}
          >
            <div className="truncate">
              {cell?.row?.original?.insight_flag ? 'True' : 'False'}
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
                  setCreateUpdateModalOpen(true);
                  setEditData(cell?.row?.original);
                }}
              >
                <FileEdit className="inline-block size-3 ltr:mr-1 rtl:ml-1" />
                <span className="align-middle">Edit</span>
              </li>
              <li
                className={`cursor-pointer block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setDeleteModalOpen(true);
                  setPerformanceDefectKpiData(cell?.row?.original);
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

  const uploadPerformanceDefectKpi = useUploadPerformanceDefectKpi();
  const hadleOnsubmit = async (formData: any) => {
    try {
      const res = await uploadPerformanceDefectKpi.mutateAsync(formData);
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

  const { data: allTemplateData } = useQuery({
    queryKey: ['template-performance-defect-kpis'],
    queryFn: downloadTemplatePerformanceDefectKpi,
  });
  const { data: templateData } = useQuery({
    queryKey: ['template-performance-defect-kpi'],
    queryFn: templatePerformanceDefectKpi,
  });
  const handleDownload = () => {
    if (downloadModalOpen) {
      const jsonData = allTemplateData?.data;

      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'performance_and_quality_metric_upload_template.xlsx');
      setdownloadModalOpen(false);
    }
    if (downloadAllModalOpen) {
      const jsonData = templateData?.data;
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'performance_and_quality_metric_upload_template.xlsx');
      setdownloadAllModalOpen(false);
    }
  };
  const handleCancel = () => {
    setdownloadModalOpen(false);
    setdownloadAllModalOpen(false);
  };

  const deletePerformanceDefectKpi = useDeletePerformanceDefectKpi();
  const handleDelete = () => {
    deletePerformanceDefectKpi.mutate(performanceDefectKpiData?._id);
    handleCloseModal();

    if (deletePerformanceDefectKpi) {
      toast.success('Performance quality KPI deleted successfully');
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
              Performance / quality metrics
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
                      {`Performance / quality metrics  (${existingPerformanceDefectKpis?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-[#cccccc] ">
                      Manage existing performance / quality metrics
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
            <div className="!py-3.5 card-body border-y border-dashed border-slate-200 dark:border-zink-500 flex">
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
              <button
                title="Click to Add KPI"
                type="button"
                className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 h-[38px]"
                onClick={() => {
                  setEditData(null);
                  setCreateUpdateModalOpen(true);
                }}
              >
                <div className="flex items-center whitespace-nowrap">
                  <Plus className={`h-6 w-4 ${open ? '' : 'm-auto'}`} />
                  <p className="pl-2">Add KPI</p>
                </div>
              </button>
            </div>
            <div className="card-body">
              {existingPerformanceDefectKpis?.data?.data &&
              existingPerformanceDefectKpis?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columns || []}
                  data={existingPerformanceDefectKpis?.data?.data ?? []}
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
          title="performance defect kpi"
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
          onSubmitHandler={hadleOnsubmit}
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
      {createUpdateModalOpen ? (
        <Modal
          Content={
            <AddEditKPIForm
              editData={editData}
              setCreateUpdateModalOpen={setCreateUpdateModalOpen}
            />
          }
          size="w-[750px]"
          backBg="card"
        ></Modal>
      ) : (
        ''
      )}
    </div>
  );
};

export default PerformaceDefectKpi;
