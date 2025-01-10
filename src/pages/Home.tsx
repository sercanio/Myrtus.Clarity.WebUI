import { Flex, Grid, Typography } from 'antd';


const Home: React.FC = () => {
    const screens = Grid.useBreakpoint();

    return (
        <Flex
            gap="middle"
            vertical
            style={{ padding: screens.xs ? '8px' : '16px' }}>
            <Typography.Title level={2}>
                Home Page for Registered User
            </Typography.Title>
        </Flex>
    );
};

export default Home;