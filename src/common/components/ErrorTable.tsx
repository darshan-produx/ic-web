import { useMemo, useState } from 'react';
import TableContainer from '../../common/components/TableContainer';
import Modal from '../../common/components/Modal';

// const columns: ColumnDef[] = [
//   {
//     key: 'rowNumber',
//     label: 'Row Number',
//     type: 'number',
//   },
//   {
//     key: 'errors',
//     label: 'Errors',
//     type: 'text',
//   },
// ];

// const [searchPhTable2, setSearchPhTable2] = useState('');

const ErrorTable = ({
  setErrorModalOpen,
  errorResponseData,
}: {
  setErrorModalOpen: any;
  errorResponseData: any;
}) => {
  // const columns = useMemo(
  //   () => [
  //     {
  //       header: 'Row number',
  //       enableColumnFilter: false,
  //       cell: (cell: any) => (
  //         <div className="max-w-64" title={cell?.row?.original?.rowNumber}>
  //           <div className="truncate">
  //             {cell?.row?.original?.rowNumber ?? '-'}
  //           </div>
  //         </div>
  //       ),
  //     },
  //     {
  //       header: 'Errors',
  //       enableColumnFilter: false,
  //       cell: (cell: any) => (
  //         <div className="max-w-64" title={cell?.row?.original?.errors}>
  //           <div className="truncate">{cell?.row?.original?.errors ?? '-'}</div>
  //         </div>
  //       ),
  //     },
  //   ],
  //   []
  // );
  const columns = useMemo(() => {
    const hasRowNumber =
      errorResponseData?.errors?.length > 0 &&
      errorResponseData?.errors?.some(
        (row: any) =>
          row?.rowNumber !== undefined &&
          row?.rowNumber !== null &&
          row?.rowNumber !== '-'
      );
    const baseColumns = [
      {
        header: 'Errors',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div
            className={`${hasRowNumber ? 'max-w-64' : 'max-w-full'}`}
            title={cell?.row?.original?.errors}
          >
            <div className="truncate">{cell?.row?.original?.errors ?? '-'}</div>
          </div>
        ),
      },
    ];

    if (hasRowNumber) {
      baseColumns.unshift({
        header: 'Row number',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <div className="max-w-64" title={cell?.row?.original?.rowNumber}>
            <div className="truncate">
              {cell?.row?.original?.rowNumber ?? '-'}
            </div>
          </div>
        ),
      });
    }

    return baseColumns;
  }, [errorResponseData]);

  return (
    <Modal
      show={setErrorModalOpen}
      onHide={() => setErrorModalOpen(false)}
      id="largeModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[40rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        <Modal.Title className="text-16">Error summary</Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
        <div className="card-body">
          {errorResponseData?.errors &&
          errorResponseData?.errors?.length > 0 ? (
            <TableContainer
              isPagination={true}
              columns={columns || []}
              data={errorResponseData?.errors ?? []}
              customPageSize={5}
              // isGlobalFilter={true}
              // searchTerm={searchPh}
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
      </Modal.Body>
      <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
        <div className="flex justify-end">
          <button
            type="button"
            className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
            onClick={() => setErrorModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorTable;
