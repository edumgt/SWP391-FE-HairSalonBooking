import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Select } from "antd";
import api from "../../config/axios"; // Sử dụng api đã cấu hình
import "./index.scss";
import { useUser } from "../../context/UserContext";

interface Customer {
  fullName: string;
  phone: string;
  email: string;
  gender?: string;
}

const CustomerInformation: React.FC = () => {
  const [form] = Form.useForm();
  const [customer, setCustomer] = useState<Customer>({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
  });
  const [accountId, setAccountId] = useState<number | null>(null); // Lưu ID của tài khoản
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchCustomerInformation = async () => {
      try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        const loggedInPhone = localStorage.getItem("phone"); // Lấy 연락처 đã lưu khi 로그인

        const response = await api.get("account", {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token để lấy thông tin tài khoản
          },
        });

        // Tìm tài khoản hiện tại dựa trên 연락처 đã lưu khi 로그인
        const currentUser = response.data.find(
          (account) => account.phone === loggedInPhone
        );

        if (currentUser) {
          setCustomer({
            fullName: currentUser.fullName,
            phone: currentUser.phone,
            email: currentUser.email,
            gender: currentUser.gender,
          });
          setAccountId(currentUser.id); // Lưu ID của người dùng hiện tại

          // Set giá trị form với dữ liệu người dùng hiện tại
          form.setFieldsValue({
            fullName: currentUser.fullName,
            phone: currentUser.phone,
            email: currentUser.email,
            gender: currentUser.gender,
          });
        } else {
          message.error("Không tìm thấy thông tin tài khoản hiện tại!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
        message.error("Không thể tải thông tin khách hàng!");
      }
    };

    fetchCustomerInformation(); // Gọi hàm khi component được mount
  }, [form]);

  const handleSubmit = async (values: Customer) => {
    if (!accountId) {
      message.error("Không thể xác định ID tài khoản!");
      return;
    }

    // Kiểm tra xem có thay đổi gì so với dữ liệu ban đầu không
    if (
      values.fullName === customer.fullName &&
      values.email === customer.email &&
      values.gender === customer.gender
    ) {
      message.warning("Không có sự thay đổi nào được thực hiện.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const response = await api.put(
        `/${accountId}`, // Sử dụng accountID cho URL PUT request
        {
          fullName: values.fullName,
          email: values.email,
          gender: values.gender,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token để xác thực
          },
        }
      );

      if (response.status === 200) {
        message.success("Cập nhật thông tin thành công!");
        // Cập nhật lại thông tin người dùng sau khi lưu
        setCustomer({
          fullName: values.fullName,
          phone: customer.phone, // Giữ nguyên 연락처
          email: values.email,
          gender: values.gender,
        });

        // Cập nhật `localStorage` với tên mới để đồng bộ với Header
        setUser({
          ...user!,
          name: values.fullName,
          token: user!.token,
          role: user!.role,
        });
      } else {
        message.error("Cập nhật thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin tài khoản:", error);
      message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
    }
  };

  const onFinishFailed = (errorInfo: any): void => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="customer-content">
      <h1>Thông tin khách hàng</h1>
      <Form
        form={form}
        labelCol={{ span: 24 }}
        onFinish={handleSubmit} // Chỉ thực hiện API khi bấm "Cập Nhật Thông Tin"
        onFinishFailed={onFinishFailed}
        className="customer-form"
      >
        <Form.Item
          label="Tên của bạn"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên của bạn!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="연락처"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập 연락처 của bạn!" },
            { pattern: /^[0-9]+$/, message: "연락처 phải là chữ số!" },
            { len: 10, message: "연락처 phải đúng 10 chữ số!" },
          ]}
        >
          <Input value={customer.phone} disabled />{" "}
          {/* Trường này bị khóa, nhưng giá trị được hiển thị */}
        </Form.Item>

        <Form.Item
          label="Email của bạn"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email của bạn!" },
            { type: "email", message: "Vui lòng nhập địa chỉ email hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giới tính của bạn"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select>
            <Select.Option value="Male">Nam</Select.Option>
            <Select.Option value="Female">Nữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="submit-button">
          <Button type="primary" htmlType="submit">
            Cập Nhật Thông Tin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomerInformation;
