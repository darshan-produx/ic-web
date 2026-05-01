import { useQuery } from '@tanstack/react-query';
import { getGraphData } from '../../app/api/customer-360/customer360GraphData';

export const useGraphDataQuery = (
  id: number,
  pillar: string,
  frequency: string,
  startDate: string,
  endDate: string,
  tags: string[],
  enabled: boolean = true,
  metric_id?: number | string,
  metric_ids?: Array<number | string>,
  initialData?: any
) => {
  const tagsKey = Array.isArray(tags)
    ? [...tags].sort().join('|')
    : '';
  const metricIdsKey = Array.isArray(metric_ids)
    ? metric_ids.map((m) => m.toString()).sort().join('|')
    : metric_ids;
  return useQuery({
    queryKey: [
      `customer360-${frequency}-${pillar}-graph-data`,
      { frequency, startDate, endDate, tags: tagsKey, id, metric_id, metric_ids: metricIdsKey },
    ],
    queryFn: () =>
      getGraphData({
        customer_id: id,
        pillar,
        frequency,
        start_date: startDate,
        end_date: endDate,
        tags,
        metric_id,
        metric_ids,
      }),
    staleTime: 5 * 60 * 1000, // keep fresh for 5 minutes
    // gcTime: 30 * 60 * 1000, // garbage collect after 30 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialData,
    enabled,
    // placeholderData: (previousData) => previousData,
  });
};
