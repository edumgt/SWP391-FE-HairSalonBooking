/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button, Table, Form, Popconfirm, message } from "antd";
import api from "../../../config/axios"; // Sử dụng api để gọi API

const AdminPersonnelManagement: React.FC = () => {
  const [accounts, setAccounts] = useState([]); // Trạng thái lưu danh sách stylist
  const [loading, setLoading] = useState(true); // Trạng thái loading khi gọi API

  const fetchAccounts = async () => {
    setLoading(true); // Bật trạng thái loading khi bắt đầu fetch
    try {
      const response = await api.get("/account"); // Gọi API lấy danh sách tài khoản
      const customers = response.data
        .filter((account: any) => account.role === "CUSTOMER")
        .sort((a: any, b: any) => b.id - a.id);
      setAccounts(customers); // Lưu dữ liệu cus vào state
    } catch (error) {
      console.error("Lỗi khi lấy danh sách customer:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading khi hoàn tất
    }
  };
  // Gọi API để lấy danh sách stylist từ server
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleBan = async (id: number) => {
    try {
      // Truy vấn thông tin tài khoản dựa trên id trước khi thực hiện ban
      const accountResponse = await api.get(`/${id}`);
      const customerID = accountResponse.data.customers[0]?.id;

      if (customerID) {
        // Gọi API để lấy toàn bộ bookings tương ứng với customerID
        const bookingsResponse = await api.get(`/bookings/getBooking`);
        const bookings = bookingsResponse.data.filter(
          (booking: any) =>
            booking.customer.id === customerID &&
            booking.status === "Đã xác nhận"
        );

        console.log(
          "Thông tin các booking 'Đã xác nhận' của customer:",
          bookings
        );

        // Lặp qua từng booking và gọi API DELETE để xóa
        for (const booking of bookings) {
          await api.delete(`/bookings/${booking.id}`);
          console.log(`Đã xóa booking với id: ${booking.id}`);
        }
      } else {
        console.log("Không tìm thấy customerID cho tài khoản này.");
      }

      // Thực hiện cấm tài khoản
      await api.delete(`/${id}`); // Đường dẫn mới cho API
      message.success("Cấm tài khoản thành công!");

      // Fetch lại danh sách sau khi cấm thành công
      fetchAccounts();
    } catch (error) {
      message.error("Lỗi khi cấm tài khoản!");
      console.error("Chi tiết lỗi:", error);
    }
  };

  // Hàm xử lý bỏ cấm tài khoản
  const handleUnban = async (id: number) => {
    try {
      await api.put(`/${id}/restore`); // Đường dẫn cho API bỏ cấm tài khoản
      message.success("Bỏ cấm tài khoản thành công!");
      // Fetch lại danh sách sau khi bỏ cấm thành công
      fetchAccounts();
    } catch (error) {
      message.error("Lỗi khi bỏ cấm tài khoản!");
    }
  };

  // Cấu trúc cột của bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => (gender === "Male" ? "Nam" : "Nữ"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "연락처",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Trạng thái",
      dataIndex: "deleted",
      key: "status",
      render: (deleted: boolean) => (deleted ? "Bị cấm" : "Đang hoạt động"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (account: any) => (
        <>
          {account.deleted ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn bỏ cấm tài khoản này không?"
              onConfirm={() => handleUnban(account.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="link" style={{ color: "green" }}>
                Bỏ cấm
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có chắc chắn muốn cấm tài khoản này không?"
              onConfirm={() => handleBan(account.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="link" danger>
                Cấm tài khoản
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="card">
      <h1>Quản Lý khách hàng</h1>
      {/* Hiển thị bảng chứa danh sách stylist */}
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 20 }}
        tableLayout="fixed"
      />
    </div>
  );
};

export default AdminPersonnelManagement;
