import { Layout, Typography } from "antd";

export const AuthCallback = () => {
  return (
    <Layout style={{ backgroundColor: 'transparent' }}>
      <Layout.Content>
        <Typography.Title level={2}>Authentication</Typography.Title>
        <Typography.Paragraph>
          You should be redirected here after logging in.
        </Typography.Paragraph>
      </Layout.Content>
    </Layout>
  );
}