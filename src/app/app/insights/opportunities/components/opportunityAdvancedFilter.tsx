import React, { useState, useEffect, use } from 'react';
import SideDrawer from '../../../../../common/components/SideDrawer';
import RangeSlider from '../../../../../common/components/RangeSlider';
import MultiSelectFilter from '../../../../../common/components/MultiSelectFilter';
import DateRangeFilter from './DateRangeFilter';

interface OpportunityAdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  valueFrom?: number;
  valueTo?: number;
  createdDateFrom?: Date | null;
  createdDateTo?: Date | null;
  targetClosureDateFrom?: Date | null;
  targetClosureDateTo?: Date | null;
  opportunityAttributeConfig?: any;
  attributeFilterArr: any[];
  onFiltersChange?: () => void;
  onUpdate?: (filters: any) => void;
  opportunitiesData?: any;
  currencySymbol?: string;
  currency?: string;
}

const OpportunityAdvancedFilter: React.FC<OpportunityAdvancedFilterProps> = ({
  isOpen,
  onClose,
  valueFrom,
  valueTo,
  createdDateFrom,
  createdDateTo,
  targetClosureDateFrom,
  targetClosureDateTo,
  opportunityAttributeConfig,
  attributeFilterArr,
  onUpdate,
  opportunitiesData,
}) => {
  const [isAnyAttributeChanged, setIsAnyAttributeChanged] = useState(false);
  const [valueFromLocal, setValueFromLocal] = useState<number | undefined>();
  const [valueToLocal, setValueToLocal] = useState<number | undefined>();
  // const [generatedByLocal, setGeneratedByLocal] = useState<any[] | undefined>();
  const [createdDateFromLocal, setCreatedDateFromLocal] = useState<Date | null | undefined>();
  const [createdDateToLocal, setCreatedDateToLocal] = useState<Date | null | undefined>();
  const [targetClosureDateFromLocal, setTargetClosureDateFromLocal] = useState<Date | null | undefined>();
  const [targetClosureDateToLocal, setTargetClosureDateToLocal] = useState<Date | null | undefined>();
  const [attributeFilterArrLocal, setAttributeFilterArrLocal] = useState<any[]>([]);

  useEffect(() => {
    setAttributeFilterArrLocal([...attributeFilterArr]);
  }, [attributeFilterArr]);
  useEffect(() => {
    setValueFromLocal(valueFrom);
  }, [valueFrom]);
  useEffect(() => {
    setValueToLocal(valueTo);
  }, [valueTo]);
  useEffect(() => {
    setCreatedDateFromLocal(createdDateFrom);
  }, [createdDateFrom]);
  useEffect(() => {
    setCreatedDateToLocal(createdDateTo);
  }, [createdDateTo]);
  useEffect(() => {
    setTargetClosureDateFromLocal(targetClosureDateFrom);
  }, [targetClosureDateFrom]);
  useEffect(() => {
    setTargetClosureDateToLocal(targetClosureDateTo);
  }, [targetClosureDateTo]);

  const handleOpportunityValueChange = (values: { minValue: number; maxValue: number; }) => {
    setValueFromLocal(values.minValue);
    setValueToLocal(values.maxValue);
    setIsAnyAttributeChanged(true);
  }
  const handleUpdate = () => {
    if (!isAnyAttributeChanged) return;
    setIsAnyAttributeChanged(false);
    onUpdate?.({
      valueFrom: valueFromLocal,
      valueTo: valueToLocal,
      createdDateFrom: createdDateFromLocal,
      createdDateTo: createdDateToLocal,
      targetClosureDateFrom: targetClosureDateFromLocal,
      targetClosureDateTo: targetClosureDateToLocal,
      attributeFilterArr: attributeFilterArrLocal
    });
    onClose();
  };
  const handleAttributeChange = (selectedItems: any[], id?: string | number, data_type?: string) => {
    let updatedAttributes: any[] = [];
    if (data_type && data_type === 'boolean') {
      const include_missing = selectedItems.some(item => item.value === 'notselected' && item.selected);
      updatedAttributes = [{ attribute_id: id, data_type, attribute_boolean_arr: selectedItems, include_missing: include_missing }];
    } else if (data_type && data_type === 'list') {
      const include_missing = selectedItems.some(item => item.value === 'notselected' && item.selected);
      updatedAttributes = [{ attribute_id: id, data_type, attributes_lists: selectedItems, include_missing: include_missing }];
    } else if (data_type && data_type === 'float') {
      updatedAttributes = [{ attribute_id: id, data_type, attribute_value_from: selectedItems[0]?.minValue ?? null, attribute_value_to: selectedItems[0]?.maxValue ?? null, include_missing: true }];
    } else {
      updatedAttributes = [{ attribute_id: id, data_type, attribute_value: null }];
    }
    const dummArr = attributeFilterArrLocal?.filter((item: any) => item?.attribute_id !== id);
    setAttributeFilterArrLocal([...dummArr, ...updatedAttributes]);
    setIsAnyAttributeChanged(true);
  }
  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      width="w-[520px]"
    >
      {/* <FilterExample /> */}
      <div>
        <div className="pl-5 pr-7 pt-6 space-y-[30px] h-[calc(100vh-130px)] overflow-y-auto scroll box-border overflow-x-hidden">
          {/* Value Range Section */}
          <div>
            <div className="mb-4">
              <RangeSlider
                title="Value"
                fixStart={opportunitiesData?.opportunityValueRange?.min ?? 0}
                fixEnd={opportunitiesData?.opportunityValueRange?.max ?? 100}
                mobileStart={valueFromLocal}
                mobileEnd={valueToLocal}
                step={0}
                currencySymbol={opportunitiesData?.client_currency?.currencySymbol ?? '$'}
                currency={opportunitiesData?.client_currency?.currency ?? 'USD'}
                onChange={handleOpportunityValueChange}
              />
            </div>
          </div>
          <div className='border-b border-[#E4E7EC]'></div>
          <DateRangeFilter
            title={'Created Date'}
            startDate={createdDateFromLocal}
            setStartDate={setCreatedDateFromLocal ?? (() => { })}
            endDate={createdDateToLocal}
            setEndDate={setCreatedDateToLocal ?? (() => { })}
            isDataChanged={setIsAnyAttributeChanged}
          />
          <div className='border-b border-[#E4E7EC]'></div>

          <DateRangeFilter
            title={'Target Date'}
            startDate={targetClosureDateFromLocal}
            setStartDate={setTargetClosureDateFromLocal ?? (() => { })}
            endDate={targetClosureDateToLocal}
            setEndDate={setTargetClosureDateToLocal ?? (() => { })}
            isDataChanged={setIsAnyAttributeChanged}
          />
          <div className='border-b border-[#E4E7EC]'></div>
          {opportunityAttributeConfig && opportunityAttributeConfig.length > 0 && opportunityAttributeConfig.map((attribute: any) => (<React.Fragment key={attribute._id}>{attribute?.data_type === 'boolean'
            ? (<><MultiSelectFilter
              title={attribute?.name}
              attributeId={attribute._id}
              key={attribute._id}
              state={attributeFilterArrLocal?.find((item: any) => item?.attribute_id === attribute._id)?.attribute_boolean_arr ?? []}
              maxVisibleItems={3}
              onSelectionChange={(value) => handleAttributeChange(value, attribute._id, attribute?.data_type)}
              className="h-fit"
            />
              <div className='border-b border-[#E4E7EC]'></div>
            </>
            )
            : attribute?.data_type === 'list'
              ? (<><MultiSelectFilter
                title={attribute?.name}
                attributeId={attribute._id}
                key={attribute._id}
                state={attributeFilterArrLocal?.find((item: any) => item?.attribute_id === attribute._id)?.attributes_lists ?? []}
                maxVisibleItems={7}
                onSelectionChange={(value) => handleAttributeChange(value, attribute._id, attribute?.data_type)}
                className="h-fit"
              />
                <div className='border-b border-[#E4E7EC]'></div>
              </>
              )
              : attribute?.data_type === 'float'
                ? (
                  <>
                    <RangeSlider
                      key={attribute._id}
                      title={attribute?.name}
                      fixStart={attribute?.min_value ?? 0}
                      fixEnd={attribute?.max_value ?? 100}
                      mobileStart={attributeFilterArrLocal?.find((item: any) => item?.attribute_id === attribute._id)?.attribute_value_from ?? attribute?.attribute_value_from ?? 0}
                      mobileEnd={attributeFilterArrLocal?.find((item: any) => item?.attribute_id === attribute._id)?.attribute_value_to ?? attribute?.attribute_value_to ?? 100}
                      step={attribute?.step_value ?? 1}
                      onChange={(value) => handleAttributeChange([value], attribute._id, attribute?.data_type)}
                    />
                    <div className='border-b border-[#E4E7EC]'></div>
                  </>
                ) : null}</React.Fragment>
          ))}
        </div>
        {/* Update Button */}
        <div className="h-18 bottom-0 left-0 w-full py-4 px-4 border-t border-gray-200 flex justify-end box-border bg-white rounded-b-[12px]">
          <button
            onClick={handleUpdate}
            className={`${isAnyAttributeChanged ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#CCE0FF] cursor-not-allowed'} w-fit text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0`}
          >
            Apply
          </button>
        </div>
      </div>

    </SideDrawer>
  );
};

export default OpportunityAdvancedFilter;

