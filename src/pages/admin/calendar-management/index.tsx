import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Select, Modal, Button, message } from "antd";
import moment from "moment";
import api from "../../../config/axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const { Option } = Select;
const localizer = momentLocalizer(moment);

const CalendarManagement: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<number | null>(
    null
  );
  const [customerNames, setCustomerNames] = useState<{ [key: number]: string }>(
    {}
  );
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [temporaryStylistId, setTemporaryStylistId] = useState<number | null>(
    null
  );
  const [allStylists, setAllStylists] = useState<any[]>([]);
  const [availableStylists, setAvailableStylists] = useState<any[]>([]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return { backgroundColor: "#9fd3c7", color: "#084c61" };
      case "Đã hoàn thành":
        return { backgroundColor: "#ffe7b8", color: "#a24e1e" };
      case "Đã thanh toán":
        return { backgroundColor: "#d4edda", color: "#155724" };
      case "Đã hủy":
        return { backgroundColor: "#f8d7da", color: "#721c24" };
      default:
        return { backgroundColor: "#ccc", color: "#000" };
    }
  };

  // Hàm để lấy tất cả stylist có deleted = false, chỉ dùng cho form "Chọn Stylist"
  const fetchAllStylists = async () => {
    try {
      const response = await api.get("/account");
      const stylistAccounts = response.data.filter(
        (account: any) =>
          account.role === "STYLIST" && account.deleted === false
      );

      const allStylistsData = stylistAccounts.map((account: any) => ({
        id: account.stylists[0]?.id,
        fullName: account.fullName,
      }));

      setAllStylists(allStylistsData); // Gán danh sách stylist vào allStylists
    } catch (error) {
      console.error("Lỗi khi lấy danh sách stylist:", error);
      message.error("Không thể tải danh sách stylist.");
    }
  };

  // Hàm để lấy stylist khả dụng khi đổi stylist trong modal
  const fetchAvailableStylistsForModal = async () => {
    if (!selectedEvent) return;

    try {
      const response = await api.get("/account");
      const schedulesResponse = await api.get("/schedules");
      const bookingsResponse = await api.get("/bookings/getBooking");

      const stylistAccounts = response.data.filter(
        (account: any) =>
          account.role === "STYLIST" && account.deleted === false
      );

      const filteredStylists = stylistAccounts
        .filter((account: any) => {
          const stylistId = account.stylists[0]?.id;
          const currentStylistId = selectedEvent.stylistId;

          if (stylistId === currentStylistId) return true;

          const approvedLeaves = schedulesResponse.data.filter(
            (schedule: any) =>
              schedule.stylist.id === stylistId &&
              schedule.status === "Chấp nhận"
          );

          const stylistBookings = bookingsResponse.data.filter(
            (booking: any) => booking.stylist.id === stylistId
          );

          return (
            !approvedLeaves.some((leave: any) => {
              const leaveStart = moment(leave.startTime);
              const leaveEnd = moment(leave.endTime);
              return (
                moment(selectedEvent.start).isBetween(
                  leaveStart,
                  leaveEnd,
                  null,
                  "[]"
                ) ||
                moment(selectedEvent.end).isBetween(
                  leaveStart,
                  leaveEnd,
                  null,
                  "[]"
                )
              );
            }) &&
            !stylistBookings.some((booking: any) => {
              const bookingStart = moment(
                `${booking.appointmentDate} ${booking.startTime}`
              );
              const bookingEnd = moment(
                `${booking.appointmentDate} ${booking.endTime}`
              );
              return (
                moment(selectedEvent.start).isBetween(
                  bookingStart,
                  bookingEnd,
                  null,
                  "[]"
                ) ||
                moment(selectedEvent.end).isBetween(
                  bookingStart,
                  bookingEnd,
                  null,
                  "[]"
                )
              );
            })
          );
        })
        .map((account: any) => ({
          id: account.stylists[0]?.id,
          fullName: account.fullName,
        }));

      setAvailableStylists(filteredStylists); // Gán stylist khả dụng vào availableStylists
    } catch (error) {
      console.error("Lỗi khi lấy danh sách stylist khả dụng:", error);
      message.error("Không thể tải stylist khả dụng.");
    }
  };

  // Gọi fetchAllStylists một lần khi component mount để hiển thị tất cả stylist
  useEffect(() => {
    fetchAllStylists();
  }, []);

  // Gọi fetchAvailableStylistsForModal khi mở modal "Đổi Stylist"
  useEffect(() => {
    if (isModalVisible) {
      fetchAvailableStylistsForModal();
    }
  }, [isModalVisible]);

  const handleChangeStylist = async () => {
    if (temporaryStylistId === null || !selectedEvent) return;

    try {
      const response = await api.put(`/bookings/${selectedEvent.id}/stylist`, {
        stylist_id: {
          id: temporaryStylistId,
          image: "",
          rating: "",
        },
      });
      console.log("API Response:", response.data);
      message.success("Stylist đã được cập nhật thành công!");

      if (selectedStylistId) {
        await fetchBookingsAndLeaves(selectedStylistId);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi đổi stylist:", error);
      message.error("Không thể đổi stylist, vui lòng thử lại.");
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const fetchCustomerNames = async () => {
    try {
      const response = await api.get("/account");
      const accounts = response.data;
      const customerNamesMap: { [key: number]: string } = {};

      accounts.forEach((account: any) => {
        if (account.role === "CUSTOMER") {
          account.customers.forEach((customer: any) => {
            customerNamesMap[customer.id] = account.fullName;
          });
        }
      });

      setCustomerNames(customerNamesMap);
      return customerNamesMap;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      message.error("Không thể tải danh sách tài khoản.");
      return {};
    }
  };

  const splitLeaveIntoMultipleDays = (leave: any) => {
    const events = [];
    const start = moment(leave.startTime);
    const end = moment(leave.endTime);

    while (start.isBefore(end, "day")) {
      events.push({
        title: `Nghỉ: ${leave.reason}`,
        start: new Date(start.format("YYYY-MM-DD 00:00:00")),
        end: new Date(start.format("YYYY-MM-DD 23:59:59")),
        status: leave.status,
      });
      start.add(1, "day");
    }

    events.push({
      title: `Nghỉ: ${leave.reason}`,
      start: new Date(start.format("YYYY-MM-DD 00:00:00")),
      end: new Date(end),
      status: leave.status,
    });

    return events;
  };

  const fetchBookingsAndLeaves = async (stylistId: number) => {
    try {
      const customerNamesMap = await fetchCustomerNames();

      const [bookingsResponse, schedulesResponse] = await Promise.all([
        api.get("/bookings/getBooking"),
        api.get("/schedules"),
      ]);

      const stylistBookings = bookingsResponse.data.filter(
        (booking: any) => booking.stylist.id === stylistId
      );

      const stylistSchedules = schedulesResponse.data.filter(
        (schedule: any) =>
          schedule.stylist.id === stylistId && schedule.status === "Chấp nhận"
      );

      setSchedules(stylistSchedules);

      const formattedBookings = stylistBookings.map((booking: any) => ({
        title: `Khách hàng: ${
          customerNamesMap[booking.customer.id] || "Chưa xác định"
        }`,
        start: new Date(`${booking.appointmentDate} ${booking.startTime}`),
        end: new Date(`${booking.appointmentDate} ${booking.endTime}`),
        id: booking.id,
        status: booking.status,
      }));

      const formattedLeaves = stylistSchedules.flatMap((schedule: any) =>
        splitLeaveIntoMultipleDays(schedule).map((leaveEvent) => ({
          ...leaveEvent,
          scheduleID: schedule.id,
        }))
      );

      setEvents([...formattedBookings, ...formattedLeaves]);
    } catch (error) {
      console.error("Lỗi khi lấy lịch:", error);
      message.error("Không thể tải lịch.");
    }
  };

  useEffect(() => {
    if (selectedStylistId) {
      fetchBookingsAndLeaves(selectedStylistId);
    }
  }, [selectedStylistId]);

  const handleSelectEvent = async (event: any) => {
    console.log("Event được chọn:", event);

    if (event.title.startsWith("Nghỉ:")) {
      const scheduleId = event.scheduleID;
      const scheduleDetails = schedules.find(
        (schedule: any) => schedule.id === scheduleId
      );

      if (scheduleDetails) {
        setSelectedEvent({
          ...event,
          reason: scheduleDetails.reason,
          startTime: moment(scheduleDetails.startTime).format("HH:mm"),
          endTime: moment(scheduleDetails.endTime).format("HH:mm"),
          status: scheduleDetails.status,
          isLeave: true,
        });
        setIsModalVisible(true);
      } else {
        console.log("Không tìm thấy lịch nghỉ với scheduleID:", scheduleId);
      }
      return;
    }

    const bookingId = event.id || event.bookingId;
    if (bookingId) {
      console.log("Đang lấy chi tiết booking cho bookingId:", bookingId);
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        const bookingDetails = response.data;

        const servicesResponse = await api.get("/service/getService");
        const allServices = servicesResponse.data;

        const relatedServices = allServices.filter((service: any) =>
          service.bookings.some((booking: any) => booking.id === bookingId)
        );

        const serviceNamesList = relatedServices.map(
          (service: any) => service.name
        );

        const totalPrice = relatedServices.reduce(
          (total, service) => total + Number(service.price),
          0
        );

        setServiceNames(serviceNamesList);
        setSelectedEvent({
          ...event,
          payments: bookingDetails.payments,
          serviceNames: serviceNamesList,
          totalPrice: totalPrice.toLocaleString("vi-VN") + " VND",
          status: bookingDetails.status,
          isLeave: false,
        });
        setIsModalVisible(true);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết booking:", error);
      }
    } else {
      console.log("Không tìm thấy bookingId trong sự kiện");
    }
  };

  return (
    <div>
      <h2>Quản Lý Lịch Stylist</h2>
      <Select
        placeholder="Chọn Stylist"
        style={{ width: 200, marginBottom: 20 }}
        onChange={(value) => setSelectedStylistId(value)}
        allowClear
      >
        {allStylists.map((stylist) => (
          <Option key={stylist.id} value={stylist.id}>
            {stylist.fullName}
          </Option>
        ))}
      </Select>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: "50px" }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={(event) => {
          const style = getStatusStyle(event.status);
          return { style };
        }}
      />
      <Modal
        title="Chi tiết dịch vụ"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedEvent && (
          <div>
            {selectedEvent.isLeave ? (
              <>
                <p>
                  <strong>Loại sự kiện:</strong> Lịch nghỉ
                </p>
                <p>
                  <strong>Lý do nghỉ:</strong> {selectedEvent.reason}
                </p>
                <p>
                  <strong>Thời gian nghỉ:</strong>{" "}
                  {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")} -{" "}
                  {moment(selectedEvent.end).format("DD/MM/YYYY HH:mm")}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedEvent.status}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Khách hàng:</strong>{" "}
                  {selectedEvent.title.replace("Khách hàng: ", "")}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {moment(selectedEvent.start).format("HH:mm")} -{" "}
                  {moment(selectedEvent.end).format("HH:mm")}
                </p>
                <p>
                  <strong>Dịch vụ:</strong>{" "}
                  {serviceNames.length > 0
                    ? serviceNames.join(", ")
                    : "Không tìm thấy dịch vụ"}
                </p>
                <p>
                  <strong>Tổng 요금안내:</strong>{" "}
                  {selectedEvent.totalPrice || "Không có thông tin 요금안내"}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedEvent.status}
                </p>
                {selectedEvent.payments && selectedEvent.payments.length > 0 ? (
                  <div>
                    <p>
                      <strong>Số tiền thanh toán:</strong>{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        selectedEvent.payments[0].amount
                      )}{" "}
                      VND
                    </p>
                    <p>
                      <strong>Ngày thanh toán:</strong>{" "}
                      {moment(selectedEvent.payments[0].payment_date).format(
                        "DD/MM/YYYY"
                      )}
                    </p>
                    <p>
                      <strong>Phương thức thanh toán:</strong>{" "}
                      {selectedEvent.payments[0].payment_type}
                    </p>
                  </div>
                ) : (
                  <p>Chưa có thông tin thanh toán.</p>
                )}
              </>
            )}
          </div>
        )}
        {selectedEvent && selectedEvent.status === "Đã xác nhận" && (
          <div>
            <p>
              <strong>Đổi stylist:</strong>
            </p>
            <Select
              placeholder="Chọn Stylist"
              onChange={(stylistId) => setTemporaryStylistId(stylistId)}
              style={{ width: 200 }}
            >
              {availableStylists.map((stylist) => (
                <Option key={stylist.id} value={stylist.id}>
                  {stylist.fullName}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              style={{ marginTop: "10px" }}
              onClick={handleChangeStylist}
            >
              Xác nhận
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarManagement;
