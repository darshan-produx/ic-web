'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllEmailSettings } from '../../../api/globalconfig/globalconfig';
import { useEditEmailSettings } from '../../../services/mutations/emailSettingMutations';
import { toast } from 'react-toastify';

export default function Emailsettings() {
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState<number | string>(5);
  const [editSyncInterval, setEditSyncInterval] = useState(false);
  const EditEmailSettings = useEditEmailSettings();
  const [initialSyncInterval, setInitialSyncInterval] = useState<
    number | string
  >(5);
  const { data: allGlobalEmailSettings } = useQuery({
    queryKey: ['getAllEmailSettings'],
    queryFn: getAllEmailSettings,
    refetchOnWindowFocus: false,
  });
  const handleToggle = () => {
    setAiAssistEnabled(!aiAssistEnabled);
    EditEmailSettings.mutate({
      global_settings: { key: 'ai_assist_enabled', value: !aiAssistEnabled },
    });
  };

  const handleSyncIntervalChange = (event: any) => {
    const value = event.target.value;
    if (value === '') {
      setSyncInterval('');
    } else if (parseInt(value) >= 1) {
      setSyncInterval(Math.floor(value));
    }
  };

  const handleSaveSyncInterval = async () => {
    setEditSyncInterval(!editSyncInterval);
    if (editSyncInterval) {
      try {
        if (syncInterval === '') {
          toast.error('Sync Interval cannot be empty.');
          setSyncInterval(initialSyncInterval);
          return;
        }
        const res = await EditEmailSettings.mutateAsync({
          global_settings: {
            key: 'sync_interval',
            value: Number(syncInterval),
          },
        });
        if (res?.status == 200 || res?.status == 201) {
          toast.success('Sync Interval updated successfully.');
        }
      } catch (err: any) {
        toast.error(err.response.data.message);
      }
    }
  };
  useEffect(() => {
    if (allGlobalEmailSettings?.data) {
      allGlobalEmailSettings?.data.forEach((setting: any) => {
        if (setting.key === 'ai_assist_enabled') {
          setAiAssistEnabled(setting.value);
        }
        if (setting.key === 'sync_interval') {
          setSyncInterval(setting.value);
          setInitialSyncInterval(setting.value);
        }
      });
    }
  }, [allGlobalEmailSettings]);
  return (
    <div className="w-full">
      <div className="w-full top-0 z-30 box bg-top px-10 2xl:px-16 bg-gray-100 shadow-md">
        <div className="grid grid-cols-2 pb-4 pt-4">
          <div>
            <h6 className="p-2 font-bold text-black text-[32px] text-left">
              Email settings
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
                      Enable/Disable AI assist, Change sync interval
                    </h6>
                  </div>
                </h6>
              </div>
            </div>

            <div className="card-body p-4 rounded-lg shadow-lg mt-6 mr-6 ml-6 bg-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold">AI Assist</label>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 align-middle items-center transition duration-200 ease-in ltr:mr-2 rtl:ml-2 mr-2">
                    <input
                      type="checkbox"
                      name="customDefaultSwitch"
                      id="customDefaultSwitch"
                      className="absolute block w-6 h-6 transition-transform duration-300 ease-linear rounded-xl appearance-none cursor-pointer "
                      defaultChecked
                      onChange={handleToggle}
                      checked={aiAssistEnabled}
                    />
                    <label
                      htmlFor="customDefaultSwitch"
                      className={`block h-6 overflow-hidden duration-300 ease-linear border rounded-full cursor-pointer border-slate-200 dark:border-zinc-500  ${
                        aiAssistEnabled
                          ? 'bg-blue-500 hover:bg-blue-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transform transition-transform duration-300 ease-in-out ${
                          aiAssistEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                  <label
                    htmlFor="customDefaultSwitch"
                    className="inline-block text-base font-semibold cursor-pointer"
                  >
                    {aiAssistEnabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              </div>
            </div>
            <div className="card-body p-4 rounded-lg shadow-lg mt-6 mr-6 ml-6 bg-gray-100">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="inputPlaceholder"
                  className="inline-block mb-2 text-lg font-semibold"
                >
                  Sync Interval (minutes)
                </label>
                <div className="flex justify-around items-center">
                  <input
                    type="number"
                    id="inputPlaceholder"
                    className="form-input w-20 border-slate-200 dark:border-zink-500 focus:outline-1 focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200  ml-4"
                    placeholder="mm"
                    min="1"
                    step="1"
                    value={syncInterval || ''}
                    onChange={handleSyncIntervalChange}
                    disabled={!editSyncInterval}
                  />
                  <button
                    type="button"
                    className="text-custom-500 btn bg-custom-100 hover:text-white hover:bg-custom-600 focus:text-white focus:bg-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:ring active:ring-custom-100 dark:bg-custom-500/20 dark:text-custom-500 dark:hover:bg-custom-500 dark:hover:text-white dark:focus:bg-custom-500 dark:focus:text-white dark:active:bg-custom-500 dark:active:text-white dark:ring-custom-400/20 ml-1"
                    onClick={handleSaveSyncInterval}
                  >
                    {editSyncInterval ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
