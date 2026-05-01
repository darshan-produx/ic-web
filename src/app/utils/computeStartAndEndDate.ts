import dayjs from 'dayjs';

export const computeStartAndEndDate = (
  type: 'daily' | 'weekly' | 'monthly',
  option: string
) => {
  const endDate = dayjs();
  let startDate;

  switch (type) {
    case 'daily':
      const days = parseInt(option.replace('D', ''), 10);
      if (isNaN(days)) {
        throw new Error(`Invalid option for daily: ${option}`);
      }
      startDate = endDate.subtract(days, 'day');
      break;
    case 'weekly':
      const weeks = parseInt(option.replace('W', ''), 10);
      if (isNaN(weeks)) {
        throw new Error(`Invalid option for weekly: ${option}`);
      }
      startDate = endDate.subtract(weeks, 'week');
      break;
    case 'monthly':
      const months = parseInt(option.replace('M', ''), 10);
      if (isNaN(months)) {
        throw new Error(`Invalid option for monthly: ${option}`);
      }
      startDate = endDate.subtract(months, 'month');
      break;
    default:
      startDate = endDate;
  }

  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  };
};
