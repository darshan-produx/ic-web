import { apiRequest } from '../../../common/api-request';

export const getRecipeInsightSegment = async () => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/insight-recipe-segment-maps`,
    method: 'GET',
  });

  return result;
};

export const getRecipeInsightSegmentById = async (id: string) => {
  return await apiRequest({
    url: ` /api/app-service/v1/insight-recipe-segment-maps/${id}`,
    method: 'GET',
  });
};

export const addRecipeInsightSegment = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/insight-recipe-segment-maps`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const editRecipeInsightSegment = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/insight-recipe-segment-maps/${data?._id}`,
    method: 'PATCH',
    data: { ...data },
  });
  return result;
};

export const deleteRecipeInsightSegment = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/insight-recipe-segment-maps/${id}`,
    method: 'DELETE',
  });
  return result;
};
