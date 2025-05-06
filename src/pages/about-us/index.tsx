import React from "react";
import "./index.scss";
import HairStylistSlider from "../../components/stylists";
import ScrollToTop from "../../components/scroll-to-top";

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      {/* Phần Về Kim Hair Salon */}
      <div className="about-us-header">
        <h3>Về Kim Hair Salon, Sứ Mệnh, Tầm Nhìn</h3>
      </div>
      <div className="about-us-content">
        <div className="about-us-text">
          <h1>KIM HAIR SALON</h1>
          <p>
            Kim Hair Salon tự hào là chuỗi salon chuyên gia, có uy tín trong
            ngành làm đẹp tại Việt Nam. Tóc đẹp mỗi ngày là lời cam kết của Kim
            Hair Salon với khách hàng và vẻ đẹp nghệ thuật không chỉ nằm ở sự
            hào nhoáng của vẻ ngoài, mà còn nằm ở tiêu chuẩn “vàng” của mỗi nhà
            sáng tạo. Một mái tóc đẹp, ngoài màu sắc xu hướng, kiểu dáng hợp
            thời trang mà còn phải toát lên nét đẹp từ sự khỏe mạnh của mái tóc
            từ bên trong.
          </p>
        </div>
        <div className="about-us-image">
          <img
            src={
              "https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/AboutUs%2Fbanner1.png?alt=media&token=416e12a7-1280-4220-b661-5c6268137abc"
            }
            alt="Kim Hair Salon"
          />
        </div>
      </div>

      {/* Phần Sứ Mệnh và Tầm Nhìn */}
      <div className="mission-vision-section">
        <div className="mission-vision-image">
          <img
            src={
              "https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/AboutUs%2Fbanner2.png?alt=media&token=cc57752f-a745-4446-9e78-a575eb45fc93"
            }
            alt="Mission and Vision"
          />
        </div>
        <div className="mission-vision-text">
          <div className="mission">
            <h2>SỨ MỆNH</h2>
            <p>
              Kim Hair Salon tôn vinh giá trị đẹp cho mái tóc Việt bằng đội ngũ
              nhân sự được đào tạo bài bản với quy chuẩn các giá trị bền vững,
              lan tỏa giá trị của sống đẹp, sống hạnh phúc bằng niềm đam mê nghệ
              thuật bất tận.
            </p>
          </div>
          <div className="vision">
            <h2>TẦM NHÌN</h2>
            <p>
              Trở thành chuỗi Salon xanh và bền vững được yêu thích nhất tại
              Việt Nam đạt chuẩn quốc tế.
            </p>
          </div>
        </div>
      </div>

      {/* Phần Giá Trị Cốt Lõi */}
      <div className="core-values-section">
        <h2 className="section-title">GIÁ TRỊ CỐT LÕI</h2>
        <div className="core-values-content">
          <div className="core-values-image">
            <img
              src={
                "https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/AboutUs%2Fbanner3.png?alt=media&token=db296390-bd2c-4a2e-8094-6481446bfd8f"
              }
              alt="Giá Trị Cốt Lõi"
            />
          </div>
          <div className="core-values-text">
            <div className="core-value-item">
              <h3>TÂM</h3>
              <p>Sự chân thành, tử tế.</p>
            </div>
            <div className="core-value-item">
              <h3>TÍN</h3>
              <p>Sự thanh tín, tận tâm.</p>
            </div>
            <div className="core-value-item">
              <h3>TRÍ</h3>
              <p>Sự thông tuệ - tư duy đúng đắn.</p>
            </div>
            <div className="core-value-item">
              <h3>TÀI</h3>
              <p>Tài năng mà khiêm nhường và không ngừng học hỏi.</p>
            </div>
            <div className="core-value-item">
              <h3>TẦM</h3>
              <p>Hướng đến giá trị bền vững và lâu dài.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin về nhà sáng lập */}

      {/* Phần Người Sáng Lập */}
      <div className="founder-section">
        <div className="founder-header">
          <h3>Người Sáng Lập</h3>
        </div>
        <div className="founder-content">
          <div className="founder-image">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/swp391-7123d.appspot.com/o/AboutUs%2Fbanner4.png?alt=media&token=eafd6bb1-2a45-4dc8-b4f1-d82b737ca69f"
              alt="Le Hieu"
            />
            <p className="quote">
              “Mỗi sản phẩm tóc được đầu tư thời gian và trí tuệ như một tác
              phẩm nghệ thuật. Vẻ đẹp nghệ thuật của tạo mẫu tóc đến từ sự khéo
              léo của đôi bàn tay, cảm xúc của trái tim kết hợp cùng tư duy sáng
              tạo mang lại vẻ đẹp hoàn mỹ cho từng khách hàng.”
              <br />– Lê Hiếu Hair Stylist.
            </p>
          </div>
          <div className="founder-info">
            <h1>HAIR STYLIST LÊ HIẾU</h1>
            <p>
              Hair Stylist Lê Hiếu đóng vai trò là người sáng lập và điều hành
              tại Kim Hair Salon. Anh Lê Hiếu đã xây dựng 브랜드 bằng năng
              lực và tầm nhìn của bản thân, minh chứng từ những hợp tác với các
              đối tác uy tín trong ngành tóc, có thể kể đến: L’Oréal, Kerastase,
              Dyson,... Anh còn là Giám khảo cho các cuộc thi: Idol Hair;
              Vietnam TOP Hairstylist; L’OREAL Beauty. Năm 2017, anh đại diện
              cho Việt Nam tham gia đồng sáng tạo xu hướng tóc cùng nghệ sĩ các
              nước: Thái Lan, Trung Quốc, Hàn Quốc,...
            </p>
            <div className="milestones">
              <div className="milestone-item">
                <h3>Từ năm 2014 – 2018</h3>
                <p>
                  Anh sáng lập và Điều hành Học viện Việt Nam BASIC HAIR và thực
                  hiện thường xuyên các buổi WORKSHOP, SEMINAR, HAIR SHOW...
                </p>
              </div>
              <div className="milestone-item">
                <h3>Từ năm 2015-2021</h3>
                <p>
                  Anh là ID Artist đồng hành cùng nhãn hàng tóc chuyên nghiệp
                  L’Oréal Professionnel Vietnam.
                </p>
              </div>
              <div className="milestone-item">
                <h3>Năm 2019</h3>
                <p>
                  Anh là Cố vấn và Vận hành tổ chức Chương trình ASIA BEAUTOPIA
                  – Triển lãm Quốc tế về Làm Đẹp và Sức Khỏe Châu Á.
                </p>
              </div>
              <div className="milestone-item">
                <h3>Từ năm 2019-2022</h3>
                <p>
                  Anh là Phó Chủ tịch, trưởng ban thiết kế tóc khu vực miền Nam
                  VNBA – Hội Đào Tạo – Phát Triển Nghề Làm Đẹp Việt Nam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stylists */}
      <div className="hairstylist-section">
        <div className="hairstylist-header">
          <h3>Hair Stylist Tại Kim Hair Salon</h3>
        </div>
        <HairStylistSlider />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AboutUs;
