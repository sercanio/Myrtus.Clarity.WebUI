import React from 'react';
import { formatDate } from '@utils/dateFormatter';
import { Typography } from 'antd';

interface FormattedDateProps {
  date: Date | string;
  dateFormat?: string;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date, dateFormat = 'yyyy-MM-dd HH:mm:ss' }) => {
  return (
    <Typography.Text
      type="secondary">
      {formatDate(date, dateFormat)}
    </Typography.Text>
  )
};

export default FormattedDate;