'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllKPISettings } from '../../../api/globalconfig/globalconfig';
import { useEditKPISettings } from '../../../services/mutations/kpiSettingMutations';
import { toast } from 'react-toastify';

export default function KPISettings() {
  const [isTargetThresholdEditEnabled, setIsTargetThresholdEditEnabled] =
    useState(false);
  const [allowStatusInsightsToggle, setAllowStatusInsightsToggle] =
    useState(false);
  const EditKPISettings = useEditKPISettings();

  const { data: allGlobalKPISettings } = useQuery({
    queryKey: ['getAllKPISettings'],
    queryFn: getAllKPISettings,
    refetchOnWindowFocus: false,
  });
  const handleToggle = async (toggle: string) => {
    try {
      if (toggle === 'status_insight_toggle_enabled') {
        setAllowStatusInsightsToggle(!allowStatusInsightsToggle);
        const response = await EditKPISettings.mutateAsync({
          global_settings: {
            key: 'status_insight_toggle_enabled',
            value: !allowStatusInsightsToggle,
          },
        });
        if (response?.status === 200 || response?.status === 201) {
          toast.success('Status Insight toggle updated successfully');
        }
      }
      if (toggle === 'target_threshold_edit_enabled') {
        setIsTargetThresholdEditEnabled(!isTargetThresholdEditEnabled);
        const response = await EditKPISettings.mutateAsync({
          global_settings: {
            key: 'target_threshold_edit_enabled',
            value: !isTargetThresholdEditEnabled,
          },
        });
        if (response?.status === 200 || response?.status === 201) {
          toast.success('Target Threshold toggle updated successfully');
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (allGlobalKPISettings?.data) {
      allGlobalKPISettings?.data.forEach((setting: any) => {
        if (setting.key === 'target_threshold_edit_enabled') {
          setIsTargetThresholdEditEnabled(setting.value);
        }
        if (setting.key === 'status_insight_toggle_enabled') {
          setAllowStatusInsightsToggle(setting.value);
        }
      });
    }
  }, [allGlobalKPISettings]);
  return (
    <div className="w-full">
      <div className="w-full top-0 z-30 box bg-top px-10 2xl:px-16 bg-gray-100 shadow-md">
        <div className="grid grid-cols-2  pb-4 pt-4">
          <div>
            <h6 className="p-2 font-bold text-black text-[32px] text-left">
              KPI settings
            </h6>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-12 mx-4 mt-6">
        <div className="xl:col-span-12">
          <div className="card pb-6" id="usersTable">
            <div className="card-body">
              <div className="flex items-center">
                <h6 className="text-15 grow">
                  <div className="block">
                    <h6 className="font-semibold text-[20px] text-black">
                      Enable/Disable target & threshold, status & insights
                      toggle
                    </h6>
                  </div>
                </h6>
              </div>
            </div>

            <div className="card-body p-4 rounded-lg shadow-lg mt-6 mr-6 ml-6 bg-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold">
                  Allow user to change target/ threshold
                </label>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 align-middle items-center transition duration-200 ease-in ltr:mr-2 rtl:ml-2 mr-2">
                    <input
                      type="checkbox"
                      name="targetthresholdswitch"
                      id="targetthresholdswitch"
                      className="absolute block w-6 h-6 transition-transform duration-300 ease-linear rounded-xl appearance-none cursor-pointer "
                      defaultChecked
                      onChange={() =>
                        handleToggle('target_threshold_edit_enabled')
                      }
                      checked={isTargetThresholdEditEnabled}
                    />
                    <label
                      htmlFor="targetthresholdswitch"
                      className={`block h-6 overflow-hidden duration-300 ease-linear border rounded-full cursor-pointer border-slate-200 dark:border-zinc-500  ${
                        isTargetThresholdEditEnabled
                          ? 'bg-blue-500 hover:bg-blue-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transform transition-transform duration-300 ease-in-out ${
                          isTargetThresholdEditEnabled
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                  <label
                    htmlFor="targetthresholdswitch"
                    className="inline-block text-base font-semibold cursor-pointer"
                  >
                    {isTargetThresholdEditEnabled ? 'ON' : 'OFF'}
                  </label>
                </div>
              </div>
            </div>

            <div className="card-body p-4 rounded-lg shadow-lg mt-6 mr-6 ml-6 bg-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold">
                  Allow user to turn on/off status and insights
                </label>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 align-middle items-center transition duration-200 ease-in ltr:mr-2 rtl:ml-2 mr-2">
                    <input
                      type="checkbox"
                      name="statusinsightswitch"
                      id="statusinsightswitch"
                      className="absolute block w-6 h-6 transition-transform duration-300 ease-linear rounded-xl appearance-none cursor-pointer "
                      defaultChecked
                      onChange={() =>
                        handleToggle('status_insight_toggle_enabled')
                      }
                      checked={allowStatusInsightsToggle}
                    />
                    <label
                      htmlFor="statusinsightswitch"
                      className={`block h-6 overflow-hidden duration-300 ease-linear border rounded-full cursor-pointer border-slate-200 dark:border-zinc-500  ${
                        allowStatusInsightsToggle
                          ? 'bg-blue-500 hover:bg-blue-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transform transition-transform duration-300 ease-in-out ${
                          allowStatusInsightsToggle
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                  <label
                    htmlFor="statusinsightswitch"
                    className="inline-block text-base font-semibold cursor-pointer"
                  >
                    {allowStatusInsightsToggle ? 'ON' : 'OFF'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
