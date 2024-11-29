import React from 'react';
import { formatDate } from '../utils/dateFormatter';

interface FormattedDateProps {
  date: Date | string;
  dateFormat?: string;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date, dateFormat = 'yyyy-MM-dd HH:mm:ss' }) => {
  return <span>{formatDate(date, dateFormat)}</span>;
};

export default FormattedDate;