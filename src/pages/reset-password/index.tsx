import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import AuthenTemplate from "../../components/authen-template";
import { useForm } from "antd/lib/form/Form";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

const ResetPassword: React.FC = () => {
  const [form] = useForm();
  const [otpSent, setOtpSent] = useState(false); // State để theo dõi tình trạng gửi OTP
  const [sendingOtp, setSendingOtp] = useState(false); // Để theo dõi trạng thái gửi mã
  const navigate = useNavigate();

  // Hàm gửi mã OTP qua Firebase
  const sendOTP = async (phone: string) => {
    try {
      setSendingOtp(true); // Bắt đầu trạng thái đang gửi mã OTP

      // Gọi API mới để gửi OTP
      const response = await api.post("/request-reset-password", {
        phoneNumber: phone,
      });

      // Kiểm tra phản hồi từ API và log mã OTP
      if (response.status === 200) {
        const otp = response.data; // Lấy OTP từ phản hồi
        console.log("OTP sent is:", otp); // In ra mã OTP
        message.success("Mã OTP đã được gửi!");
        setOtpSent(true); // Đánh dấu đã gửi OTP
      } else {
        message.error("Đã xảy ra lỗi khi gửi mã OTP!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi mã OTP:", error);
      message.error("Đã xảy ra lỗi khi gửi mã OTP!");
    } finally {
      setSendingOtp(false); // Kết thúc trạng thái gửi mã OTP
    }
  };

  const onFinish = async (values: any): void => {
    try {
      // Gọi API reset mật khẩu
      const response = await api.post("/reset-password", {
        phoneNumber: values.phone,
        otp: values.OTP,
        newPassword: values.password,
        confirmPassword: values.rePassword,
      });

      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        message.success("Đặt lại mật khẩu thành công!");
        navigate("/login"); // Điều hướng về trang 로그인 sau khi thành công
      } else {
        message.error("Đặt lại mật khẩu không thành công, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      message.error("Đã xảy ra lỗi khi đặt lại mật khẩu!");
    }
  };

  return (
    <AuthenTemplate>
      <h1>Lấy Lại Mật Khẩu</h1>
      <Form form={form} labelCol={{ span: 24 }} onFinish={onFinish}>
        <Form.Item
          label="연락처"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập 연락처 của bạn!" },
            { pattern: /^[0-9]+$/, message: "연락처 phải là chữ số!" },
            { len: 10, message: "연락처 phải đúng 10 chữ số!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nhập Mã OTP"
          name="OTP"
          rules={[
            { required: true, message: "Vui lòng nhập mã OTP đã gửi!" },
            { pattern: /^[0-9]+$/, message: "OTP phải là số!" },
            { len: 6, message: "OTP phải có đúng 6 chữ số!" },
          ]}
        >
          <Input
            addonAfter={
              <Button
                type="link"
                disabled={otpSent || sendingOtp}
                onClick={() => {
                  const phone = form.getFieldValue("phone");
                  if (phone) {
                    sendOTP(phone); // Gọi hàm gửi OTP khi nhấn vào nút "Gửi mã"
                  } else {
                    message.error(
                      "Vui lòng nhập 연락처 trước khi gửi OTP!"
                    );
                  }
                }}
              >
                {sendingOtp ? "Đang gửi..." : "Gửi mã"}
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          label="Mật Khẩu Mới"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Nhập lại mật khẩu"
          name="rePassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu của bạn!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Hai mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item className="submit-button">
          <Button type="primary" htmlType="submit">
            Xác nhận
          </Button>
        </Form.Item>

        <Form.Item className="back-to-login">
          <Button type="default" onClick={() => navigate("/login")}>
            Quay về trang 로그인
          </Button>
        </Form.Item>

        {/* Recaptcha container */}
        <div id="recaptcha-container"></div>
      </Form>
    </AuthenTemplate>
  );
};

export default ResetPassword;
