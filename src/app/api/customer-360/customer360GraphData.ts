import { apiRequest } from '../../../common/api-request';

interface IParams {
  customer_id: number;
  pillar: string;
  frequency?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  metric_id?: number | string;
  metric_ids?: Array<number | string>;
}

export const getGraphData = async (payload: IParams) => {
  const {
    customer_id,
    pillar,
    frequency,
    tags,
    start_date,
    end_date,
    metric_id,
    metric_ids,
  } = payload;

  const result = await apiRequest({
    url: ` /api/app-service/v1/customers/${customer_id}/l3_data`,
    method: 'GET',
    params: {
      pillar,
      frequency,
      tags,
      start_date,
      end_date,
      metric_id,
      metric_ids,
    },
  });

  return result;
};

export const getGraphTags = async (payload: {
  customer_id: number;
  kpi_id: number;
}) => {
  const { customer_id, kpi_id } = payload;

  const result = await apiRequest({
    url: ` /api/app-service/v1/customers/${customer_id}/tags/${kpi_id}`,
    method: 'GET',
  });

  return result;
};


export const updateAdoptionBusinessKPIParameters = async (
  id: string,
  data: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const updatePerformanceDefectsKPIParameters = async (
  id: string,
  data: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/${id}`,
    method: 'PATCH',
    data: data,
  });
};