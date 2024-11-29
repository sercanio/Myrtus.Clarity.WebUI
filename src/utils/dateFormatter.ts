import { format } from 'date-fns';

export const formatDate = (date: Date | string, dateFormat: string = 'yyyy-MM-dd HH:mm:ss') => {
  return format(new Date(date), dateFormat);
};

export default formatDate;