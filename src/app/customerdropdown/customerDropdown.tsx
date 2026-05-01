import { useQuery } from '@tanstack/react-query';
import { getAllCustomersOnSearch } from '../../app/api/customers/customers';
import {
  CustomerdropDownIcon,
  CustomerStarredFillIcon,
  SearchIconMyTeamSearchPage,
} from '../../app/assests/icons/icons';
import { Dropdown } from '../../common/Dropdown';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
const CustomerDropdown = ({
  disabled,
  data,
  selectedName,
  setFilterOption,
  setChatHistory,
}: {
  disabled?: boolean;
  data: any;
  selectedName: any;
  setFilterOption?: any;
  setChatHistory?: any;
}) => {
  const [searchText, setSearchText] = useState('');
  const [shouldQueryServer, setShouldQueryServer] = useState(false);
  const newData = addSequenceToTree(data);
  let filteredData: any = newData;
  const filtered = useMemo(() => {
    if (!searchText) return filteredData;
    return filteredData
      ?.map((ele: any) => {
        const match = ele.customer_name
          .toLowerCase()
          .includes(searchText.toLowerCase());
        const matchingAssociated = ele?.associated_customers?.filter(
          (associated: any) =>
            associated.customer_name
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
        if (match) {
          return ele;
        } else if (matchingAssociated?.length > 0) {
          return {
            ...ele,
            associated_customers: matchingAssociated,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [filteredData, searchText]);

  useEffect(() => {
    setShouldQueryServer(!!searchText && filtered?.length === 0);
  }, [searchText, filtered?.length]);

  const {
    data: serverResults,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['customerSearch', searchText],
    queryFn: () => getAllCustomersOnSearch(searchText),
    enabled: false,
    refetchOnWindowFocus: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldQueryServer) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        refetch();
      }, 500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [shouldQueryServer, searchText, refetch]);

  const deduplicatedServerData = useMemo(() => {
    const data = serverResults?.data;
    if (!data?.length) return [];
    const associatedIds = new Set<number>();
    for (const group of data) {
      if (group.is_group && Array.isArray(group.associated_customers)) {
        for (const assoc of group.associated_customers) {
          associatedIds.add(assoc.customer_id);
        }
      }
    }
    return data.filter(
      (item: any) => item.is_group || !associatedIds.has(item.customer_id)
    );
  }, [serverResults?.data]);

  const listToRender =
    filtered?.length > 0
      ? filtered
      : shouldQueryServer
      ? deduplicatedServerData
      : [];

  return (
    <div onFocus={() => setSearchText('')} className="relative">
      <Dropdown className="inline-flex !w-full z-100 !gap-[0px]">
        <Dropdown.Trigger
          type="button"
          className={`!mb-0 text-center w-full cursor-default ${
            disabled
              ? 'bg-[#F6F7FA] text-gray-800 !cursor-not-allowed'
              : 'bg-[#F6F7FA] text-[#344051]'
          } ${setFilterOption && setChatHistory ? '' : '!pt-2'}`}
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
        >
          <div
            className={`flex items-center gap-[10px] ${
              setFilterOption && setChatHistory
                ? 'bg-white  border-gray-200 border-[1px] rounded-[6px] py-[7px] px-3'
                : ''
            }`}
          >
            <div
              className={`max-w-[250px] overflow-hidden text-nowrap text-ellipsis text-[16px] cursor-pointer ${
                setFilterOption && setChatHistory
                  ? 'w-[208px] flex align-centre !text-gray-900'
                  : 'font-semibold !text-[#141C24]'
              }`}
              // onClick={(e) => e.stopPropagation()}
            >
              {selectedName}
            </div>
            <div className="text-[#3B82F6] text-[14px] cursor-pointer">
              <CustomerdropDownIcon />
            </div>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Content
          placement="bottom-end-customer"
          className={`absolute border border-gray-300 ${
            disabled ? 'opacity-0' : ''
          } z-50 rounded-lg pt-[6px] ltr:text-left rtl:text-right bg-white shadow-md dropdown-menu ${'w-[18.5rem]'}
         dark:bg-zink-600 `}
          aria-labelledby="dropdownMenuButton"
        >
          <div className="relative xl:col-span-2 mx-[6px] mb-[4px] mt-[2px]">
            <input
              type="text"
              className="px-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-[16px] placeholder:text-[#637083]  dark:placeholder:text-zink-200"
              placeholder="Search "
              autoComplete="off"
              autoFocus
              value={searchText}
              onChange={(e: any) => setSearchText(e?.target?.value)}
            />
            <div className="mx-2 inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600">
              <SearchIconMyTeamSearchPage />
            </div>
          </div>

          <div
            className={`pb-2 overflow-y-auto scroll min-h-[80px] ${
              setFilterOption && setChatHistory
                ? 'max-h-[200px]'
                : 'max-h-[400px]'
            }`}
          >
            <div className="flex flex-col ml-[6px] pr-[6px] ">
              {isFetching ? (
                <div className="text-center py-4 text-gray-500">Searching…</div>
              ) : Array.isArray(listToRender) && listToRender.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No matching results found.
                </div>
              ) : (
                Array.isArray(listToRender) &&
                listToRender.map((node: any, idx: any) => (
                  <div key={node.id ?? node._id ?? idx}>
                    <Node
                      key={node.id ?? node._id ?? idx}
                      node={node}
                      children={node.associated_customers ?? []}
                      index={idx}
                      sequence={node.sequence}
                      selectedName={selectedName}
                      setFilterOption={setFilterOption}
                      setChatHistory={setChatHistory}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};
export default CustomerDropdown;

const addSequenceToTree = (data: any, counter = { current: 1 }): any => {
  return data?.map((node: any) => {
    const newNode = { ...node, sequence: counter.current++ }; // Add sequence to the current node

    // If the node has children, recursively add sequences
    if (newNode.associated_customers?.length > 0) {
      newNode.associated_customers = addSequenceToTree(
        newNode.associated_customers,
        counter
      );
    }
    return newNode;
  });
};

interface NodeProps {
  node: any;
  sequence?: number;
  children?: any[];
  index?: number;
  setMyPortfolio?: any;
  myPortfolio?: any;
  isChild?: boolean;
  isLastChild?: boolean;
  selectedName: string;
  setFilterOption?: any;
  setChatHistory?: any;
}
const Node = ({
  node,
  sequence,
  children,
  index,
  setMyPortfolio,
  myPortfolio,
  isChild,
  isLastChild,
  selectedName,
  setFilterOption,
  setChatHistory,
}: NodeProps) => {
  const router = useRouter();
  return (
    <>
      <div
        className={`flex w-full border-[#CED2DA] rounded-bl `}
        h-full
        key={index}
      >
        {isChild && !isLastChild && (
          <div className="border-l ml-2 border-[#CED2DA]">
            <div className="border-b h-[20px] w-[6px] border-[#CED2DA] rounded-bl"></div>
          </div>
        )}
        {isChild && isLastChild && (
          <div className="ml-2">
            <div className="border-l border-b h-[20px] w-[6px] border-[#CED2DA] rounded-bl"></div>
          </div>
        )}

        <div className="w-full flex">
          <div
            className="  w-full text-nowrap text-[16px] text-[#344051] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!setFilterOption && !setChatHistory) {
                router.push(`/app/customers/${node?.customer_id}`);
              } else if (setFilterOption && setChatHistory) {
                setFilterOption({
                  value: node?.customer_id,
                  label: node?.customer_name,
                });
                if (selectedName != node?.customer_name) {
                  setChatHistory([]);
                }
              }
            }}
          >
            <div
              className={
                node?.customer_name === selectedName.split('(')[0].trim()
                  ? 'h-[36px] w-full bg-[#F0F6FF] text-[#3B82F6] rounded-lg flex items-center px-[8px] cursor-pointer close-dropdown'
                  : 'cursor-pointer close-dropdown pt-2 px-[8px] flex items-center text-ellipsis overflow-hidden whitespace-nowrap'
              }
              title={node?.customer_name}
            >
              <div className="flex justify-between items-center w-full gap-2 close-dropdown">
                <span className="truncate hover:text-[#3B82F6] text-ellipsis overflow-hidden whitespace-nowrap self-center close-dropdown">
                  {node?.customer_name}{' '}
                  {node?.user_names?.length
                    ? node.user_names.length > 1
                      ? ` (${node.user_names[0].split(' ')[0]} +${
                          node.user_names.length - 1
                        } more)`
                      : `(${node.user_names[0]})`
                    : ''}
                </span>
                {node?.is_starred && (
                  <CustomerStarredFillIcon className="w-5 h-5 text-[#3B82F6] flex-shrink-0 close-dropdown" />
                )}
              </div>
            </div>
            {children &&
              children?.map((child: any, index: any) => (
                <Node
                  key={index}
                  node={child}
                  children={child.associated_customers ?? []}
                  index={index}
                  isChild={true}
                  sequence={child.sequence}
                  isLastChild={index === children.length - 1}
                  setMyPortfolio={setMyPortfolio}
                  myPortfolio={myPortfolio}
                  selectedName={selectedName}
                  setFilterOption={setFilterOption}
                  setChatHistory={setChatHistory}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
