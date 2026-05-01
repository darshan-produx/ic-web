'use client';
import React, { useEffect, useMemo, useState } from 'react';
import NPSChart from '../components/NPSChart';
import NPSModal from './NPSModal';
import { useQuery } from '@tanstack/react-query';
import { getNpsMetric } from '../../../api/config/nps_metric';
import { Tooltip } from '@material-tailwind/react';
import { EllipsisVertical } from 'lucide-react';

interface PillarStatus {
  _id: string;
  pillar: string;
  status: string;
  customer_id: number;
  org_id: string;
}

interface ConfigValues {
  enabled: boolean;
  display_name: string;
  order: number;
}

type Props = {
  scrollToSection: (id: string) => void;
  NPSScore: number | null;
  pillarStatuses?: PillarStatus[];
  lastestNpsScoreTrend?: any;
  config?: Record<string, ConfigValues>;
  isGroup_customer?: boolean;
  setActiveTab?: (tab: string) => void;
  activeTab?: string;
  setOverAllStatus?: (status: string) => void;
} & any;

const statusToHex = (status?: string | null) => {
  // if(is_active === false) {
  //   return '#9CA3AF';
  // }
  switch (status) {
    case 'green':
      return '#249782';
    case 'yellow':
      return '#EAB308';
    case 'red':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
};

export const PillarStatusBar: React.FC<Props> = ({
  scrollToSection,
  NPSScore,
  pillarStatuses,
  lastestNpsScoreTrend,
  config,
  isGroup_customer,
  setActiveTab,
  activeTab,
  setOverAllStatus,
  setModal,
  modal,
  is_active,
}) => {
  const { data: existingNpsMetrics } = useQuery({
    queryKey: ['nps-metrics'],
    queryFn: getNpsMetric,
    refetchOnWindowFocus: false,
  });

  const target = existingNpsMetrics?.data?.data?.[0]?.nps_target ?? 0;
  const threshold = existingNpsMetrics?.data?.data?.[0]?.nps_threshold ?? 0;

  const [openNpsChart, setOpenNpsChart] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const colors = useMemo(() => {
    const base: Record<string, string | null> = {
      Adoption: null,
      Impact: null,
      Performance: null,
      CustomerService: null,
      Stakeholder: null,
      Projects: null,
      NPS: null,
    };
    if (!Array.isArray(pillarStatuses)) return base;
    return pillarStatuses.reduce((acc, pillarStatus) => {
      switch (pillarStatus.pillar) {
        case 'Adoption':
          acc.Adoption = pillarStatus.status;
          break;
        case 'Business':
          acc.Impact = pillarStatus.status;
          break;
        case 'Performance':
          acc.Performance = pillarStatus.status;
          break;
        case 'CustomerService':
          acc.CustomerService = pillarStatus.status;
          break;
        case 'Projects':
          acc.Projects = pillarStatus.status;
          break;
        case 'Stakeholder':
          acc.Stakeholder = pillarStatus.status;
          break;
        case 'NPS':
          acc.NPS = pillarStatus.status;
          break;
      }
      return acc;
    }, base);
  }, [pillarStatuses]);

  const values = Object.values(colors).filter(Boolean) as string[];

  if (values.includes('red')) {
    setOverAllStatus('red');
  } else if (values.includes('yellow') && !values.includes('red')) {
    setOverAllStatus('yellow');
  } else if (
    values.includes('green') &&
    !values.includes('red') &&
    !values.includes('yellow')
  ) {
    setOverAllStatus('green');
  } else {
    setOverAllStatus('gray');
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== 'undefined' && window?.location?.href) {
        const url = new URL(window.location.href);
        const urlSelectedId = url.searchParams.get('selected');
        if (urlSelectedId) {
          url.searchParams.delete('selected');
          scrollToSection(urlSelectedId);
          window.history.replaceState({}, '', url.toString());
        }
      }
    }, 1000);

    setIsDisabled(Boolean(isGroup_customer));

    return () => clearTimeout(t);
  }, [scrollToSection, isGroup_customer]);

  function getNPSBg(
    npsScore: number | null,
    targetVal: number,
    thresholdVal: number,
    groupCustomer: boolean,
    pillarStatusesForNps?: PillarStatus[]
  ) {
    const groupStatus = pillarStatusesForNps?.[0]?.status;
    if (groupCustomer) {
      if (groupStatus === 'green') return '#D9F2E5';
      if (groupStatus === 'red') return '#FCCFCF';
    } else {
      if (npsScore != null) {
        if (npsScore >= targetVal) return '#D9F2E5';
        if (npsScore <= thresholdVal) return '#FCCFCF';
      }
    }
    return '#FFEECC';
  }

  const pillList =
    Object.entries(config as Record<string, ConfigValues>)
      .filter(
        ([configKey, cfgItem]) =>
          configKey !== 'PurchasesAndRenewals' &&
          configKey !== 'OpenIssues' && cfgItem && cfgItem.enabled
      )
      .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
      .map(([configKey, cfgItem]) => {
        const key = configKey;
        const label = cfgItem.display_name || configKey;
        const statusKey = configKey;
        const status = colors[statusKey] ?? null;
        return {
          key,
          label,
          configKey,
          status,
        };
      }) || [];
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[1200px] w-full">
        <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar py-1">
          {pillList.map((p) => {
            if (!p.key) return null;
            const onClick = (e: React.MouseEvent) => {
              if (!is_active) return;
              if (isDisabled && p.key !== 'Projects' && p.key !== 'Stakeholder')
                return;
              e.stopPropagation();
              if (activeTab !== 'view') {
                setActiveTab?.('view');
                setTimeout(() => scrollToSection(`${p.key}Ref`), 100);
              } else {
                scrollToSection(`${p.key}Ref`);
              }
            };
            if (p.key === 'NPS') {
              const npsDisabled =
                lastestNpsScoreTrend?.data?.length === 0 || NPSScore == null;

              return (
                <button
                  key={p.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!is_active) return;
                    if (npsDisabled) return;
                    setOpenNpsChart(true);
                  }}
                  disabled={npsDisabled}
                  aria-label="Open NPS chart"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-3xl border border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    is_active
                      ? {
                        backgroundColor: getNPSBg(
                          NPSScore,
                          target,
                          threshold,
                          Boolean(isGroup_customer),
                          pillarStatuses?.filter(
                            (ps: PillarStatus) => ps?.pillar === 'NPS'
                          )
                        ),
                      }
                      : { backgroundColor: '#9CA3AF' }
                  }
                >
                  <div className="flex leading-none text-left gap-1.5 items-center">
                    <span
                      className={`max-w-[30px] truncate text-[14px] font-normal ${is_active ? 'text-[#202B37]' : 'text-white'
                        } leading-5`}
                      title={p.label}
                    >
                      {p.label}
                    </span>
                    <span
                      className={`text-[14px] font-normal ${is_active ? 'text-[#202B37]' : 'text-white'
                        } leading-5`}
                    >
                      {NPSScore != null ? NPSScore : '-'}
                    </span>
                  </div>
                </button>
              );
            }
            const dotColor = is_active
              ? p.status
                ? statusToHex(p.status)
                : '#9CA3AF'
              : '#9CA3AF';

            return (
              <div key={p.key} className="">
                <div
                  onClick={onClick}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[20px] border border-[#E4E7EC] select-none ${isDisabled &&
                      p.key !== 'Projects' &&
                      p.key !== 'Stakeholder'
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                    }`}
                  style={{
                    opacity:
                      isDisabled &&
                        p.key !== 'Projects' &&
                        p.key !== 'Stakeholder'
                        ? 0.6
                        : 1,
                  }}
                >
                  {p.status ? (
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                  ) : (
                    <Tooltip
                      content={
                        <span className="text-sm text-[#141C24">{`${p.label} details are not available`}</span>
                      }
                      placement="top"
                      arrow={true}
                      className="bg-white shadow-lg text-[#141C24] text-[12px] rounded-md"
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    </Tooltip>
                  )}

                  <span
                    className="text-[14px] font-normal text-[#141C24] leading-5 max-w-32 truncate"
                    title={p.label}
                  >
                    {p.label}
                  </span>
                </div>
              </div>
            );
          })}

          <div
            className="w-[32px] h-[32px] gap-2 border items-center justify-center border-[#E4E7EC] rounded-[20px] cursor-pointer transition duration-200 ease-in-out"
            onClick={() => {
              if (!is_active) return;
              setModal(!modal);
            }}
          >
            <span className="flex items-center justify-center align-middle py-[5px]">
              <EllipsisVertical className="w-[20px] h-[20px]" />
            </span>
          </div>
        </div>

        {openNpsChart && (
          <div className="hide-scrollbar rounded-xl">
            <NPSModal
              Content={
                <NPSChart data={lastestNpsScoreTrend} chartId="chartLine" />
              }
              size="w-4/5 h-4/5 2xl:w-2/5 xl:w-2/5"
              backBg="card !rounded-[12px]"
              setModelOpen={setOpenNpsChart}
              noScroll={true}
              title="NPS"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PillarStatusBar;
