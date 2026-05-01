import dayjs from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Pagination from './Pagination';
import { TriangleDownIcon, TriangleUpIcon } from '../app/assests/icons/icons';

export interface ColumnDef {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'datetime'
    | 'sr_no'
    | 'checkbox'
    | 'time'
    | 'element';
  onChange?: (event: ChangeEvent<HTMLInputElement>, row: any) => void;
  render?: (row: any) => JSX.Element;
  computedValue?: (row: any) => string;
  separateLine?: boolean;
}

export type FetchRowsCallback = (
  pageNo: number,
  rowsPerPage: number,
  sortColumn?: string | null,
  isAscending?: boolean,
  searchText?: string
) => void;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getElem(obj: { [key: string]: any }, key: string) {
  return key.split('.').reduce((curObj, curKey) => curObj?.[curKey], obj);
}

function getCellText(column: ColumnDef, row: any): string {
  return column.computedValue
    ? column.computedValue(row)
    : column.type === 'date'
    ? dayjs(String(getElem(row, column.key))).format('DD-MMM-YYYY')
    : column.type === 'datetime'
    ? dayjs(String(getElem(row, column.key))).format('DD-MMM-YY HH:mm')
    : column.type === 'time'
    ? dayjs(String(getElem(row, column.key))).format('HH:mm')
    : getElem(row, column.key)?.toString();
}

// const rowsPerPage = 30;

function Table(props: {
  data: any[];
  columns: ColumnDef[];
  searchText: string;
  sortable?: boolean;
  pageable?: boolean;
  strictColumns?: boolean;
  scrollable?: boolean;
  highlightRow?: { keyName: string; value: any };
  highlightColor?: string;
  totalRows?: number;
  pageNo?: number;
  rowsPerPage?: number;
  fetchRowsCallback?: FetchRowsCallback;
  sortColumn?: string;
  isAscending?: boolean;
  uniqueData?: string;
  setTableCount: any;
}) {
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [data, setData] = useState(props?.data ?? []);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [isAscending, setIsAscending] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const onArrowClick = (columnKey: string, order: boolean) => {
    if (props.fetchRowsCallback) {
      props.fetchRowsCallback(
        props.pageNo ?? pageNo,
        props.rowsPerPage ?? rowsPerPage,
        columnKey,
        order,
        props.searchText
      );
    } else {
      setSortColumn(columnKey);
      setIsAscending(order);
    }
  };

  useEffect(() => {
    setPageNo(1);
  }, [rowsPerPage]);

  useEffect(() => {
    let newData = [...(props.data ?? [])];
    if (props.searchText !== '') {
      newData = newData.filter((row) => {
        return props?.columns?.some((column) => {
          return (
            getCellText(column, row)?.search(
              new RegExp(escapeRegExp(props.searchText), 'i')
            ) >= 0
          );
        });
      });
    }
    if (sortColumn !== null) {
      const columnDef = props.columns.find(
        (columnDef) => columnDef.key === sortColumn
      );
      const ascMult = isAscending ? 1 : -1;
      newData.sort((obj1: any, obj2: any) => {
        const elem1 =
          columnDef && columnDef.computedValue
            ? columnDef.computedValue(obj1)
            : getElem(obj1, sortColumn);
        const elem2 =
          columnDef && columnDef.computedValue
            ? columnDef.computedValue(obj2)
            : getElem(obj2, sortColumn);
        if (elem1 === elem2) return 0;
        return (elem1 < elem2 ? -1 : 1) * ascMult;
      });
    }
    setData(newData);
  }, [
    isAscending,
    Boolean(props.strictColumns) && props?.columns,
    props.data,
    props.searchText,
    sortColumn,
  ]);

  const setPageNoCallback = useCallback(
    (pageNo: number) => {
      if (props.fetchRowsCallback) {
        props.fetchRowsCallback(
          pageNo,
          props.rowsPerPage ?? rowsPerPage,
          props.sortColumn ?? sortColumn,
          props.isAscending ?? isAscending,
          props.searchText
        );
      } else {
        setPageNo(pageNo);
      }
    },
    [
      props.fetchRowsCallback,
      props.rowsPerPage ?? rowsPerPage,
      props.sortColumn ?? sortColumn,
      props.isAscending ?? isAscending,
      props.searchText,
    ]
  );

  const setRowsPerPageCallback = useCallback(
    (rowsPerPage: number) => {
      if (props.fetchRowsCallback) {
        props.fetchRowsCallback(
          1,
          rowsPerPage,
          props.sortColumn ?? sortColumn,
          props.isAscending ?? isAscending,
          props.searchText
        );
      } else {
        setRowsPerPage(rowsPerPage);
      }
    },
    [
      props.fetchRowsCallback,
      props.sortColumn ?? sortColumn,
      props.isAscending ?? isAscending,
      props.searchText,
    ]
  );

  const pagedData =
    props.pageable !== false && !props.totalRows
      ? data.slice((pageNo - 1) * rowsPerPage, pageNo * rowsPerPage)
      : data;
  const numPages = Math.ceil(
    (props.totalRows ?? data?.length) / (props.rowsPerPage ?? rowsPerPage)
  );

  if (props?.setTableCount) {
    props?.setTableCount(data?.length);
  }

  return (
    <>
      <div className={''}>
        <div className="inline-block w-full">
          <div
            className={
              props?.scrollable
                ? 'block max-h-[calc(100vh-200px)] overflow-auto'
                : 'block'
            }
          >
            <table className="min-w-full divide-y divide-gray-200 border-1 border-gray-100 rounded-sm">
              <thead className="ltr:text-left rtl:text-right   top-0">
                <tr className="px-3 ">
                  {props.columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-3 py-1 font-semibold border-b border-slate-200 dark:border-zink-500"
                    >
                      {/* <div className="flex flex-row items-center justify-center">
                  <SelectorIcon className="h-4"></SelectorIcon> */}
                      <div
                        className={
                          'flex items-center' +
                          (column.type === 'number'
                            ? ' justify-start'
                            : column.type === 'date'
                            ? ' min-w-6 justify start'
                            : ' ') +
                          (column.type === 'element' ? ' justify-center' : '')
                        }
                        style={{ minHeight: '2.5rem' }}
                      >
                        {props.sortable !== false &&
                          column.key &&
                          column.label && (
                            <div className="flex flex-col mr-1">
                              <button
                                onClick={() => onArrowClick(column.key, true)}
                              >
                                <TriangleUpIcon
                                  className={
                                    column.key ===
                                      (props.sortColumn ?? sortColumn) &&
                                    (props.isAscending ?? isAscending)
                                      ? 'w-2 h-2 text-black'
                                      : 'w-2 h-2 text-gray-300'
                                  }
                                />
                              </button>
                              <button
                                onClick={() => onArrowClick(column.key, false)}
                              >
                                <TriangleDownIcon
                                  className={
                                    column.key ===
                                      (props.sortColumn ?? sortColumn) &&
                                    !(props.isAscending ?? isAscending)
                                      ? 'w-2 h-2 mt-0.5 text-black'
                                      : 'w-2 h-2 mt-0.5 text-gray-300'
                                  }
                                />
                              </button>
                            </div>
                          )}

                        <span className="text-left">{column.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedData?.map((row, indexOfRow) => (
                  <tr
                    key={indexOfRow}
                    className={
                      'h-10 mx-2 text-sm odd:bg-white even:bg-slate-50 dark:odd:bg-zink-700 dark:even:bg-zink-600' +
                      (props?.highlightColor &&
                      getElem(row, props?.highlightRow?.keyName ?? '') ===
                        props?.highlightRow?.value
                        ? ` bg-${props?.highlightColor}`
                        : '')
                      // + (indexOfRow % 2 ? " bg-gray-100" : " bg-white")
                    }
                  >
                    {props?.columns.map((column, index, array) => (
                      <td
                        className={
                          'py-2 pl-3 border-y border-slate-200 dark:border-zink-500' +
                          (column.type === 'number'
                            ? ''
                            : // : column.type === "date"
                              //    ? "date-width":
                              '') +
                          (index === array.length - 1 ? ' px-2' : '')
                          // (column.type === "date" ? "w-20" : "")
                        }
                        key={index}
                      >
                        {column.render ? (
                          column.render(row)
                        ) : column.type === 'sr_no' ? (
                          indexOfRow +
                          1 *
                            ((props.pageNo ?? pageNo) - 1) *
                            (props.rowsPerPage ?? rowsPerPage) +
                          1
                        ) : column.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={Boolean(getElem(row, column.key))}
                            onChange={(event) =>
                              column.onChange && column.onChange(event, row)
                            }
                          />
                        ) : (
                          getCellText(column, row)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {props?.pageable !== false && data?.length !== 0 && (
        <div className="my-4 flex justify-center">
          <Pagination
            numPages={numPages}
            setPageNo={setPageNoCallback}
            pageNo={props.pageNo ?? pageNo}
            count={props.totalRows ?? data?.length}
            ROWS_PER_PAGE={props.rowsPerPage ?? rowsPerPage}
            setRowsPerPage={setRowsPerPageCallback}
          />
        </div>
      )}
      {data?.length === 0 ? (
        <div className="my-3 flex text-blue-700 justify-center">
          No records found
        </div>
      ) : null}
    </>
  );
}

export default Table;
