import { mockTasks, mockTaskStatuses, getTasksByCustomer, getTasksByUser } from '../tasks';

const res = (data: any) => Promise.resolve({ data: { data, success: true } });

export const getAllTasks = async () => res(mockTasks);
export const getAllTasksStatus = async () => res(mockTaskStatuses);

export const getBYFilter = async (props: {
  status?: any[];
  company?: any[];
  assigned_to_me?: boolean;
  assigned_to_others?: boolean;
}) => {
  let filtered = [...mockTasks];
  if (props.status?.length) {
    filtered = filtered.filter((t) => props.status!.includes(t.status));
  }
  if (props.company?.length) {
    filtered = filtered.filter((t) => props.company!.includes(String(t.customer_id)));
  }
  return res(filtered);
};

export const getTaskById = async (task_id: string) =>
  res(mockTasks.find((t) => t._id === task_id) ?? null);

export const getTaskHistory = async (id: string) =>
  res([
    { task_id: id, action: 'Created', performed_by: 'Rohan Sharma', timestamp: '2025-04-15T09:00:00Z' },
    { task_id: id, action: 'Status changed to In Progress', performed_by: 'Priya Nair', timestamp: '2025-04-16T11:00:00Z' },
  ]);

// Write operations
export const createTask = async (data: any) =>
  res({ _id: `t_${Date.now()}`, ...data, created_at: new Date().toISOString() });

export const updateTask = async (id: string, data: any) =>
  res({ _id: id, ...data, updated_at: new Date().toISOString() });

export const deleteTask = async (id: string) => res({ _id: id, deleted: true });
