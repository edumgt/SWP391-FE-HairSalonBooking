import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Select, Modal } from "antd";
import "./index.scss";
import api from "../../../config/axios";

interface Admin {
  fullName: string;
  phone: string;
  email: string;
  gender?: string;
}

const AdminInformation: React.FC = () => {
  const [form] = Form.useForm();
  const [admin, setAdmin] = useState<Admin>({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
  });
  const [accountId, setAccountId] = useState<number | null>(null);
  const [editable, setEditable] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchAdminInformation = async () => {
      try {
        const token = localStorage.getItem("token");
        const loggedInPhone = localStorage.getItem("phone");

        const response = await api.get("account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Tìm tài khoản hiện tại dựa trên 연락처 đã lưu khi 로그인
        const currentUser = response.data.find(
          (account) => account.phone === loggedInPhone
        );

        if (currentUser) {
          setAdmin({
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
        console.error("Lỗi khi lấy thông tin admin:", error);
        message.error("Không thể tải thông tin admin!");
      }
    };

    fetchAdminInformation(); // Gọi hàm khi component được mount
  }, [form]);

  const handleEditClick = () => {
    setEditable(true);
  };

  const handleSubmit = async (values: Admin) => {
    if (!accountId) {
      message.error("Không thể xác định ID tài khoản!");
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
        setAdmin({
          fullName: values.fullName,
          phone: admin.phone, // Giữ nguyên 연락처
          email: values.email,
          gender: values.gender,
        });
        setEditable(false); // Sau khi cập nhật thành công, quay lại trạng thái không chỉnh sửa
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

  // Hàm xử lý khi mở modal đổi mật khẩu
  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };

  // Hàm xử lý khi submit form đổi mật khẩu
  const handlePasswordChange = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        "/change-password",
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Đổi mật khẩu thành công!");
        setIsPasswordModalVisible(false);
        passwordForm.resetFields(); // Reset form đổi mật khẩu
      } else {
        message.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
    }
  };

  return (
    <div className="admin-content">
      <h1>Thông tin Admin</h1>
    
    
      <Form
        form={form}
        labelCol={{ span: 24 }}
        onFinish={handleSubmit} // Chỉ thực hiện API khi bấm "Cập Nhật Thông Tin"
        onFinishFailed={onFinishFailed}
        className="admin-form"
      >
        <Form.Item
          label="Tên của bạn"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên của bạn!" }]}
        >
          <Input disabled={!editable} />
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
          <Input value={admin.phone} disabled />
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
          <Input disabled={!editable} />
        </Form.Item>

        <Form.Item
          label="Giới tính của bạn"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select disabled={!editable}>
            <Select.Option value="Male">Nam</Select.Option>
            <Select.Option value="Female">Nữ</Select.Option>
          </Select>
        </Form.Item>

        {!editable && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="primary" onClick={handleEditClick}>
              Sửa thông tin
            </Button>
            <Button type="primary" onClick={showPasswordModal}>
              Đổi Mật Khẩu
            </Button>
          </div>
        )}

        {/* Nút cập nhật chỉ hiển thị khi chế độ chỉnh sửa được bật */}
        {editable && (
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập Nhật Thông Tin
            </Button>
          </Form.Item>
        )}
      </Form>
      {/* Modal đổi mật khẩu */}
      <Modal
        title="Đổi Mật Khẩu"
        visible={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
      >
        <Form form={passwordForm} onFinish={handlePasswordChange}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInformation;
