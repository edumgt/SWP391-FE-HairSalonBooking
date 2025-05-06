import React, { useState } from "react";
import {
  CalendarOutlined,
  CommentOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, message, theme, Avatar } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Sử dụng UserContext để quản lý người dùng
import { useLocation } from "react-router-dom";
import "./index.scss";

const { Content, Sider } = Layout;

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: any
) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/stylistpage/${key}`}>{label}</Link>,
  };
}

const StylistPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { setUser } = useUser(); // Lấy hàm setUser từ UserContext để cập nhật trạng thái người dùng
  const navigate = useNavigate(); // Sử dụng hook navigate để điều hướng
  const location = useLocation();
  const currentCategory = location.pathname.split("/").pop();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null); // Reset lại trạng thái người dùng
    message.success("Đăng xuất thành công!");
    navigate("/"); // Điều hướng về trang 로그인
  };

  const items = [
    getItem("Thông Tin Stylist", "stylistInfo", <UserOutlined />),
    getItem("Feedbacks", "stylistFeedback", <CommentOutlined />),
    getItem("Lịch Làm Việc", "stylistSchedule", <CalendarOutlined />),
    getItem("Lịch Nghỉ", "stylistDayoff", <ScheduleOutlined />),
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <button className={`button ${collapsed ? "collapsed" : ""}`}>
          <div className="blob1"></div>
          <div className="inner">KIM HAIRSALON</div>
        </button>

        <Menu
          theme="dark"
          defaultSelectedKeys={["stylistInfo"]}
          mode="inline"
          items={items.map((item) => ({
            ...item,
            label:
              item.key === "logout" ? (
                <span onClick={handleLogout}>{item.label}</span>
              ) : (
                item.label
              ),
          }))}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Stylist</Breadcrumb.Item>
            <Breadcrumb.Item>{currentCategory}</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: theme.useToken().token.colorBgContainer,
              borderRadius: theme.useToken().token.borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StylistPage;
