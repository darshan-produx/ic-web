import { apiRequest } from '../../../common/api-request';

export const getRecipeConfig = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/recipes`,
    method: 'GET',
  });
};

export const deleteRecipeConfig = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/recipes/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadRecipeConfig = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/recipes/upload`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const downloadTemplateRecipeConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/recipes/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templateRecipeConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/recipes/template`,
    method: 'GET',
  });
  return result;
};
