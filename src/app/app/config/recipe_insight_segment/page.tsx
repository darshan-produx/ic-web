'use client';
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileEdit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import DeleteModal from '../../../common/components/DeleteModal';
import { toast } from 'react-toastify';
import { getNpsMetric } from '../../../api/config/nps_metric';
import {
  useDeleteNpsMetric,
  useDeleteRecipeInsightSegment,
} from '../../../services/mutations/configMutations';
import AddForm from './addForm';
import EditForm from './editForm';
import { Dropdown } from '../../../common/Dropdown';
import TableContainer from '../../../common/components/TableContainer';
import { getRecipeInsightSegment } from '../../../api/config/recipe_insight_segment';

const NPSMetric = () => {
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchPh, setSearchPh] = useState('');
  const [recipeInsightSegmentData, setRecipeInsightSegmentData] =
    useState<any>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: existingRecipeInsightSegments } = useQuery({
    queryKey: ['recipe-insight-segments'],
    queryFn: getRecipeInsightSegment,
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
        header: 'Recipe id',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.recipe_id}>
            <div className="truncate">
              {cell?.row?.original?.recipe_id ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Recipe name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.recipe_name}>
            <div className="truncate">
              {cell?.row?.original?.recipe_name ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Insight id',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.insight_id}>
            <div className="truncate">
              {cell?.row?.original?.insight_id ?? '-'}
            </div>
          </div>
        ),
      },
      {
        header: 'Customer segment',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className="max-w-64"
            title={cell?.row?.original?.customer_segment_id}
          >
            <div className="truncate">
              {cell?.row?.original?.customer_segment_id &&
              cell?.row?.original?.customer_segment_name
                ? cell?.row?.original?.customer_segment_id +
                  ' - ' +
                  cell?.row?.original?.customer_segment_name
                : '-'}
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
                className={`${
                  cell?.row?.original?._id
                    ? '!cursor-pointer'
                    : '!cursor-not-allowed'
                } block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  if (cell?.row?.original?._id) {
                    setEditData(cell?.row?.original);
                    setEditModal(true);
                  }
                }}
              >
                <FileEdit className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{' '}
                <span className="align-middle">Edit</span>
              </li>
              <li
                className={`cursor-pointer block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setDeleteModalOpen(true);
                  setRecipeInsightSegmentData(cell?.row?.original);
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

  const deleteRecipeInsightSegment = useDeleteRecipeInsightSegment();
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDelete = useCallback(() => {
    deleteRecipeInsightSegment.mutate(recipeInsightSegmentData?._id, {
      onSuccess: () => {
        toast.success('recipe insight segment deleted successfully');
        handleCloseModal();
      },
    });
  }, [recipeInsightSegmentData, deleteRecipeInsightSegment]);

  return (
    <div className="w-full">
      <div className="w-full top-0 z-30  box  bg-top px-4">
        <div className="grid grid-cols-1 border-b-[1px] border-[#80c2fe]   pt-4   ">
          <div className="">
            <h6 className="p-2 font-semi-bold text-black text-[32px] text-left">
              Configure recipe insight segments
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
                      {`Recipe insight segments  (${existingRecipeInsightSegments?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-[#cccccc] ">
                      Manage existing recipe insight segments
                    </p>
                  </div>
                </h6>
                <div className="shrink-0">
                  <div>
                    <button
                      title="Add to recipe insight segment"
                      type="button"
                      className="mx-3 text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                      onClick={() => setAddModal(true)}
                    >
                      <Plus className="inline-block size-4" />{' '}
                      <span className="align-middle">
                        Add recipe insight segment
                      </span>
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
              {existingRecipeInsightSegments?.data?.data &&
              existingRecipeInsightSegments?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columns || []}
                  data={existingRecipeInsightSegments?.data?.data ?? []}
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
      {addModal && <AddForm setAddModal={setAddModal} />}
      {editModal && (
        <EditForm setEditModal={setEditModal} editData={editData} />
      )}
      {deleteModalOpen && (
        <DeleteModal
          show={deleteModalOpen}
          onHide={handleCloseModal}
          onDelete={handleDelete}
          title="recipe insight segment"
        />
      )}
    </div>
  );
};

export default NPSMetric;
