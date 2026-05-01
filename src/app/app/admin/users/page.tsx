'use client';
import { Tooltip } from '@material-tailwind/react';
import React, { useMemo, useState } from 'react';
import { KeyIcon } from '../../../assests/icons/icons';
import AddUserForm from './addUserForm';
import Modal from '../../../../common/Modal';
import { useQuery } from '@tanstack/react-query';
import {
  getNotApprovedUser,
  getRoles,
  getUsers,
} from '../../../api/users/users';
import { toast } from 'react-toastify';
import {
  useDeleteUser,
  usePasswordReset,
  useStatusChange,
} from '../../../../services/mutations/usersMutations';
import TableContainer from '../../../../common/components/TableContainer';
import {
  FileEdit,
  Key,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Dropdown } from '../../../../common/Dropdown';
import DeleteModal from '../../../../common/components/DeleteModal';
import ResetPassword from '../../../../common/components/ResetPassword';
import { apiRequest } from '../../../../common/api-request';

export default function Users() {
  const [openAddUserFrom, setOpenAddUserFrom] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [approveUser, setApproveUser] = useState('');
  const [userData, setUserData] = useState<any>();
  const [searchPh, setSearchPh] = useState('');
  const [searchPhTable2, setSearchPhTable2] = useState('');
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const deleteToggle = () => setDeleteModal(!deleteModal);

  const [resetPassModal, setResetPassModal] = useState<boolean>(false);
  const resetPassToggle = () => setResetPassModal(!resetPassModal);

  const handleDelete = async () => {
    try {
      const res = await deleteUser.mutateAsync(userData?.user?._id);
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        setUserData({});
        toast.success('User deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResetPass = async () => {
    try {
      const res = await resetPassword.mutateAsync({
        username: userData?.user?.email,
      });
      if (res?.status == 200 || res?.status == 201) {
        setResetPassModal(false);
        toast.success('Password reset successfully.');
        setUserData(null);
      } else {
        setResetPassModal(!resetPassModal);
        // toast.error('');
      }
    } catch (err: any) {
      setResetPassModal(!resetPassModal);
      toast.error(err.message);
    }
  };

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=false',
      }),
    refetchOnWindowFocus: false,
  });

  const { data: existingUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
  });

  const { data: newUsers } = useQuery({
    queryKey: ['newUsers'],
    queryFn: () => getNotApprovedUser(),
    refetchOnWindowFocus: false,
  });
  const { data: roles } = useQuery({
    queryKey: ['user_roles'],
    queryFn: () => getRoles(),
    refetchOnWindowFocus: false,
  });

  const deleteUser = useDeleteUser();
  const statusChange = useStatusChange();
  const resetPassword = usePasswordReset();

  const getPlacement = (id: any) => {
    const isTopStart =
      id >= 4 &&
      id <= 1000 &&
      (id % 5 === 0 || (id % 5 !== 0 && String(id / 5).endsWith('.8')));

    const placementState = 'bottom-start';
    return placementState;
  };

  const newUserColumns = useMemo(
    () => [
      {
        header: 'Name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 font-medium rounded-full shrink-0 bg-slate-200 text-slate-800 dark:text-zink-50 dark:bg-zink-600">
              {cell?.row?.original?.picture ? (
                <img
                  src={cell?.row?.original.picture}
                  alt=""
                  className="h-10 rounded-full"
                />
              ) : (
                cell?.row?.original.first_name?.charAt(0)?.toUpperCase() +
                cell?.row?.original?.last_name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="">
              <h6 className="">
                <div className="">
                  {cell?.row?.original?.first_name +
                    ' ' +
                    cell?.row?.original?.last_name}
                </div>
              </h6>
            </div>
          </div>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        enableColumnFilter: false,
      },

      {
        header: 'Action',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell: any) => (
          <div className="flex justify-start">
            <button
              onClick={() => {
                setEditData({ user: cell?.row?.original });
                setOpenAddUserFrom(true);
                setApproveUser('Approve');
              }}
              className=" bg-white text-custom-500 btn border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:bg-zink-700 dark:hover:bg-custom-500 dark:ring-custom-400/20 dark:focus:bg-custom-500"
            >
              Approve
            </button>

            <button
              onClick={() => {
                setDeleteModal(true);
                setUserData({ user: cell?.row?.original, reject: true });
              }}
              className="mx-2 bg-white text-custom-500 btn border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:bg-zink-700 dark:hover:bg-custom-500 dark:ring-custom-400/20 dark:focus:bg-custom-500"
            >
              Reject
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const columnsUsers = useMemo(
    () => [
      {
        header: 'Name',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 font-medium rounded-full shrink-0 bg-slate-200 text-slate-800 dark:text-zink-50 dark:bg-zink-600">
              {cell?.row?.original?.user?.picture ? (
                <img
                  src={cell?.row?.original?.user?.picture}
                  alt=""
                  className="h-10 rounded-full"
                />
              ) : (
                cell?.row?.original?.user?.first_name
                  ?.charAt(0)
                  ?.toUpperCase() +
                cell?.row?.original?.user?.last_name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="">
              <h6 className="">
                <div className="">
                  {cell?.row?.original?.user?.first_name +
                    ' ' +
                    cell?.row?.original?.user?.last_name}
                </div>
              </h6>
              {/* <p className="text-slate-500 dark:text-zink-200">
                {...cell?.row?.original?.roles?.map(
                  (ele: any, index: number) => (
                    <span>
                      {ele?.name?.charAt(0).toUpperCase() +
                        ele?.name?.slice(1).toLowerCase()}{' '}
                      {index < cell?.row?.original?.roles.length - 1
                        ? ', '
                        : ''}
                    </span>
                  )
                )}
              </p> */}
              <p className="text-slate-500 dark:text-zink-200">
                {cell?.row?.original?.roles?.map((ele: any, index: number) => (
                  <span key={index}>
                    {ele?.name?.charAt(0).toUpperCase() +
                      ele?.name?.slice(1).toLowerCase()}
                    {index < (cell?.row?.original?.roles?.length ?? 0) - 1
                      ? ', '
                      : ''}
                  </span>
                )) ?? <span>No roles assigned</span>}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'user.email',
        enableColumnFilter: false,
      },
      {
        header: 'Supervisors',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="text-ellipsis overflow-hidden w-35 ">
            {cell?.row?.original?.supervisors &&
            cell?.row?.original?.supervisors.length > 0
              ? cell?.row?.original?.supervisors
                  .map(
                    (sup: any) =>
                      sup.supervisor_first_name +
                      ' ' +
                      sup.supervisor_last_name
                  )
                  .join(', ')
              : '-'}
          </div>
        ),
      },
      {
        header: 'Status',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell: any) => (
          <Tooltip
            content={
              cell?.row?.original?.is_active
                ? 'Inactivate user'
                : 'Activate user'
            }
            arrow={false}
          >
            <div
              className={`relative w-[32px] h-[16px]  rounded-full  ${'cursor-pointer'}`}
            >
              <label className={'cursor-pointer'}>
                <input
                  type="checkbox"
                  tabIndex={Number('-1')}
                  checked={cell?.row?.original?.is_active}
                  disabled={
                    userinfo?.data?.email == cell?.row?.original?.user?.email
                      ? true
                      : false
                  }
                  className="sr-only peer"
                  onChange={async (e: any) => {
                    if (
                      userinfo?.data?.email != cell?.row?.original?.user?.email
                    ) {
                      try {
                        if (e.target.checked) {
                          await statusChange.mutateAsync({
                            id: cell?.row?.original?.user?._id,
                            data: { is_active: true },
                          });
                          toast.success('User activated successfully.');
                        } else {
                          await statusChange.mutateAsync({
                            id: cell?.row?.original?.user?._id,
                            data: { is_active: false },
                          });
                          toast.success('User deactivated successfully.');
                        }
                      } catch (err: any) {
                        toast.error(err?.response?.data?.message);
                      }
                    }
                  }}
                />
                <div
                  className={`w-full h-full bg-gray-500   ${
                    cell?.row?.original?.is_active
                      ? ` toggleShadowActive  `
                      : ' toggleShadowInActive '
                  } border-[0.5px] border-gray-500 outline-none peer-focus:outline-none  rounded-full peer  peer-checked:after:translate-x-[162%] rtl:peer-checked:after:-translate-x-[162%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white  after:rounded-full after:h-[10px] after:w-[10px] after:my-[1px] after:mx-[2px]  after:transition-all  peer-checked:bg-green-500 peer-checked:bg-opacity-100  peer-checked:border-[1px] peer-checked:border-green-500 ${
                    userinfo?.data?.email == cell?.row?.original?.user?.email
                      ? '  peer-checked:!bg-opacity-50 peer-checked:!border-green-100 !cursor-not-allowed'
                      : ` peer  peer-checked:after:translate-x-[162%] rtl:peer-checked:after:-translate-x-[162%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white  after:rounded-full after:h-[10px] after:w-[10px] after:my-[1px] after:mx-[2px]  after:transition-all  peer-checked:bg-green-500 peer-checked:bg-opacity-100  peer-checked:border-[1px] peer-checked:border-green-500`
                  }  `}
                ></div>
              </label>
            </div>
          </Tooltip>
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
                className={`${
                  cell?.row?.original?.is_active
                    ? '!cursor-pointer'
                    : '!cursor-not-allowed'
                } block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  if (cell?.row?.original?.is_active) {
                    setEditData(cell?.row?.original);
                    setOpenAddUserFrom(true);
                    setApproveUser('');
                  }
                }}
              >
                <FileEdit className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{' '}
                <span className="align-middle">Edit</span>
              </li>
              <li
                className={`${
                  cell?.row?.original?.is_active
                    ? '!cursor-pointer'
                    : '!cursor-not-allowed'
                } block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  if (cell?.row?.original?.is_active) {
                    setResetPassModal(true);
                    setUserData(cell?.row?.original);
                  }
                }}
              >
                <KeyIcon className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{' '}
                <span className="align-middle">Reset Password</span>
              </li>

              <li
                className={`${
                  cell?.row?.original?.is_active &&
                  userinfo?.data?.email != cell?.row?.original?.user?.email
                    ? '!cursor-pointer'
                    : '!cursor-not-allowed'
                } block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200`}
                onClick={() => {
                  if (
                    cell?.row?.original?.is_active &&
                    userinfo?.data?.email != cell?.row?.original?.user?.email
                  ) {
                    setDeleteModal(true);
                    setUserData(cell?.row?.original);
                  }
                }}
              >
                <Trash2 className="inline-block size-3 ltr:mr-1 rtl:ml-1" />{' '}
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
      <div className="w-full top-0 z-30  box  bg-top px-4">
        <div className="grid grid-cols-2 border-b-[1px] border-[#80c2fe]   pt-4   ">
          <div className="">
            <h6 className="p-2 font-semi-bold text-black text-[32px] text-left">
              User management
            </h6>
          </div>
          <div className=""></div>
        </div>
      </div>
      <div className="mt-8  px-10 2xl:px-16"></div>
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={
          userData?.user?.first_name
            ? userData?.user?.first_name + ' ' + userData?.user?.last_name
            : userData?.user?.email
        }
      />

      <ResetPassword
        show={resetPassModal}
        onHide={resetPassToggle}
        onResetPassowrd={handleResetPass}
      />

      <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-12 mx-4">
        <div className="xl:col-span-12">
          <div className="card" id="usersTable">
            <div className="card-body">
              <div className="flex items-center">
                <h6 className="text-15 grow">
                  <div className="block">
                    <h6 className="font-semibold text-[20px] text-black">
                      {`Pending requests (${newUsers?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-slate-500 "></p>
                  </div>
                </h6>
              </div>
            </div>
            <div className="!py-3.5 card-body border-y border-dashed border-slate-200 dark:border-zink-500">
              <form action="#!">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="relative xl:col-span-2">
                    <input
                      type="text"
                      className="px-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Search "
                      autoComplete="off"
                      autoFocus
                      value={searchPhTable2}
                      onChange={(e: any) => setSearchPhTable2(e?.target?.value)}
                    />
                    <Search className="mx-2 inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600" />
                  </div>
                </div>
              </form>
            </div>
            <div className="card-body">
              {newUsers?.data?.data && newUsers?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={newUserColumns || []}
                  data={
                    newUsers?.data?.data?.map((ele: any) => {
                      return {
                        ...ele,
                        name: ele?.first_name + ' ' + ele?.last_name,
                      };
                    }) ?? []
                  }
                  customPageSize={5}
                  // isGlobalFilter={true}
                  searchTerm={searchPhTable2}
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
      {openAddUserFrom ? (
        <Modal
          Content={
            <AddUserForm
              editData={editData}
              setOpenAddUserFrom={setOpenAddUserFrom}
              existingUsers={
                existingUsers?.data?.data?.map((ele: any) => {
                  return {
                    ...ele,
                    name: ele?.user?.first_name + ' ' + ele?.user?.last_name,
                  };
                }) ?? []
              }
              approveUser={approveUser}
              roles={roles}
            />
          }
          size="w-2/4 2xl:w-2/5 xl:w-2/5"
          backBg="card"
        ></Modal>
      ) : (
        ''
      )}

      {}
      <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-12 mx-4">
        <div className="xl:col-span-12">
          <div className="card" id="usersTable">
            <div className="card-body">
              <div className="flex items-center">
                <h6 className="text-15 grow">
                  <div className="block">
                    <h6 className="font-semibold text-[20px] text-black">
                      {`Users  (${existingUsers?.data?.data?.length})`}
                    </h6>
                    <p className="font-normal my-1 text-[14px] tracking-normal leading-5 text-slate-500 ">
                      Manage existing users, change roles or deactivate users.
                    </p>
                  </div>
                </h6>
                <div className="shrink-0">
                  <button
                    type="button"
                    className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                    onClick={() => {
                      setEditData(null);
                      setOpenAddUserFrom(true);
                      setApproveUser('');
                    }}
                  >
                    <Plus className="inline-block size-4" />{' '}
                    <span className="align-middle">Add user</span>
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
              {existingUsers?.data?.data &&
              existingUsers?.data?.data?.length > 0 ? (
                <TableContainer
                  isPagination={true}
                  columns={columnsUsers || []}
                  data={
                    existingUsers?.data?.data?.map((ele: any) => {
                      return {
                        ...ele,
                        name:
                          ele?.user?.first_name + ' ' + ele?.user?.last_name,
                      };
                    }) ?? []
                  }
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

