import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

const Pagination = (props: {
  setPageNo: any;
  pageNo: any;
  numPages: any;
  count: number;
  ROWS_PER_PAGE: number;
  setRowsPerPage: any;
}) => {
  const totalPageLimit = 10;
  const handleChange = (e: any) => {
    props.setRowsPerPage(Number(e.target.value));
  };
  const pageNumbers = (total: any, max: any, current: any) => {
    const half = Math.round(max / 2);
    let to = max;
    if (current + half >= total) {
      to = total;
    } else if (current > half) {
      to = current + half;
    }
    let from = to - max;
    return Array.from({ length: max }, (_, i) => i + 1 + from);
  };
  return (
    <div className="flex w-full hide-pdfbutton">
      <div className="w-[30%]"></div>
      <div className="flex justify-center my-2 mr-1 w-full item-center">
        <div className="text-xs text-gray-400 flex flex-row mr-3">
          <div className="py-3 px-2 text-sm">Shows:</div>
          <input
            type="text"
            disabled
            value={
              props?.count < props?.ROWS_PER_PAGE
                ? props?.count
                : props?.ROWS_PER_PAGE
            }
            className="w-10 h-10 rounded-md border border-gray-200 text-center"
          />
          <div className="py-3 px-2 pr-14 text-sm">rows</div>
        </div>
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <div
            onClick={() =>
              props?.pageNo > 10 && props?.setPageNo(props?.pageNo - 10)
            }
            className="relative inline-flex items-center px-2 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
            title="Go back 10 pages"
          >
            <span className="sr-only">Previous 10 back </span>
            <ChevronsLeft className="h-5" />
          </div>
          <div
            onClick={() =>
              props?.pageNo > 1 && props?.setPageNo(props?.pageNo - 1)
            }
            className="bg-white text-gray-500 relative inline-flex items-center px-4 py-2 text-sm font-medium cursor-pointer"
            title="Go to previous page"
          >
            <span className="sr-only">Previous</span>

            <ChevronLeftIcon className="h-5" />
          </div>
          {props?.numPages >= 10 ? (
            <>
              {pageNumbers(props?.numPages, totalPageLimit, props?.pageNo).map(
                (elem, index) => (
                  <div
                    aria-current="page"
                    key={index}
                    className={
                      props?.pageNo === elem
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer'
                    }
                    onClick={() => props?.setPageNo(elem)}
                  >
                    {elem}
                  </div>
                )
              )}
            </>
          ) : (
            <>
              {[...Array(props?.numPages)].map((elem, index) => (
                <div
                  aria-current="page"
                  key={index}
                  className={
                    props?.pageNo === index + 1
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer'
                  }
                  onClick={() => props?.setPageNo(index + 1)}
                >
                  {index + 1}
                </div>
              ))}
            </>
          )}

          <div className="text-gray-500 ml-2 flex w-40 items-center justify-center ">
            <span className="ml-2">Page</span>
            <span className="z-10  relative inline-flex items-center px-4 py-2  cursor-pointer mx-2">
              {props.pageNo}
            </span>
            <span className="mr-2">of</span>
            <span className="mr-2">{Math.ceil(props.numPages)}</span>
          </div>
          <div
            onClick={() =>
              props?.pageNo < Number(props?.numPages) &&
              props?.setPageNo(props?.pageNo + 1)
            }
            className="bg-white text-gray-500 relative inline-flex items-center px-4 py-2 text-sm font-medium cursor-pointer"
            title="Go to next page"
          >
            <span className="sr-only">Next</span>

            <ChevronRightIcon className="h-5" />
          </div>
          <div
            onClick={() =>
              props?.numPages >= props?.pageNo + 10 &&
              props?.pageNo < Number(props?.numPages) &&
              props?.setPageNo(props?.pageNo + 10)
            }
            className="relative inline-flex items-center px-2 py-2 bg-white text-sm font-medium text-gray-500 cursor-pointer"
            title="Go forward 10 pages"
          >
            <span className="sr-only">Next 10 record</span>

            <ChevronsRight className="h-5" />
          </div>
        </nav>
        <div className="flex items-center">
          <select
            name=""
            id=""
            value={props.ROWS_PER_PAGE}
            onChange={(e) => handleChange(e)}
            className="border p-2 rounded border-gray-200 placeholder-gray-400 text-sm focus:outline-none focus:border-gray-300 focus:ring-1 mx-2"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end text-blue-500 w-[30%] min-w-[130px]">
        <span>View </span>&nbsp;
        <span>
          {props.pageNo * props.ROWS_PER_PAGE - props.ROWS_PER_PAGE + 1} -{' '}
          {props.ROWS_PER_PAGE * props.pageNo > props.count
            ? props.count
            : props.ROWS_PER_PAGE * props.pageNo}{' '}
          {'of'} {props.count}
        </span>
      </div>
    </div>
  );
};

export default Pagination;
