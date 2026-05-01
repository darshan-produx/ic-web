'use client';
import React, { useState, useMemo } from 'react';
import { escapeRegExp } from '../../../utils/constant';
import Modal from '../../../common/Modal';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useDeleteCustomerSegment } from '../../../services/mutations/customerSegmentMutations';
import AddCustomerSegmentForm from './addCustomerSegmentForm';
import { getCustomerSegments } from '../../../api/segments/segments';
import TableContainer from '../../../common/components/TableContainer';
import { FileEdit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { Dropdown } from '../../../common/Dropdown';
import DeleteModal from '../../../common/components/DeleteModal';

export default function Users() {
  const [openAddCustomerSegmentForm, setOpenAddCustomerSegmentForm] =
    useState(false);
  const [editData, setEditData] = useState(null);
  const [customerSegmentData, setCustomerSegmentData] = useState<any>();
  const [searchPh, setSearchPh] = useState('');
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const deleteToggle = () => setDeleteModal(!deleteModal);

  const { data: allCustomerSegments } = useQuery({
    queryKey: ['allCustomerSegments'],
    queryFn: getCustomerSegments,
    refetchOnWindowFocus: false,
  });
  const deleteCustomerSegment = useDeleteCustomerSegment();
  const handleDelete = async () => {
    try {
      const res = await deleteCustomerSegment.mutateAsync(
        customerSegmentData?._id
      );
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        setCustomerSegmentData({});
        toast.success('User deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  const getPlacement = (id: any) => {
    const isTopStart =
      id >= 4 &&
      id <= 1000 &&
      (id % 5 === 0 || (id % 5 !== 0 && String(id / 5).endsWith('.8')));

    const placementState = 'bottom-start';
    return placementState;
  };

  const getTruncatedText = (text: string) => {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach((word, index) => {
      if ((index + 1) % 5 === 0) {
        lines.push(line.trim());
        line = '';
      }
      line += `${word} `;
    });
    if (line.trim() !== '') {
      lines.push(line.trim());
    }
    const truncatedLines = lines.slice(0, 2);
    let truncatedText = truncatedLines.join('<br>');
    if (lines.length > 2) {
      truncatedText += '...';
    }
    return truncatedText;
  };

  const regex = new RegExp(`(${escapeRegExp(searchPh)})`, 'i');

  const columnsUsers = useMemo(
    () => [
      {
        header: 'Segment name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 font-medium rounded-full shrink-0 bg-slate-200 text-slate-800 dark:text-zink-50 dark:bg-zink-600">
              {cell?.row?.original?.segment_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="">
              <h6 className="">
                <div className="">{cell?.row?.original?.segment_name}</div>
              </h6>
            </div>
          </div>
        ),
      },
      {
        header: 'Description',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.description}>
            <div className="truncate">
              {cell?.row?.original?.description ?? '-'}
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
                data-modal-target="addUserModal"
                className={`cursor-pointer block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setEditData(cell?.row?.original);
                  setOpenAddCustomerSegmentForm(true);
                }}
              >
                <FileEdit className="inline-block size-3 ltr:mr-1 rtl:ml-1" />
                <span className="align-middle">Edit</span>
              </li>

              <li
                className={`cursor-pointer block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  setDeleteModal(true);
                  setCustomerSegmentData(cell?.row?.original);
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

  return (
    <div className="w-full">
      <div className="w-full top-0 z-30  box  bg-top px-10 2xl:px-16">
        <div className="grid grid-cols-2 border-b-[1px] border-[#80c2fe]  pb-4 pt-4">
          <div className="">
            <h6 className="p-2 font-bold text-black text-[32px] text-left">
              Customer segment management
            </h6>
          </div>
        </div>
      </div>
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={customerSegmentData?.segment_name}
      />
      <div>
        {openAddCustomerSegmentForm ? (
          <Modal
            Content={
              <AddCustomerSegmentForm
                editData={editData}
                setOpenAddCustomerSegmentForm={setOpenAddCustomerSegmentForm}
                allCustomerSegments={allCustomerSegments?.data?.data}
              />
            }
            size="w-2/4 2xl:w-2/5 xl:w-2/5"
            backBg=" card"
          ></Modal>
        ) : (
          ''
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-12 mx-4">
        <div className="xl:col-span-12">
          <div className="card" id="usersTable">
            <div className="card-body">
              <div className="flex items-center">
                <h6 className="text-15 grow">
                  <div className="block">
                    <h6 className="font-semibold text-[20px] text-black">
                      {`Customer segments  (${allCustomerSegments?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-slate-500 ">
                      Manage customer segments, add,edit and delete customer
                      segments.
                    </p>
                  </div>
                </h6>
                <div className="shrink-0">
                  <button
                    type="button"
                    className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                    onClick={() => {
                      setEditData(null);
                      setOpenAddCustomerSegmentForm(true);
                    }}
                  >
                    <Plus className="inline-block size-4" />{' '}
                    <span className="align-middle">Add customer segment</span>
                  </button>
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
              {allCustomerSegments?.data?.data &&
              allCustomerSegments?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columnsUsers || []}
                  data={allCustomerSegments?.data.data || []}
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
    </div>
  );
}
