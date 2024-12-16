import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

function Footer() {
  return (
    <AntFooter style={{ textAlign: 'center' }}>
      ©{new Date().getFullYear()} Myrtus Clarity. All Rights Reserved.
    </AntFooter>
  );
}

export default Footer; 