import { Grid, Typography } from 'antd';

const { useBreakpoint } = Grid;

const Home: React.FC = () => {
    const screens = useBreakpoint();

    return (
        <div style={{ padding: screens.xs ? '8px' : '16px' }}>
            <Typography.Title level={2}>
                Home Page for Registered User
            </Typography.Title>
        </div>
    );
};

export default Home;