import Trip from './Trip';
import AllTrips from './AllTrips';
import {
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Home', 'home', <HomeOutlined />),
  getItem('Log In', 'login', <UserOutlined />,),
];


const App = () => {
  let navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (

    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="logo" />
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={(item) => navigate(`/${item.key}`)} />
      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <Routes>
            <Route path="/" element={<AllTrips />} ></Route>
            <Route path="/home" element={<AllTrips />} ></Route>
            <Route path="trips" element={<AllTrips />} ></Route>
            <Route path="trip/:tripId" element={<Trip />}></Route>
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>
          {/* <Routes>
            <Route path="auth" element={<AuthModal />} />
          </Routes> */}
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default App;