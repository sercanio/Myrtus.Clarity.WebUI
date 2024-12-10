import { Layout, Typography } from 'antd';

const Home = () => {
  return (
    <Layout style={{ 
      background: 'transparent',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100%'
    }}>
      <Typography.Title>Welcome to Myrtus Clarity</Typography.Title>
      <Typography.Paragraph>Please log in to continue.</Typography.Paragraph>
    </Layout>
  );
};

export default Home;