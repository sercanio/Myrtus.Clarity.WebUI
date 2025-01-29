import React from 'react';
import { Typography } from 'antd';

interface FormattedDateProps {
  date: string;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date }) => {
  const formattedDate = new Date(date).toLocaleString();

  return <Typography.Text>{formattedDate}</Typography.Text>;
};

export default FormattedDate;