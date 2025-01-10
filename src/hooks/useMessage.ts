import { message } from 'antd';

const useMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  return { messageApi, contextHolder };
};

export default useMessage;
