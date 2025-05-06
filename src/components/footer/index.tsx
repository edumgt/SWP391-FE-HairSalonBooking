import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import "./index.scss";

function Footer() {
  return (
    <div className="footer-wrapper">
      <div className="footer-content">
        <div className="footer-section">
          <div className="logo-gold">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Logo%2Flogo-gold.png?alt=media&token=1dc435a2-4211-44bc-a32d-165272af255a"
              alt="Kim Salon Logo Gold"
            />
          </div>
          <p>
            <strong>Địa chỉ:</strong> 98o Lê Lai, Phường Bến Thành, Quận 1, Tp
            HCM
          </p>
          <p>
            <strong>Hotline:</strong> 028 3811 6666
          </p>
          <p>
            <strong>Email:</strong> info@kimhair.com.vn
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href="http://www.kimhair.com.vn">www.kimhair.com.vn</a>
          </p>
        </div>

        <div className="footer-section">
          <h4>TRỢ GIÚP</h4>
          <ul>
            <li>
              <a href="#">Bảng giá</a>
            </li>
            <li>
              <a href="#">Bộ sưu tập</a>
            </li>
            <li>
              <a href="#">브랜드 nổi tiếng</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>GIỜ LÀM VIỆC</h4>
          <p>Thứ 2 - Chủ nhật: 8h - 20h</p>
        </div>

        <div className="footer-section">
          <h4>FOLLOW KIMHAIR TẠI:</h4>
          <div className="social-icons">
            <SiZalo />
            <FaFacebookF />
            <FaGoogle />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>©Copyright Kim Hair Salon. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Footer;
