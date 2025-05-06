import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../../config/axios";
import { Modal, Button, message, InputNumber, DatePicker, Input } from "antd";

const localizer = momentLocalizer(moment);

const StylistSchedule: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [customerNames, setCustomerNames] = useState<{ [key: number]: string }>(
    {}
  );
  const stylistId = localStorage.getItem("stylistId");
  const [services, setServices] = useState<any[]>([]);
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0); // State to hold payment amount

  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");

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
        return { backgroundColor: "#f5f5f5", color: "#6c757d" };
    }
  };

  // Đảm bảo fetchCustomerNames được gọi trước khi fetchEvents
  useEffect(() => {
    fetchCustomerNames().then((namesMap) => {
      fetchEvents(namesMap);
    });
  }, []);

  const fetchCustomerNames = async () => {
    try {
      const response = await api.get("/account");
      const accounts: any[] = response.data;
      const namesMap: { [key: number]: string } = {};

      console.log("Dữ liệu từ API /account:", accounts);

      accounts.forEach((account: any) => {
        if (
          account.role === "CUSTOMER" &&
          account.customers &&
          account.customers.length > 0
        ) {
          account.customers.forEach((customer: any) => {
            console.log(
              `Mapping customer id ${customer.id} to name ${account.fullName}`
            );
            namesMap[customer.id] = account.fullName;
          });
        }
      });

      setCustomerNames(namesMap); // Cập nhật state
      console.log("Danh sách tên khách hàng sau khi ánh xạ:", namesMap);

      return namesMap;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      message.error("Không thể tải danh sách khách hàng.");
      return {};
    }
  };

  const handleRegisterLeave = async () => {
    try {
      if (!startTime || !endTime || !reason) {
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Kiểm tra nếu endTime nằm trước startTime
      if (moment(endTime).isBefore(moment(startTime))) {
        message.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }

      // Lấy danh sách schedule đã tồn tại
      const response = await api.get("/schedules");
      const existingSchedules = response.data;

      // Kiểm tra xem có lịch nghỉ nào trùng với stylistId và khoảng thời gian đã chọn không
      const hasConflict = existingSchedules.some((schedule: any) => {
        return (
          schedule.stylist.id === parseInt(stylistId || "0") &&
          (moment(startTime).isBetween(
            schedule.startTime,
            schedule.endTime,
            undefined,
            "[]"
          ) ||
            moment(endTime).isBetween(
              schedule.startTime,
              schedule.endTime,
              undefined,
              "[]"
            ) ||
            moment(schedule.startTime).isBetween(
              startTime,
              endTime,
              undefined,
              "[]"
            ) ||
            moment(schedule.endTime).isBetween(
              startTime,
              endTime,
              undefined,
              "[]"
            ))
        );
      });

      if (hasConflict) {
        message.error("Đã 등록 ngày này rồi.");
        return;
      }

      // Lấy danh sách bookings
      const bookingsResponse = await api.get("/bookings/getBooking");
      const stylistBookings = bookingsResponse.data.filter(
        (booking: any) => booking.stylist.id === parseInt(stylistId || "0")
      );

      // Kiểm tra xem có booking nào trùng với khoảng thời gian 등록 nghỉ không
      const hasBookingConflict = stylistBookings.some((booking: any) => {
        const bookingStart = moment(
          `${booking.appointmentDate} ${booking.startTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const bookingEnd = moment(
          `${booking.appointmentDate} ${booking.endTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        return (
          moment(startTime).isBetween(
            bookingStart,
            bookingEnd,
            undefined,
            "[]"
          ) ||
          moment(endTime).isBetween(
            bookingStart,
            bookingEnd,
            undefined,
            "[]"
          ) ||
          bookingStart.isBetween(startTime, endTime, undefined, "[]") ||
          bookingEnd.isBetween(startTime, endTime, undefined, "[]")
        );
      });

      if (hasBookingConflict) {
        message.error(
          "Không thể 등록 ngày nghỉ do đã có lịch booking trong thời gian này."
        );
        return;
      }

      // Nếu không có trùng lặp, tiếp tục gọi API để tạo ngày nghỉ mới
      const data = {
        stylist_id: {
          id: stylistId,
        },
        reason,
        status: "Đang chờ xác nhận",
        startTime,
        endTime,
      };

      await api.post("/schedules", data);
      message.success("등록 ngày nghỉ thành công!");
      setIsLeaveModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi 등록 ngày nghỉ:", error);
      message.error("Lỗi khi 등록 ngày nghỉ, vui lòng thử lại.");
    }
  };

  // Khi click vào sự kiện "Nghỉ"
  const handleSelectLeaveEvent = (event: any) => {
    if (event.title.includes("Nghỉ")) {
      Modal.info({
        title: "Thông tin lịch nghỉ",
        content: (
          <div>
            <p>
              <strong>Lý do nghỉ:</strong> {event.title.replace("Nghỉ: ", "")}
            </p>
            <p>
              <strong>Thời gian bắt đầu nghỉ:</strong>{" "}
              {moment(event.start).format("YYYY-MM-DD HH:mm")}
            </p>
            <p>
              <strong>Thời gian kết thúc nghỉ:</strong>{" "}
              {moment(event.end).format("YYYY-MM-DD HH:mm")}
            </p>
            <p>
              <strong>Trạng thái:</strong> {event.status}
            </p>
          </div>
        ),
        onOk() {},
      });
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Thay đổi trạng thái booking, truyền chuỗi newStatus
      await api.put(`/bookings/${id}/status`, newStatus, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      // Sau khi thay đổi trạng thái thành công, fetch lại dữ liệu
      const namesMap = await fetchCustomerNames();
      fetchEvents(namesMap);

      message.success("Trạng thái đã được cập nhật thành công!");
    } catch (error) {
      message.error("Lỗi khi thay đổi trạng thái.");
      console.error("Lỗi:", error);
    }
  };

  const fetchEvents = async (namesMap: { [key: number]: string }) => {
    try {
      // Nếu namesMap chưa được truyền, tự gọi fetchCustomerNames để lấy namesMap
      if (!namesMap) {
        namesMap = await fetchCustomerNames();
      }
      console.log(
        "Danh sách tên khách hàng khi fetchEvents bắt đầu:",
        namesMap
      );

      // Fetch bookings
      const bookingsResponse = await api.get("/bookings/getBooking");
      const allBookings: any[] = bookingsResponse.data;
      console.log("Dữ liệu từ API /bookings/getBooking:", allBookings);

      const stylistBookings = allBookings.filter(
        (booking: any) =>
          booking.stylist && booking.stylist.id === parseInt(stylistId || "0")
      );
      console.log("Danh sách bookings của stylist:", stylistBookings);

      const formattedBookings = stylistBookings
        .map((booking: any) => {
          // Kiểm tra `undefined` cho `customer`, `appointmentDate`, `startTime`, `endTime`
          if (!booking.customer || !booking.customer.id) {
            console.warn(
              "Booking không có customer hoặc customer ID:",
              booking
            );
            return null;
          }

          if (
            !booking.appointmentDate ||
            !booking.startTime ||
            !booking.endTime
          ) {
            console.warn("Booking thiếu dữ liệu ngày giờ:", booking);
            return null;
          }

          console.log("Giá trị của appointmentDate:", booking.appointmentDate);
          console.log("Giá trị của startTime:", booking.startTime);
          console.log("Giá trị của endTime:", booking.endTime);

          const [year, month, day] = booking.appointmentDate
            .split("-")
            .map(Number);
          const [startHour, startMinute] = booking.startTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = booking.endTime.split(":").map(Number);

          const start = new Date(year, month - 1, day, startHour, startMinute);
          const end = new Date(year, month - 1, day, endHour, endMinute);

          console.log(
            `Customer ID: ${booking.customer.id}, Tên khách hàng: ${
              namesMap[booking.customer.id]
            }`
          );

          return {
            title: `Khách hàng: ${
              namesMap[booking.customer.id] || "Không tìm thấy tên khách hàng"
            }`,
            start,
            end,
            id: booking.id,
            status: booking.status,
          };
        })
        .filter(Boolean);

      // Lấy dữ liệu ngày nghỉ
      const schedulesResponse = await api.get("/schedules");
      const allSchedules: any[] = schedulesResponse.data;
      console.log("Dữ liệu từ API /schedules:", allSchedules);

      const approvedLeaves = allSchedules.filter(
        (schedule: any) =>
          schedule.stylist &&
          schedule.stylist.id === parseInt(stylistId || "0") &&
          schedule.status === "Chấp nhận"
      );

      let formattedLeaves: any[] = [];
      approvedLeaves.forEach((leave: any) => {
        formattedLeaves = [
          ...formattedLeaves,
          ...splitLeaveIntoMultipleDays(leave),
        ];
      });

      // Kết hợp bookings và leaves
      const combinedEvents = [...formattedBookings, ...formattedLeaves];
      console.log("Combined Events (Bookings + Leaves):", combinedEvents);

      // Cập nhật `events`
      setEvents(combinedEvents);
    } catch (error) {
      console.error("Lỗi khi lấy lịch:", error);
    }
  };

  // Sử dụng useEffect để gọi fetchCustomerNames và fetchEvents tuần tự
  useEffect(() => {
    fetchCustomerNames().then((namesMap) => {
      fetchEvents(namesMap);
    });
  }, []);

  interface EventType {
    title: string;
    start: Date;
    end: Date;
    status: any;
  }

  const splitLeaveIntoMultipleDays = (leave: any): EventType[] => {
    const events: EventType[] = [];
    const start = moment(leave.startTime);
    const end = moment(leave.endTime);

    // Lặp qua từng ngày từ start đến end
    while (start.isBefore(end, "day")) {
      events.push({
        title: `Nghỉ: ${leave.reason}`,
        start: start.clone().startOf("day").toDate(),
        end: start.clone().endOf("day").toDate(),
        status: leave.status,
      });
      start.add(1, "day");
    }

    events.push({
      title: `Nghỉ: ${leave.reason}`,
      start: start.clone().startOf("day").toDate(),
      end: end.toDate(),
      status: leave.status,
    });

    return events;
  };

  // fetch bookings và services
  useEffect(() => {
    const initializeData = async () => {
      const namesMap = await fetchCustomerNames();
      fetchEvents(namesMap); // Truyền namesMap vào fetchEvents
    };

    initializeData();

    const fetchServices = async () => {
      try {
        const response = await api.get("/service/getService");
        setServices(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        message.error("Không thể tải danh sách dịch vụ.");
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      console.log("Nội dung selectedEvent:", selectedEvent);
      const bookingId = selectedEvent.id;
      if (!bookingId) {
        console.error("Không tìm thấy bookingId trong selectedEvent!");
        return;
      }

      // Lọc dịch vụ dựa trên bookingId
      const relatedServices = services.filter((service) =>
        service.bookings.some((booking) => booking.id === bookingId)
      );

      if (relatedServices.length > 0) {
        const serviceNamesList = relatedServices.map((service) => service.name);
        setServiceNames(serviceNamesList); // Gán danh sách tên dịch vụ để hiển thị

        // Tính tổng giá
        const totalServicePrice = relatedServices.reduce(
          (total, service) => total + Number(service.price || 0),
          0
        );
        setPaymentAmount(totalServicePrice); // Cập nhật tổng giá
        console.log("Dịch vụ tương ứng với bookingId:", serviceNamesList);
        console.log("Tổng 요금안내:", totalServicePrice);
      } else {
        console.log("Không tìm thấy dịch vụ với bookingId:", bookingId);
      }
    }
  }, [selectedEvent, services]);

  useEffect(() => {
    if (isPaymentModalVisible && selectedEvent && services.length > 0) {
      const totalPrice = services
        .filter((service) =>
          service.bookings.some(
            (booking) => booking.bookingId === selectedEvent.bookingId
          )
        )
        .reduce((total, service) => total + Number(service.price), 0);

      // Gán giá trị mặc định cho paymentAmount nếu nó bằng 0
      if (paymentAmount === 0) {
        setPaymentAmount(totalPrice);
      }
    }
  }, [isPaymentModalVisible, selectedEvent, services]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    console.log("Events before rendering Calendar:", events);
  }, [events]);

  // Hàm xử lý khi click vào sự kiện trong lịch
  const handleSelectEvent = async (event: any) => {
    if (event.title.includes("Nghỉ")) {
      handleSelectLeaveEvent(event); // Gọi hàm xử lý lịch nghỉ
    } else {
      try {
        const bookingId = event.id;
        console.log("Booking ID:", bookingId);

        // Lấy chi tiết booking
        const response = await api.get(`/bookings/${bookingId}`);
        const bookingDetails = response.data;

        // Cập nhật selectedEvent với thông tin booking và bookingId
        setSelectedEvent({
          ...event,
          payments: bookingDetails.payments,
          bookingId: bookingId,
        });

        showModal();
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết booking:", error);
      }
    }
  };

  return (
    <div>
      <h2>Lịch Của Stylist</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: "50px" }}
        selectable
        onSelectEvent={handleSelectEvent}
        eventPropGetter={(event) => {
          // Kiểm tra nếu là ngày nghỉ
          if (event.title.includes("Nghỉ")) {
            return {
              style: {
                backgroundColor: "#ccc",
                color: "black",
                borderRadius: "8px",
                padding: "5px",
              },
            };
          } else {
            // Định dạng bình thường cho booking
            const backgroundColor = getStatusStyle(
              event.status
            ).backgroundColor;
            const color = getStatusStyle(event.status).color;

            return {
              style: {
                backgroundColor,
                color,
                borderRadius: "8px",
                padding: "5px",
              },
            };
          }
        }}
      />

      <Button type="primary" onClick={() => setIsLeaveModalVisible(true)}>
        등록 ngày nghỉ
      </Button>

      {/* Modal 등록 ngày nghỉ */}
      <Modal
        title="등록 ngày nghỉ"
        visible={isLeaveModalVisible}
        onCancel={() => setIsLeaveModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLeaveModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={async () => {
              await handleRegisterLeave();
              setIsLeaveModalVisible(false);
            }}
          >
            등록
          </Button>,
        ]}
      >
        <p>Chọn thời gian bắt đầu:</p>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          onChange={(_, dateString) =>
            setStartTime(typeof dateString === "string" ? dateString : null)
          }
        />

        <p>Chọn thời gian kết thúc:</p>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          onChange={(_, dateString) =>
            setEndTime(typeof dateString === "string" ? dateString : null)
          }
        />

        <p>Nhập lý do:</p>
        <Input
          placeholder="Nhập lý do nghỉ"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      <Modal
        title="Chi tiết lịch đặt"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedEvent && (
          <div>
            {selectedEvent.title.includes("Nghỉ") ? (
              <>
                <p>
                  <strong>Thông tin:</strong> Ngày nghỉ
                </p>
                <p>
                  <strong>Thời gian nghỉ:</strong>{" "}
                  {moment(selectedEvent.start).format("HH:mm")} -{" "}
                  {moment(selectedEvent.end).format("HH:mm")}
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
                  {selectedEvent && serviceNames.length > 0
                    ? paymentAmount.toLocaleString("vi-VN") + " VND"
                    : "Không có thông tin 요금안내"}
                </p>

                <p>
                  <strong>Trạng thái:</strong> {selectedEvent.status}
                </p>

                {/* Thêm đoạn hiển thị thông tin thanh toán */}
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

            {selectedEvent.status === "Đã xác nhận" && (
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    // Thay đổi trạng thái booking
                    handleStatusChange(selectedEvent.id, "Đã hoàn thành");

                    // Cập nhật ngay lập tức trạng thái của selectedEvent trong UI
                    setSelectedEvent((prevEvent: any) => ({
                      ...prevEvent,
                      status: "Đã hoàn thành",
                    }));
                  } catch (error) {
                    console.error("Lỗi khi hoàn thành dịch vụ:", error);
                    message.error("Lỗi khi hoàn thành dịch vụ.");
                  }
                }}
              >
                Hoàn thành dịch vụ
              </Button>
            )}

            {selectedEvent.status === "Đã hoàn thành" && (
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    setIsPaymentModalVisible(true); // Hiển thị modal thanh toán
                  }}
                >
                  Thanh toán
                </Button>

                <Modal
                  title="Chọn phương thức thanh toán"
                  visible={isPaymentModalVisible}
                  onCancel={() => setIsPaymentModalVisible(false)}
                  footer={null}
                >
                  <p>Nhập số tiền:</p>
                  <InputNumber
                    min={
                      services.length > 0
                        ? services
                            .filter((service) =>
                              service.bookings.some(
                                (booking) =>
                                  booking.bookingId === selectedEvent.bookingId
                              )
                            )
                            .reduce(
                              (total, service) => total + Number(service.price),
                              0
                            )
                        : 0
                    }
                    value={paymentAmount}
                    onChange={(value) => setPaymentAmount(value || 0)}
                    onBlur={() => {
                      // Nếu giá trị không được nhập, gán giá trị min vào paymentAmount
                      if (!paymentAmount) {
                        const totalPrice =
                          services.length > 0
                            ? services
                                .filter((service) =>
                                  service.bookings.some(
                                    (booking) =>
                                      booking.bookingId ===
                                      selectedEvent.bookingId
                                  )
                                )
                                .reduce(
                                  (total, service) =>
                                    total + Number(service.price),
                                  0
                                )
                            : 0;
                        setPaymentAmount(totalPrice);
                      }
                    }}
                  />

                  <Button
                    type="primary"
                    style={{ marginRight: "10px" }}
                    onClick={async () => {
                      // Tính tổng 요금안내 dựa trên selectedEvent
                      const totalPrice = services
                        .filter((service) =>
                          service.bookings.some(
                            (booking) => booking.id === selectedEvent.id
                          )
                        )
                        .reduce(
                          (total, service) => total + Number(service.price),
                          0
                        );

                      // Kiểm tra nếu số tiền nhập vào lớn hơn 3 lần tổng 요금안내
                      if (paymentAmount > totalPrice * 3) {
                        message.error(
                          "Số tiền không được lớn hơn 3 lần 요금안내 gốc."
                        );
                        return; // Dừng lại nếu giá quá lớn
                      }

                      try {
                        const paymentDate = selectedEvent.start
                          .toISOString()
                          .split("T")[0];
                        const paymentType = "Tiền mặt";
                        const bookingId = selectedEvent.id;

                        console.log(
                          "Thanh toán bằng tiền mặt cho Booking ID:",
                          bookingId
                        );
                        console.log("Số tiền:", paymentAmount);

                        // Tạo payment
                        await api.post("/payment/createPayment", {
                          amount: paymentAmount,
                          payment_date: paymentDate,
                          payment_type: paymentType,
                          bookingId: [bookingId],
                        });

                        handleStatusChange(selectedEvent.id, "Đã thanh toán");
                        setIsPaymentModalVisible(false);
                      } catch (error) {
                        message.error("Lỗi khi thực hiện thanh toán.");
                        console.error("Lỗi:", error);
                      }
                    }}
                  >
                    Thanh toán bằng tiền mặt
                  </Button>

                  <Button
                    type="primary"
                    onClick={async () => {
                      try {
                        const paymentDate = new Date()
                          .toISOString()
                          .split("T")[0]; // Lấy ngày hiện tại
                        const paymentType = "Chuyển khoản";
                        const bookingId = selectedEvent.bookingId;

                        localStorage.setItem("paymentDate", paymentDate);
                        localStorage.setItem("paymentType", paymentType);
                        localStorage.setItem("bookingId", bookingId);

                        console.log("Payment Date:", paymentDate);
                        console.log("Payment Type:", paymentType);
                        console.log("Booking ID:", bookingId);

                        // Lấy giá trị từ ô InputNumber
                        const amountToSend = paymentAmount;

                        console.log(
                          "Thanh toán chuyển khoản cho Booking ID:",
                          bookingId
                        );
                        console.log("Số tiền:", amountToSend);

                        // Tạo payment
                        const response = await api.post(
                          "/payment/payment-vnpay",
                          null,
                          {
                            params: {
                              amount: amountToSend, // Gửi giá tiền vào parameter amount
                              orderInfo: bookingId, // Gửi bookingId vào parameter orderInfo
                              payment_type: paymentType,
                            },
                          }
                        );

                        console.log("API Response:", response.data);
                        window.open(response.data);
                      } catch (error) {
                        message.error("Lỗi khi thực hiện thanh toán.");
                        console.error("Lỗi:", error);
                      }
                    }}
                  >
                    Chuyển khoản
                  </Button>
                </Modal>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StylistSchedule;
