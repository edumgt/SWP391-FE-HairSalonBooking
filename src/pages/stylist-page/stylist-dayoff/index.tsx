import React, { useEffect, useState } from "react";
import { Table } from "antd";
import api from "../../../config/axios";
import moment from "moment";

interface Schedule {
  scheduleID: number;
  reason: string;
  status: string;
  startTime: string;
  endTime: string;
  stylist: {
    id: number;
  };
}

function StylistDayoff() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const stylistId = localStorage.getItem("stylistId");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get("/schedules");
        const allSchedules = response.data;

        // Lọc các schedule có stylistId khớp với stylist đang 로그인
        const stylistSchedules = allSchedules
          .filter(
            (schedule: Schedule) => schedule.stylist.id === parseInt(stylistId)
          )
          .reverse();

        setSchedules(stylistSchedules);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lịch nghỉ:", error);
      }
    };

    fetchSchedules();
  }, [stylistId]);

  // Cột của bảng
  const columns = [
    {
      title: "Ngày bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: string) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <div>
      <h2>Lịch Nghỉ Của Stylist</h2>
      <Table
        columns={columns}
        dataSource={schedules.map((schedule) => ({
          key: schedule.scheduleID,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          reason: schedule.reason,
          status: schedule.status,
        }))}
        pagination={false} // Tắt phân trang nếu không cần
      />
    </div>
  );
}

export default StylistDayoff;
