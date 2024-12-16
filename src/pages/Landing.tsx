import { Typography } from "antd";

const Landing: React.FC = () => {
    return (
        <div>
            <Typography.Title level={2}>
                Home Page for Unregistered User
            </Typography.Title>
            <Typography.Text type="secondary">
                Welcome to the Home page!
            </Typography.Text>
        </div>
    );
};

export default Landing;