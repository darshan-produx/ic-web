import { useState, useEffect, useMemo, useRef } from 'react';
import { getAllOrganizationCustomersHierarchy, getAllCustomersOnSearch } from '../../../../api/customers/customers';
import { useQuery } from '@tanstack/react-query';
import MultiSelectDropDown from '../../../../../common/components/MultiSelectDropDown';
import SearchBox from '../../../../../common/components/SearchBox';
import SingleSelectDropDown from '../../../../../common/components/SingleSelectDropDown';
import { ChangeView } from './ChangeView';
import { ReactivateSvgIcon } from '../../../../assests/icons/icons';
import { getOrganizationUsers, getUserHierarchy } from '../../../../../app/api/users/users';
import { flattenTree, formatRevenue } from '../../../../../common/SupportFunctions';

export const OpportunityFilterBar = (props: any) => {
    // const [customerSearchText, setCustomerSearchText] = useState<string>('');
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [filteredAssignedTo, setFilteredAssignedTo] = useState<any[]>([]);
    const [filteredCreatedBy, setFilteredCreatedBy] = useState<any[]>([]);
    const [customerSearchText, setCustomerSearchText] = useState<string>('');
    const [searchTextAssignedTo, setSearchTextAssignedTo] = useState<string>('');
    const [searchTextCreatedBy, setSearchTextCreatedBy] = useState<string>('');
    // const [showExportOptions, setShowExportOptions] = useState<boolean>(false);

    const { data: organizationCustomersHierarchy } = useQuery({
        queryKey: ['organizationCustomersHierarchy'],
        queryFn: getAllOrganizationCustomersHierarchy,
        refetchOnWindowFocus: false,
    });

    const { data: organizationUsers } = useQuery({
        queryKey: ['organizationUsers'],
        queryFn: getOrganizationUsers,
        refetchOnWindowFocus: false,
    });

    const { data: userHierarchy } = useQuery({
        queryKey: ['userHierarchy'],
        queryFn: getUserHierarchy,
        refetchOnWindowFocus: false,
    });

    const usersList = useMemo(() => {
        if (organizationUsers?.data?.data && Array.isArray(organizationUsers.data.data) && organizationUsers.data.data.length > 0) {
            return organizationUsers.data.data;
        } else {
            return [];
        }
    }, [organizationUsers]);

    const usersTeamList = useMemo(() => {
        if (userHierarchy?.data) {
            return flattenTree([userHierarchy.data], 'children');
        } else {
            return [];
        }
    }, [userHierarchy, props?.userInfo?.id]);

    const allCustomersList = useMemo(() => {
        if (organizationCustomersHierarchy?.data) {
            return flattenTree(organizationCustomersHierarchy.data, 'associated_customers');
        } else {
            return [];
        }
    }, [organizationCustomersHierarchy?.data]);
    useEffect(() => {
        if (usersList?.length > 0 && usersTeamList?.length > 0 && props?.setCheckboxAssignedTo) {
            const userCheckboxItems = usersList.map((user: any) => {
                const isSelected = usersTeamList.some((teamUser: any) => teamUser._id === user._id);
                return {
                    ...user,
                    selected: isSelected,
                }
            });
            const notAssigned = {
                _id: 'notAssignedToUser',
                first_name: 'Not assigned',
                last_name: '',
                selected: true,
            }

            props.setCheckboxAssignedTo([notAssigned, ...userCheckboxItems]);
        }
    }, [usersList, usersTeamList, props?.setCheckboxAssignedTo, props?.dummyState]);

    useEffect(() => {
        if (usersList?.length > 0 && props?.setCheckboxCreatedBy) {
            const userCheckboxItems = usersList.map((user: any) => {
                return {
                    ...user,
                    selected: true,
                }
            });
            const aiAgent = {
                _id: 'aiagent',
                first_name: 'AI Agent',
                last_name: '',
                selected: true,
            }
            props.setCheckboxCreatedBy([aiAgent, ...userCheckboxItems]);
        }
    }, [usersList, props?.setCheckboxCreatedBy, props?.dummyState]);


    useEffect(() => {
        if (allCustomersList && props?.setCheckboxItemsCustomer) {
            const customerCheckboxItems = allCustomersList.map((customer: any) => ({
                customer_id: customer.customer_id,
                customer_name: customer.customer_name,
                is_prospect: Boolean(customer.is_prospect),
                selected: customer.is_my_team_customer || false,
            }));
            props.setCheckboxItemsCustomer(customerCheckboxItems);
        }
    }, [allCustomersList, props?.setCheckboxItemsCustomer, props?.dummyState]);

    useEffect(() => {
        if (props?.checkboxItemsCustomer) {
            if (customerSearchText === '') {
                setFilteredCustomers(props.checkboxItemsCustomer);
            } else {
                const filtered = props.checkboxItemsCustomer.filter((customer: any) =>
                    customer.customer_name.toLowerCase().includes(customerSearchText.toLowerCase())
                );
                setFilteredCustomers(filtered);
            }
        }
    }, [customerSearchText, props.checkboxItemsCustomer]);
    useEffect(() => {
        if (props?.checkboxAssignedTo) {  // Changed from checkboxItems
            if (searchTextAssignedTo === '') {
                setFilteredAssignedTo(props.checkboxAssignedTo);
            } else {
                const filtered = props.checkboxAssignedTo.filter((user: any) =>  // Changed from checkboxItems
                    user.first_name.toLowerCase().includes(searchTextAssignedTo.toLowerCase()) ||
                    user.last_name.toLowerCase().includes(searchTextAssignedTo.toLowerCase())
                );
                setFilteredAssignedTo(filtered);
            }
        }
    }, [searchTextAssignedTo, props.checkboxAssignedTo]);
    useEffect(() => {
        if (props?.checkboxCreatedBy) {
            if (searchTextCreatedBy === '') {
                setFilteredCreatedBy(props.checkboxCreatedBy);
            } else {
                const filtered = props.checkboxCreatedBy.filter((user: any) =>
                    user.first_name.toLowerCase().includes(searchTextCreatedBy.toLowerCase()) ||
                    user.last_name.toLowerCase().includes(searchTextCreatedBy.toLowerCase())
                );
                setFilteredCreatedBy(filtered);
            }
        }
    }, [searchTextCreatedBy, props.checkboxCreatedBy]);

    const formatValueString = (
        amount?: number,
        currency?: string,
        symbol?: string
    ): string => {
        if (amount == null) return "-";
        return `${symbol ? symbol : ''}${formatRevenue(amount, currency)}`;
    };

    const handleSortBySelection = (item: any) => {
        props.setSelectedSortBy((prev: any[]) =>
            prev.map((unit: any) =>
                unit.id === item.id
                    ? { ...unit, selected: true, sortOrder: unit.sortOrder === 'asc' ? 'desc' : 'asc' }
                    : { ...unit, selected: false }
            )
        );
    };
    return (
        <div className="max-w-[1200px] my-[20px] !shadow-none mx-auto group-data-[sidebar-size=md]:rtl:md:right-vertical-menu-md group-data-[sidebar-size=sm]:ltr:md:left-vertical-menu-sm  group-data-[sidebar-size=sm]:rtl:md:right-vertical-menu-sm group-data-[layout=horizontal]:ltr:left-0 group-data-[layout=horizontal]:rtl:right-0  print:hidden group-data-[navbar=bordered]:m-4 group-data-[navbar=bordered]:[&.is-sticky]:mt-0 transition-all ease-linear duration-300 group-data-[navbar=hidden]:hidden group-data-[navbar=scroll]:absolute group/topbar">
            <div className="layout-width">
                <div className="flex flex-col items-start justify-start w-full gap-5">
                    <div className="flex w-full !font-[500] items-center justify-between">
                        <div className="h-8 w-fit flex items-center justify-start gap-[10px] flex-shrink-0">
                            <ChangeView
                                view={props.view}
                                setView={props.setView}
                            />
                            {/* <div className='h-8'> */}
                            <MultiSelectDropDown
                                filteredItems={filteredCustomers}
                                dataFieldToUseForSelection="customer_name"
                                uniqueIdFieldToUseForSelection="customer_id"
                                checkboxItems={props?.checkboxItemsCustomer}
                                setCheckboxItems={props?.setCheckboxItemsCustomer}
                                typeOfData="Customers"
                                wantToShowSearchBox={true}
                                setSearchText={setCustomerSearchText}
                                searchText={customerSearchText}
                                triggerTextCss="h-[32px] text-nowrap"

                            />
                            {/* </div> */}
                            <MultiSelectDropDown
                                filteredItems={props?.buckets}
                                dataFieldToUseForSelection="bucket"
                                uniqueIdFieldToUseForSelection="id"
                                checkboxItems={props?.checkboxItemStatus}
                                setCheckboxItems={props?.setCheckboxItemStatus}
                                typeOfData="Status"
                                wantToShowSearchBox={false}
                                setSearchText={() => { }}
                                triggerTextCss="h-[32px] text-nowrap"
                            />
                            <MultiSelectDropDown
                                filteredItems={filteredAssignedTo}  // Use filtered list
                                dataFieldToUseForSelection="first_name"
                                extraDataFieldToUseForSelection="last_name"
                                uniqueIdFieldToUseForSelection="_id"
                                checkboxItems={props?.checkboxAssignedTo}  // Keep original list for state
                                setCheckboxItems={props?.setCheckboxAssignedTo}
                                typeOfData="Assigned to"
                                wantToShowSearchBox={true}
                                setSearchText={setSearchTextAssignedTo}
                                searchText={searchTextAssignedTo}
                                triggerTextCss="h-[32px]  text-nowrap"
                            />

                            <MultiSelectDropDown
                                filteredItems={filteredCreatedBy}  // Use filtered list
                                dataFieldToUseForSelection="first_name"
                                extraDataFieldToUseForSelection="last_name"
                                uniqueIdFieldToUseForSelection="_id"
                                checkboxItems={props?.checkboxCreatedBy}  // Keep original list for state
                                setCheckboxItems={props?.setCheckboxCreatedBy}
                                typeOfData="Created by"
                                wantToShowSearchBox={true}
                                setSearchText={setSearchTextCreatedBy}
                                searchText={searchTextCreatedBy}
                                triggerTextCss="h-[32px] text-nowrap"
                            />
                            <SingleSelectDropDown
                                filteredArr={props?.selectedSortBy}
                                dataFieldToUseForSelection="label"
                                uniqueIdFieldToUseForSelection="value"
                                handleSelection={handleSortBySelection}
                                typeOfData="Sort by"
                                needOfSortOrder={true}
                                disabled={(props?.view === 'grid')}
                            // triggerTextCss="h-[32px] text-nowrap"
                            />
                            <button
                                type="button"
                                onClick={() => props?.setAdvancedFilters(!props?.advancedFilters)}
                                className={`h-8 bg-white border-[1px]  ${!props?.advancedFilters ? ' border-[#CED2DA]' : 'border-gray-500'
                                    }    text-[#202B37]  px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
                            >
                                Filters
                            </button>
                            <button
                                type="button"
                                onClick={() => props?.setFiltersBackToDefault()}
                                className={`h-8 bg-white border-[1px] border-[#CED2DA] text-[#202B37] px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
                            >
                                <ReactivateSvgIcon
                                    className="w-4 h-4"
                                    stroke="#202B37"
                                />
                            </button>
                            {/* {props?.view === 'grid' && (<>
                                <button
                                    type="button"
                                    // ref={exportBtnRef}
                                    onClick={() => { setShowExportOptions(!showExportOptions) }}
                                    className={`relative h-8 bg-white border-[1px] border-[#CED2DA] text-[#202B37] px-2 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
                                >
                                    <UploadIcon className='w-5 h-4 text-[#202B37]' />
                                    {showExportOptions && (<div className='absolute w-[100px] top-8 left-[0px] flex items-start flex-col gap-1 p-2 bg-white border border-gray-300 rounded-[8px] text-[12px] text-gray-400'>
                                        <div className='hover:text-[#202B37]'>As an excel</div>
                                        <div className='hover:text-[#202B37]'>As a csv</div>
                                    </div>)}
                                </button>
                            </>)} */}
                        </div>
                        {/* Search box  */}
                        <div className='h-8 w-fit flex justify-end items-center gap-[10px]'>
                            <SearchBox
                                searchText={props?.searchText}
                                setSearchText={props?.setSearchText}
                                dataType="Search opportunity"
                                needBorder={true}
                            />
                            <button
                                type="button"
                                onClick={() => props.setCreateOpportunityModal(true)}
                                className={`h-8 w-fit bg-white border-[1px]  ${!props?.advancedFilters ? ' border-[#CED2DA]' : 'border-gray-500'
                                    }    text-[#202B37] text-nowrap px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
                            >
                                + Create new
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-7 flex items-center justify-start gap-12">
                        {/* {valueTitleComponent({ value: {}, title: 'Open deal amount' })} */}
                        {valueTitleComponent({
                            value: formatValueString(
                                props?.opportunitiesData?.open_deal_amount,
                                props?.opportunitiesData?.client_currency?.currency,
                                props?.opportunitiesData?.client_currency?.currency_symbol
                            ),
                            title: "Open deal amount",
                        })}
                        {valueTitleComponent({
                            value: formatValueString(
                                props?.opportunitiesData?.closed_deal_amount,
                                props?.opportunitiesData?.client_currency?.currency,
                                props?.opportunitiesData?.client_currency?.currency_symbol
                            ),
                            title: "Closed deal amount",
                        })}
                        {valueTitleComponent({ value: props?.opportunitiesData?.average_delay_days ?? 0, title: 'Avg deal days' })}
                        {valueTitleComponent({ value: props?.opportunitiesData?.total ?? 0, title: 'Total opportunities' })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const valueTitleComponent = ({ value, title }: { value: string; title: string }) => {
    return (
        <p className="h-7 w-fit">
            <span className="font-medium text-[#414E62] text-[20px]">{value}</span>
            &nbsp;
            <span className="text-[#97A1AF] text-[12px]">{title}</span>
        </p>
    )
}
