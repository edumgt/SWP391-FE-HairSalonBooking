import React from "react";
import { Carousel, message } from "antd";
import { useNavigate } from "react-router-dom"; // Thêm hook useNavigate
import "./index.scss";
import HairStylistSlider from "../../components/stylists";
import ScrollToTop from "../../components/scroll-to-top";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceClick = () => {
    navigate("/services");
  };

  const handleBookingClick = () => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      navigate("/booking"); // Đã đăng nhập
    } else {
      message.error("Vui lòng đăng nhập để sử dụng dịch vụ!");
      navigate("/login"); // Chưa đăng nhập
    }
  };

  return (
    <div className="home-page">
      {/* Carousel Section */}
      <Carousel autoplay>
        <div>
          <img
            className="carousel-image"
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Carousel%2Fcarousel1.jpg?alt=media&token=a16ce3ff-b5df-4b6f-931a-92101d59f123"
            alt="Image 1"
          />
        </div>
        <div>
          <img
            className="carousel-image"
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Carousel%2Fcarousel2.png?alt=media&token=9454df9c-78c0-4f48-ab0e-5ac8e0c88589"
            alt="Image 2"
          />
        </div>
        <div>
          <img
            className="carousel-image"
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Carousel%2Fcarousel3.png?alt=media&token=80f34e65-9e98-4ed6-a815-6fde2a30e1c7"
            alt="Image 3"
          />
        </div>
        <div>
          <img
            className="carousel-image"
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Carousel%2Fcarousel4.png?alt=media&token=07306edc-8e66-4d48-8655-92ef6c56a069"
            alt="Image 4"
          />
        </div>
      </Carousel>

      {/* Introduction Section */}
      <div className="introduction-section">
        <div className="intro-image">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2Fintro.png?alt=media&token=f04333a9-7d8b-4a26-a0a5-8370b99765cd"
            alt="Introduction"
          />
        </div>
        <div className="intro-text">
          <h2>김 헤어살롱에 대하여, 사명과 비전</h2>
          <p>
          김 헤어살롱은 베트남에서 뷰티 산업 내에서 신뢰받는 전문 체인 살롱으로 자부심을 가지고 있습니다.
‘매일 아름다운 머리’는 김 헤어살롱이 고객에게 약속하는 말이며, 아름다움은 단순히 외적인 화려함에 그치지 않고, 각 스타일리스트의 ‘황금 기준’에서 비롯된 예술적인 가치에 있습니다.
아름다운 머릿결은 단지 트렌디한 색상이나 스타일뿐만 아니라, 건강함에서 비롯된 내면의 아름다움까지 반영되어야 합니다.
          </p>
        </div>
      </div>

      {/* Section Dịch Vụ Nổi Bật */}
      <div className="services">
        <h2>Dịch Vụ Nổi Bật</h2>
        <div className="services-grid">
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fcat-toc-nam.png?alt=media&token=9f805932-db9d-45a7-a1f6-087cae39cabb"
              alt="Cắt tóc nam"
            />
            <p>Cắt tóc nam</p>
          </div>
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fcat-toc-nu.jpg?alt=media&token=3f91559d-16f8-435f-ac46-45c47e601b66"
              alt="Cắt tóc nữ"
            />
            <p>Cắt tóc nữ</p>
          </div>
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fgoi-dau-thu-gian.png?alt=media&token=652715ac-a5aa-4688-bfd0-dfd19bb0e5ad"
              alt="Gội đầu thư giãn"
            />
            <p>Gội đầu thư giãn</p>
          </div>
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fhap-dau.png?alt=media&token=1377e768-a06f-4b26-9f0f-8f0993952d3b"
              alt="Hấp dầu"
            />
            <p>Hấp dầu</p>
          </div>
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fuon-toc.png?alt=media&token=42d2589e-b085-40cb-b517-b973c44775c4"
              alt="Uốn tóc"
            />
            <p>Uốn tóc</p>
          </div>
          <div className="service-item" onClick={handleServiceClick}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FServices%2Fnhuom-mau-thoi-trang.png?alt=media&token=9cc08e25-10b0-44a0-b69e-49c409466942"
              alt="Nhuộm màu thời trang"
            />
            <p>Nhuộm màu thời trang</p>
          </div>
        </div>
      </div>

      {/* Đối tác của Kim Hair Salon */}
      <div className="partners-section">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fdoi-tac.png?alt=media&token=36022472-7fa2-4c98-a899-22e5aa983443"
          alt="Doi-tac"
        />
        <div className="partners-grid">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fdavines.png?alt=media&token=a527c17c-8f36-4b46-82ca-acdea056798f"
            alt="Davines"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fnashi.png?alt=media&token=70e79558-7e79-4fbc-8999-e1741da5a4b9"
            alt="Nashi"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fgoldwell.png?alt=media&token=2a20c880-8d17-4508-913f-b425de6581cc"
            alt="Goldwell"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fmydentity.png?alt=media&token=2bfbc019-8784-4d6d-95c3-3d4ab26bc56b"
            alt="Mydentity"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fjoico.png?alt=media&token=6d39dd05-7a09-41d9-9928-c6194bf19de4"
            alt="Joico"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Floreal.png?alt=media&token=3c20240d-f0e7-4027-b513-157242a1af72"
            alt="L'Oreal"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Fschwarzkopf.png?alt=media&token=2fb5d26b-9fa1-4546-b0da-4952ca87c423"
            alt="Schwarzkopf"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2FPartners%2Folaplex.png?alt=media&token=439bc210-1dec-439e-8387-16adc25f8eea"
            alt="Olaplex"
          />
        </div>
      </div>

      {/* Stylists */}
      <HairStylistSlider />

      {/* Banner */}
      <div className="banner-container">
        <h3>TÓC ĐẸP MỖI NGÀY CÙNG</h3>
        <h1>KIM HAIR SALON</h1>
        <div className="banner-image">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/Homepage%2Fbanner.png?alt=media&token=0c69993f-90b3-4e37-ac61-6845646fcadd"
            alt="Kim Hair Salon"
          />
        </div>
        <button className="booking-button" onClick={handleBookingClick}>
          ĐẶT LỊCH NGAY
        </button>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Home;
