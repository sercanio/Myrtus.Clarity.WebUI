import { Flex, Grid, Typography } from "antd";

const Landing: React.FC = () => {
    const screens = Grid.useBreakpoint();

    return (
        <Flex
            gap="middle"
            vertical
            style={{ padding: screens.xs ? '8px' : '16px' }}>
            <Typography.Title level={2}>
                Home Page for Unregistered User
            </Typography.Title>
            <Typography.Text type="secondary">
                Welcome to the Home page!
            </Typography.Text>
        </Flex>
    );
};

export default Landing;