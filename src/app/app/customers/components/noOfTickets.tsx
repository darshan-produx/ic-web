import Modal from '../../../../common/components/Modal';
import TableContainer from '../../../../common/components/TableContainer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Tickets from './tickets';
import { formatNumber } from '../../../utils/formatNumber';
import Synthesis from '../[id]/metrics/synthesis';

interface props {
  customerTickets: any;
  id: number;
  synthesisData: any;
  displayName?: string;
}
const NoOfTicktes = ({
  customerTickets,
  id,
  synthesisData,
  displayName,
}: props) => {
  const [ticketType, setTicketType] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('');
  const [MissedSla, setMissedSla] = useState<any>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const units = customerTickets?.data[0]?.units_of_time ?? 'days';
  const columns = useMemo(
    () => [
      {
        header: 'Tickets Priority',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div>
            {cell.row?.original?.ticket_type
              ? cell.row?.original?.ticket_type
              : '-'}
          </div>
        ),
      },
      {
        header: 'Reported in this period',
        enableColumnFilter: false,
        cell: (cell: any) =>
          cell.row?.original?.reported_in_period ? (
            <div
              className="text-[#3B82F6] cursor-pointer"
              onClick={() => {
                setShow(true);
                setTicketType(cell.row?.original?.ticket_type);
                setStartDate(cell.row?.original?.period_start_time);
                setEndDate(cell.row?.original?.period_end_time);
                setMissedSla(undefined);
                setStatus('');
              }}
            >
              {cell.row?.original?.reported_in_period}
            </div>
          ) : (
            <div>-</div>
          ),
      },

      {
        header: 'Open as of today',
        enableColumnFilter: false,
        cell: (cell: any) =>
          cell.row?.original?.current_open ? (
            <div
              className="text-[#3B82F6] cursor-pointer"
              onClick={() => {
                setTicketType(cell.row?.original?.ticket_type);
                setStartDate(undefined);
                setEndDate(undefined);
                setStatus('!Closed');
                setMissedSla(undefined);
                setShow(true);
              }}
            >
              {cell.row?.original?.current_open}
            </div>
          ) : (
            <div> -</div>
          ),
      },
      {
        header: `Average ${units} to resolve`,
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div>
            {cell.row?.original?.avg_resolve_time
              ? formatNumber(cell.row?.original?.avg_resolve_time)
              : '-'}
          </div>
        ),
      },
      {
        header: 'Missed SLA',
        enableColumnFilter: false,
        cell: (cell: any) =>
          cell.row?.original?.missed_sla ? (
            <div
              className="text-[#3B82F6] cursor-pointer"
              onClick={() => {
                setShow(true);
                setTicketType(cell.row?.original?.ticket_type);
                setMissedSla(true);
                setStartDate(cell.row?.original?.period_start_time);
                setEndDate(cell.row?.original?.period_end_time);
                setStatus('');
              }}
            >
              {cell.row?.original?.missed_sla}
            </div>
          ) : (
            <div>-</div>
          ),
      },
    ],
    []
  );

  const toggle = useCallback(() => {
    if (show) {
      setTicketType('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus('');
      setMissedSla(undefined);
      setShow(false);
    } else {
      setShow(true);
    }
  }, [show]);
  useEffect(() => {
    if (ticketType) {
    }
  }, [ticketType]);
  return (
    <div>
      <p className="text-[16px] text-[#141C24] pb-6 font-medium">
        {displayName || 'Customer Service'}
      </p>
      {synthesisData?.map((ele: any) => {
        if (
          ele?.type?.toLowerCase() == 'pillar' &&
          ele?.subtype?.toLowerCase() == 'customerservice'
        ) {
          return <Synthesis synthesisData={ele?.synthesis} />;
        }
      })}
      <div>
        <TableContainer
          isPagination={false}
          columns={columns ?? []}
          data={customerTickets.data ?? []}
          customPageSize={customerTickets?.data?.length}
          // isGlobalFilter={true}
          searchTerm={''}
          divclassName=" col-span-12 overflow-x-auto lg:col-span-12 border border-gray-200 rounded-xl"
          tableclassName="border-gray-200 shadow-sm dataTable w-full dataTable w-full text-[14px] align-middle whitespace-nowrap no-footer"
          theadclassName="border-gray-200 dark:border-zink-500"
          tbodyclassName="divide-y border-gray-200 border-b-rounded-xl divide-gray-200 dark:divide-zink-500"
          thclassName="p-3 divide-y sorting px-3 py-4 text-[14px] text-gray-800 bg-gray-50 font-medium text-left dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500 sorting_asc"
          tdclassName="p-3 group-[.bordered]:border text-gray-800 text-[14px] font-normal group-[.bordered]:border-gray-200 group-[.bordered]:dark:border-zink-500"
          PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
          emptyPlaceHolderForTable="No ticket"
        />
      </div>

      <Modal
        show={show}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[72rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
          <Tickets
            ticketType={ticketType}
            customer_id={id}
            startDate={startDate}
            endDate={endDate}
            status={status}
            MissedSla={MissedSla}
            onHide={setShow}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default NoOfTicktes;
