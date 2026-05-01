import { useQuery } from '@tanstack/react-query';
import { getAllCustomerTicketsByType } from '../../../api/tasks/tasks';
import TableContainer from '../../../../common/components/TableContainer';
import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import dayjs from 'dayjs';

interface props {
  ticketType: string;
  customer_id: number;
  startDate?: string;
  endDate?: string;
  status: string;
  onHide: any;
  MissedSla?: boolean;
}
const Tickets = ({
  ticketType,
  customer_id,
  startDate,
  endDate,
  status,
  onHide,
  MissedSla
}: props) => {
  const [searchPh, setSearchPh] = useState('');
  const { data: AllTicketsByType } = useQuery({
    queryKey: [
      'getAllCustomerTicketsByType',
      customer_id,
      ticketType,
      status,
      startDate,
      endDate,
      MissedSla
    ],
    queryFn: () =>
      getAllCustomerTicketsByType(
        customer_id,
        ticketType,
        status,
        startDate,
        endDate,
        MissedSla
      ),
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(
    () => [
      {
        header: 'Bug ID ',
        enableColumnFilter: false,
        cell: (cell: any) => <div>{cell.row?.original?.ticket_id ?? '-'}</div>,
      },
      {
        header: 'Title',
        enableColumnFilter: false,
        cell: (cell: any) => <div>{cell.row?.original?.title ?? '-'}</div>,
      },
      {
        header: 'Category',
        enableColumnFilter: false,
        cell: (cell: any) => <div>{cell.row?.original?.category ?? '-'}</div>,
      },
      {
        header: 'Priority',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div>{cell.row?.original?.ticket_type ?? '-'}</div>
        ),
      },

      {
        header: 'Date of filing',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div>
            {dayjs(cell.row?.original?.ticket_created_at).format(
              'DD MMM, YYYY'
            ) ?? '-'}
          </div>
        ),
      },

      {
        header: 'Created by',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="flex gap-3">
            {/* <img
              src={cell.row?.original?.ticket_created_by_picture}
              alt=""
              className="w-6 h-6 rounded-full"
            /> */}
            {cell.row?.original?.ticket_created_by ?? '-'}
          </div>
        ),
      },
      {
        header: 'Current status',
        enableColumnFilter: false,
        cell: (cell: any) => <div>{cell.row?.original?.status ?? '-'}</div>,
      },
      {
        header: 'Date of closing',
        enableColumnFilter: false,
        cell: (cell: any) => <div>
            {cell.row?.original?.status === "Closed"?dayjs(cell.row?.original?.status_update_date).format(
              'DD MMM, YYYY'
            ) : '-'}
          </div>,
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex justify-between pr-0.5">
        <div className="flex items-center gap-3 text-sm ">
          <span className="text-gray-900 border-r pr-3 text-[16px] border-gray-300 font-medium">
            {ticketType}
          </span>

          <span className="text-gray-500">
            {startDate && endDate? MissedSla?'Missed SLA':'Reported in this period' : 'Open as of today'}
          </span>
        </div>
        <div>
          <X
            className="cursor-pointer text-gray-400 h-5 w-5"
            onClick={() => onHide(false)}
          />
        </div>
      </div>
      <div className="pt-4">
        <div className="relative xl:col-span-2 w-1/4">
          <input
            type="text"
            className="px-10 align-middle search form-input text-gray-400 border-slate-200 dark:border-zink-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-gray-400 dark:placeholder:text-zink-200"
            placeholder="Search bugs"
            autoComplete="off"
            autoFocus
            value={searchPh}
            onChange={(e: any) => setSearchPh(e?.target?.value)}
          />
          <Search className="mx-3 inline-block size-3.5 absolute ltr:left-2.5 rtl:right-2.5 top-3 text-gray-800 dark:text-zink-200 dark:fill-zink-600" />
        </div>
        <div className="pt-4">
          <TableContainer
            isPagination={false}
            columns={columns ?? []}
            data={AllTicketsByType?.data?.data ?? []}
            customPageSize={AllTicketsByType?.data?.data.length}
            // isGlobalFilter={true}
            searchTerm={searchPh}
            divclassName=" col-span-12 overflow-x-auto lg:col-span-12 border border-gray-200 rounded-xl"
            tableclassName="border-gray-200 shadow-sm dataTable w-full dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-gray-200 dark:border-zink-500"
            tbodyclassName="divide-y border-gray-200 border-b-rounded-xl divide-gray-200 dark:divide-zink-500"
            thclassName="p-3 divide-y sorting px-3 py-[11px] text-sm text-gray-800 bg-gray-50 font-medium text-left dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500 sorting_asc"
            tdclassName="p-3 group-[.bordered]:border text-gray-800 text-sm font-normal group-[.bordered]:border-gray-200 group-[.bordered]:dark:border-zink-500"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
          />
        </div>
      </div>
    </div>
  );
};
export default Tickets;
