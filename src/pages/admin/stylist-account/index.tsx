/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Radio,
} from "antd";
import api from "../../../config/axios"; // Sử dụng api để gọi API
import Loading from "../../../components/loading";

const StylistAccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState([]); // Trạng thái lưu danh sách stylist
  const [loading, setLoading] = useState(true); // Trạng thái loading khi gọi API
  const [openModal, setOpenModal] = useState(false); // Trạng thái modal thêm/sửa stylist
  const [editingAccount, setEditingAccount] = useState(null); // Trạng thái chỉnh sửa stylist
  const [form] = Form.useForm(); // Sử dụng form của Ant Design
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/account");
      const stylists = response.data
        .filter(
          (account: any) =>
            account.role === "STYLIST" && account.deleted === false
        ) // Lọc deleted = false
        .sort((a: any, b: any) => b.id - a.id); // Sắp xếp theo ID giảm dần
      setAccounts(stylists);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách stylist:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Xử lý khi form được submit để thêm hoặc sửa stylist
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      if (editingAccount) {
        // Nếu đang trong trạng thái chỉnh sửa, gọi API PUT và chỉ gửi các thông tin cần thiết
        const updateData = {
          fullName: values.fullName,
          email: values.email,
          gender: values.gender,
        };
        await api.put(`/${editingAccount.id}`, updateData);
        message.success("Cập nhật stylist thành công!");
      } else {
        // Nếu là thêm mới, gọi API POST
        await api.post("/register", {
          ...values,
          role: "STYLIST",
          enabled: true,
        });
        message.success("Thêm stylist thành công!");
      }

      // Fetch lại danh sách ngay lập tức sau khi thêm hoặc cập nhật thành công
      const response = await api.get("/account");
      const stylists = response.data
        .filter(
          (account: any) =>
            account.role === "STYLIST" && account.deleted === false
        )
        .sort((a: any, b: any) => b.id - a.id); // Sắp xếp theo ID giảm dần
      setAccounts(stylists); // Cập nhật danh sách stylist mới

      setOpenModal(false); // Đóng modal ngay lập tức sau khi API thành công
      form.resetFields(); // Reset form ngay sau khi API thành công
      setEditingAccount(null); // Reset trạng thái chỉnh sửa
    } catch (error) {
      console.error("Lỗi khi tạo/cập nhật stylist:", error);
      message.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    }finally{
      setLoading(false);
    }
  };

  // Xử lý khi nhấn nút "Sửa", mở modal và điền thông tin stylist vào form
  const handleEdit = (account: any) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setOpenModal(true);
  };

  // Xử lý khi nhấn nút "Xóa", gọi API DELETE
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/${id}`);
      message.success("Xóa stylist thành công!");
      // Fetch lại danh sách sau khi xóa thành công
      const response = await api.get("/account");
      const stylists = response.data.filter(
        (account: any) => account.role === "STYLIST"
      );
      setAccounts(stylists);
    } catch (error) {
      message.error("Lỗi khi xóa stylist!");
    }
  };

  // Cấu trúc cột của bảng StylistAccountManagement
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "10%",
    },
    {
      title: "Tên stylist",
      dataIndex: "fullName",
      key: "fullName",
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "연락처",
      dataIndex: "phone",
      key: "phone",
      width: "15%",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: "10%",
      render: (gender: string) => (gender === "Male" ? "Nam" : "Nữ"),
    },
    {
      title: "Hành động",
      key: "action",
      width: "20%",
      render: (account: any) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(account)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa stylist này không?"
            onConfirm={() => handleDelete(account.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
    {loading ? (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loading /> {/* Hiển thị component Loading khi đang loading */}
      </div>
    ) : (
    <div className="card">
      <h1>Quản Lý Tài Khoản Stylist</h1>
      <Button
        type="primary"
        onClick={() => {
          setOpenModal(true);
          form.resetFields(); // Reset các thông tin trong form khi mở modal
        }}
      >
        Thêm Stylist
      </Button>

      {/* Hiển thị bảng chứa danh sách stylist */}
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }} // Đảm bảo bảng cuộn được khi chiều rộng vượt quá kích thước thẻ card
        style={{ marginTop: 20, width: "100%" }} // Đảm bảo bảng chiếm toàn bộ chiều rộng của thẻ card
      />

      {/* Modal thêm/sửa stylist */}
      <Modal
        title={editingAccount ? "Chỉnh sửa stylist" : "Thêm stylist mới"}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setEditingAccount(null); // Đặt lại trạng thái
        }}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} labelCol={{span:24}}>
          {/* Tên stylist */}
          <Form.Item
            label="Tên stylist"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập tên stylist!" }]}
          >
            <Input />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Vui lòng nhập email hợp lệ!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* 연락처 - Chỉ hiển thị khi thêm stylist */}
          {!editingAccount && (
            <Form.Item
              label="연락처"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập 연락처!" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          {/* Mật khẩu - Chỉ hiển thị khi thêm stylist */}
          {!editingAccount && (
            <>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}

          {/* Giới tính */}
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Radio.Group>
              <Radio value="Male">Nam</Radio>
              <Radio value="Female">Nữ</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Nút thêm/sửa */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingAccount ? "Cập nhật" : "Thêm stylist"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    )}</div>
  );
};

export default StylistAccountManagement;
