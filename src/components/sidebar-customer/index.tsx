import React, { useState, useEffect } from "react"; // Thêm useEffect
import {
  InfoCircleOutlined,
  ScheduleOutlined,
  LogoutOutlined,
  CommentOutlined,
  ShoppingOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import "./index.scss";
import avatar from "../../assets/img/customer-avatar.png";
import { message } from "antd";

const SidebarCustomer: React.FC = () => {
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const location = useLocation(); // Khởi tạo useLocation
  const [selectedOption, setSelectedOption] = useState<string | null>("info");

  const options = [
    {
      id: "info",
      label: "Thông tin tài khoản",
      icon: <InfoCircleOutlined />,
      path: "/customer/information",
    },
    {
      id: "view-bookings",
      label: "Xem lịch vừa đặt",
      icon: <ShoppingOutlined />,
      path: "/customer/view-booking",
    },
    {
      id: "bookings",
      label: "Danh sách đặt lịch",
      icon: <ScheduleOutlined />,
      path: "/customer/bookings",
    },
    {
      id: "change-password", // Thêm ID cho mục Đổi mật khẩu
      label: "Đổi mật khẩu", // Nhãn hiển thị
      icon: <SettingOutlined />, // Bạn có thể thay đổi biểu tượng nếu cần
      path: "/customer/change-password", // Đường dẫn đến trang đổi mật khẩu
    },
    { id: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, path: "/" }, // Đường dẫn đến đăng xuất
  ];

  // Cập nhật selectedOption dựa trên đường dẫn hiện tại
  useEffect(() => {
    const currentPath = location.pathname;
    const currentOption = options.find((option) => option.path === currentPath);
    if (currentOption) {
      setSelectedOption(currentOption.id);
    }
  }, [location.pathname]); // Theo dõi sự thay đổi của pathname

  const handleOptionClick = (id: string) => {
    setSelectedOption(id);
  };

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage và chuyển hướng đến trang 로그인
    localStorage.removeItem("fullName");
    localStorage.removeItem("token"); // Xóa token khi đăng xuất
    setSelectedOption(null); // Reset lại trạng thái selectedOption
    message.success("Đăng xuất thành công!");
    navigate("/login"); // Điều hướng về trang 로그인
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={avatar} alt="Customer Logo" />
      </div>
      <ul className="options">
        {options.map((option) => (
          <li
            key={option.id}
            className={selectedOption === option.id ? "selected" : ""}
            onClick={() => {
              if (option.id === "logout") {
                handleLogout(); // Gọi hàm đăng xuất nếu người dùng nhấn nút Đăng xuất
              } else {
                handleOptionClick(option.id);
              }
            }}
          >
            <NavLink
              to={option.path}
              onClick={() => handleOptionClick(option.id)}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {option.icon}
              <span>{option.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarCustomer;
