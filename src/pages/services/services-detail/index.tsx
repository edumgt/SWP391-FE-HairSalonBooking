import React, { useEffect, useState } from "react";
import "./index.scss";
import { Image, Card, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { Button } from "antd/lib";

const ServicesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceDetail, setServiceDetail] = useState(null);
  const [similarServices, setSimilarServices] = useState([]);

  // Cuộn lên đầu trang mỗi khi id thay đổi
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id]);

  // Gọi API để lấy chi tiết dịch vụ theo id
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const response = await api.get("/service/getService");
        const selectedService = response.data.find(
          (service) => service.id === parseInt(id)
        ); // Tìm dịch vụ có id khớp với id từ URL
        setServiceDetail(selectedService); // Lưu thông tin chi tiết dịch vụ
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết dịch vụ: ", error);
      }
    };

    fetchServiceDetail();
  }, [id]);

  // Lấy các dịch vụ tương tự
  useEffect(() => {
    const fetchSimilarServices = async () => {
      try {
        const response = await api.get("/service/getService");
        setSimilarServices(
          response.data.filter(
            (service) =>
              service.category.id === serviceDetail.category.id &&
              service.id !== parseInt(id)
          )
        );
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ tương tự: ", error);
      }
    };

    if (serviceDetail) {
      fetchSimilarServices();
    }
  }, [serviceDetail, id]);

  // Hàm xử lý khi nhấn nút "Đặt Lịch Ngay"
  const handleBookingClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/booking");
    } else {
      message.error("Vui lòng 로그인 để sử dụng dịch vụ!");
      navigate("/login");
    }
  };

  // Hiển thị loading nếu chưa có dữ liệu
  if (!serviceDetail) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="services-detail-wrapper">
      <div className="service-main">
        <div className="service-image">
          <Image src={serviceDetail.serviceImage} alt={serviceDetail.name} />
        </div>

        <div className="service-info">
          <h2>{serviceDetail.name}</h2>
          <p className="price-range">
            <span className="price">
              Giá từ {serviceDetail.price.toLocaleString("vi-VN")}
            </span>{" "}
            VND
          </p>
          <Button>
            <h3> Thời lượng: {serviceDetail.duration} phút </h3>
          </Button>

          {/* Hiển thị description với định dạng HTML */}
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: serviceDetail.description }}
          />
          {/* Nút Đặt Lịch Ngay */}

          <button class="button" onClick={handleBookingClick}>
            <h3> Đặt Lịch Ngay </h3>
            <div class="hoverEffect">
              <div></div>
            </div>
          </button>
        </div>
      </div>

      {/* Phần Dịch Vụ Cùng Loại */}
      <div className="similar-services-container">
        <h2 className="similar-services-title">Dịch Vụ Cùng Loại</h2>
        <div className="similar-services-list">
          {similarServices.length > 0 ? (
            similarServices.map((service) => (
              <Card
                key={service.id}
                hoverable
                cover={<img alt={service.name} src={service.serviceImage} />}
                className="similar-service-card"
                onClick={() => navigate(`/services/detail/${service.id}`)} // Điều hướng khi click vào dịch vụ
              >
                <Card.Meta
                  title={service.name}
                  description={`Giá từ ${service.price.toLocaleString(
                    "vi-VN"
                  )} VND`}
                />
              </Card>
            ))
          ) : (
            <p>Không có dịch vụ nào cho danh mục này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesDetail;
