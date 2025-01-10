import { Spin } from 'antd';
import { Flex } from 'antd';

const LoadingScreen = () => {
  return (
    <Flex align="center" justify="center" style={{ height: '100%' }}>
      <Spin size="large" />
    </Flex>
  );
};

export default LoadingScreen;
