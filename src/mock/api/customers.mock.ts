import {
  mockCustomers,
  mockCustomerSegments,
  getCustomerById,
  getCustomersByCSM,
} from '../customers';

// Some endpoints return flat array at response.data; others nest under response.data.data
const res = (data: any) => Promise.resolve({ data: { data, success: true } });
const flat = (data: any) => Promise.resolve({ data });

export const getCustomers = async () => flat(mockCustomers);
export const getCustomersAdmin = async () => flat(mockCustomers);
export const getAllOrganizationCustomersHierarchy = async () => flat(mockCustomers);
export const getAllAssignedCustomers = async () => flat(mockCustomers);
export const getAllDirectAssignedCustomers = async () => flat(mockCustomers);

export const getCustomerDetails = async (customer_id: number) =>
  res(getCustomerById(customer_id));

export const getCustomersByuser = async () => res(mockCustomers);

export const getCustomerSegments = async () => res(mockCustomerSegments);

export const getPillarStatus = async (customer_id: number) =>
  res({
    customer_id,
    pillars: [
      { name: 'Adoption', score: 78, status: 'Healthy' },
      { name: 'Engagement', score: 65, status: 'At Risk' },
      { name: 'Outcomes', score: 82, status: 'Healthy' },
      { name: 'Support', score: 71, status: 'Healthy' },
    ],
  });

export const getLastQBRDate = async (customer_id: number) => {
  const customer = getCustomerById(customer_id);
  return res([{ interaction_type: 'qbr', date: customer?.last_qbr_date ?? null }]);
};

export const getLastestNpsScore = async (customer_id: number) => {
  const customer = getCustomerById(customer_id);
  return res([{ score: customer?.nps_score ?? 0, date: '2025-03-15' }]);
};

// Write operations — resolve with success (no-op in mock)
export const assignCustomer = async (id: number, data: any) => res({ id, ...data });
export const updateCustomerDescription = async (id: number, data: any) => res({ id, ...data });
export const createUpdateGroupCustomer = async (data: any) => res(data);
export const createLastQBRDate = async (id: number, data: any) => res({ id, ...data });
export const updateCustomerAttributes = async (..._args: any[]) => res({ success: true });
export const saveProfilePicture = async (..._args: any[]) => res({ success: true });
export const updateCustomerJourneySignal = async (signalId: string, data: any) => res({ signalId, ...data });
export const createCustomerEvent = async (data: any) => res(data);
