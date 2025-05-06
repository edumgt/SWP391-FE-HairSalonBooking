import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate và useLocation
import { useEffect, useState } from "react"; // Import hooks
import { FaFacebookF, FaGoogle, FaUserCircle } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import "./index.scss";
import { message } from "antd";
import { useUser } from "../../context/UserContext";

function Header() {
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const location = useLocation(); // Khởi tạo useLocation để lấy URL hiện tại
  const [userFullName, setUserFullName] = useState<string | null>(null); // Tạo state để lưu fullName người dùng
  const [token, setToken] = useState<string | null>(null); // Tạo state để lưu token
  const [isSticky, setIsSticky] = useState(false); // State để theo dõi khi header-bottom cần cố định
  const { user } = useUser();

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi location.pathname thay đổi với hiệu ứng mượt
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]); // Theo dõi sự thay đổi của pathname

  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    setUserFullName(fullName);
  }, [location]);

  useEffect(() => {
    // Kiểm tra localStorage xem người dùng đã 로그인 hay chưa
    const fullName = localStorage.getItem("fullName"); // Lấy fullName từ localStorage
    const savedToken = localStorage.getItem("token"); // Lấy token từ localStorage

    // Kiểm tra và đặt lại các state nếu tìm thấy token và fullName
    if (fullName && savedToken) {
      setUserFullName(fullName); // Lưu fullName vào state
      setToken(savedToken); // Lưu token vào state
    } else {
      setUserFullName(null); // Đảm bảo reset lại nếu không tìm thấy
      setToken(null); // Reset token
    }
  }, [location]); // Theo dõi `location` để cập nhật khi điều hướng

  useEffect(() => {
    // Theo dõi sự kiện cuộn để thay đổi state cho header-bottom
    const handleScroll = () => {
      const headerTopHeight =
        document.querySelector(".header-top")?.clientHeight || 0;
      if (window.scrollY >= headerTopHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/"); // Điều hướng về 홈 khi nhấp vào logo
  };

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage và chuyển hướng đến trang 로그인
    localStorage.removeItem("fullName");
    localStorage.removeItem("token"); // Xóa token khi đăng xuất
    localStorage.removeItem("accountId");
    setUserFullName(null); // Reset lại trạng thái userFullName
    setToken(null); // Reset lại trạng thái token
    message.success("Đăng xuất thành công!");
    navigate("/login"); // Điều hướng về trang 로그인
  };

  // Kiểm tra nếu đường dẫn hiện tại khớp với một trong các mục, thêm class 'active'
  const isActive = (path: string) =>
    location.pathname === path ? "active" : "";

  return (
    <div className="header-wrapper">
      <div className="header-top">
        <div className="contact-info">
          <div className="icon-group">
            <SiZalo />
            <FaFacebookF />
            <FaGoogle />
            <span className="separator"></span>
          </div>
          <div className="phone-number">+ 028 3811 6666</div>
        </div>

        <div className="user-section">
          <div className="separator"></div>{" "}
          {/* Dấu gạch phân cách ở bên trái */}
          <FaUserCircle />
          {userFullName ? (
            <div>
              <span>Xin chào, {user.name}</span> <br />
              <div className="account-actions">
                <button
                  className="account-info"
                  onClick={() => navigate("/customer/information")}
                >
                  Thông tin tài khoản
                </button>
                <button className="logout-button" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }}
            >
              로그인/등록
            </span>
          )}
        </div>
      </div>

      <div className={`header-bottom ${isSticky ? "sticky" : ""}`}>
        <div className="menu">
          <div className="logo">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Logo%2Flogo.png?alt=media&token=ee1b9b13-5b44-48c4-9106-cc3fee3681a7"
              alt="Kim Salon Logo"
              onClick={handleLogoClick} // Gắn sự kiện click vào logo
              style={{ cursor: "pointer" }} // Đặt con trỏ pointer khi hover vào logo
            />
          </div>
          <span className={isActive("/")} onClick={() => navigate("/")}>
            홈
          </span>
          <span
            className={isActive("/about-us")}
            onClick={() => navigate("/about-us")}
          >
            회사소개
          </span>
          <span
            className={isActive("/services")}
            onClick={() => navigate("/services")}
          >
            요금안내
          </span>
          <span
            className={isActive("/brand")}
            onClick={() => navigate("/brand")}
          >
            브랜드
          </span>
          <span
            className={isActive("/collection")}
            onClick={() => navigate("/collection")}
          >
            Bộ Sưu Tập
          </span>
          <span
            className={isActive("/booking")}
            onClick={() => navigate("/booking")}
          >
            Đặt Lịch
          </span>
        </div>
      </div>
    </div>
  );
}

export default Header;
