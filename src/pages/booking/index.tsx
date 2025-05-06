import React, { useState, useEffect, useRef } from "react";
import "./index.scss";
import { DatePicker, Button, Select, message } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import api from "../../config/axios";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Loading from "../../components/loading";
import { useNavigate } from "react-router-dom"; 
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Option } = Select;

const Booking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedServices, setSelectedServices] = useState<number[]>([]); // Chọn nhiều service
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [serviceDurations, setServiceDurations] = useState<number[]>([]); // Lưu trữ duration của nhiều service
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [availableStylists, setAvailableStylists] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState([
    { time: "9:00 AM", status: "available" },
    { time: "10:00 AM", status: "available" },
    { time: "11:00 AM", status: "available" },
    { time: "12:00 PM", status: "available" },
    { time: "13:00 PM", status: "available" },
    { time: "14:00 PM", status: "available" },
    { time: "15:00 PM", status: "available" },
    { time: "16:00 PM", status: "available" },
    { time: "17:00 PM", status: "available" },
    { time: "18:00 PM", status: "available" },
    { time: "19:00 PM", status: "available" },
  ]);
  const stylistsRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const accountId = localStorage.getItem("accountId");
    console.log("AccountId:", accountId);
    if (!accountId) {
      // Yêu cầu 로그인
      message.error("Vui lòng 로그인 để sử dụng dịch vụ");
      return;
    }

    const fetchCustomerId = async () => {
      try {
        const response = await api.get("/customer");
        setCustomerId(response.data[0].id);
      } catch (error) {
        console.error("Lỗi khi lấy customer_id:", error);
        message.error("Không thể lấy thông tin khách hàng.");
      }
    };
    fetchCustomerId();

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

  // Tính toán stylist khi thay đổi dịch vụ hoặc ngày
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const response = await api.get("/account");
        const stylistAccounts = response.data.filter(
          (account: any) => account.role === "STYLIST"
        );

        const schedulesResponse = await api.get("/schedules");

        const updatedAvailableStylists = stylistAccounts.filter(
          (stylist: any) => {
            // Lấy danh sách lịch nghỉ của stylist
            const approvedLeaves = schedulesResponse.data.filter(
              (schedule: any) =>
                schedule.stylist.id === stylist.id &&
                schedule.status === "Chấp nhận"
            );

            console.log(
              `Stylist ${stylist.fullName} - Approved Leaves:`,
              approvedLeaves
            );

            // Kiểm tra nếu stylist có nghỉ vào ngày được chọn
            const isOnLeave = approvedLeaves.some((leave: any) => {
              const leaveStart = dayjs(leave.startTime).startOf("day");
              const leaveEnd = dayjs(leave.endTime).endOf("day");
              const isLeave = selectedDate.isBetween(
                leaveStart,
                leaveEnd,
                null,
                "[]"
              );
              console.log(
                `Stylist ${
                  stylist.fullName
                } - Checking leave on ${selectedDate.format(
                  "YYYY-MM-DD"
                )} - Leave Start: ${leaveStart.format(
                  "YYYY-MM-DD"
                )}, Leave End: ${leaveEnd.format(
                  "YYYY-MM-DD"
                )}, isOnLeave: ${isLeave}`
              );
              return isLeave;
            });

            // Chỉ bao gồm stylist không có lịch nghỉ vào ngày đã chọn
            return !isOnLeave;
          }
        );

        // Lưu danh sách stylist vào stylistsRef và cập nhật danh sách khả dụng
        stylistsRef.current = updatedAvailableStylists;
        setAvailableStylists([...updatedAvailableStylists]);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách stylist:", error);
        message.error("Không thể tải danh sách stylist.");
      }
    };

    fetchStylists();
  }, [selectedDate, selectedServices]);

  const toggleSlotVisibility = () => {
    setShowAllSlots(!showAllSlots); // Đảo ngược trạng thái hiển thị
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    // Clear dịch vụ và stylist khi thay đổi ngày
    setSelectedServices([]);
    setSelectedStylist(null);

    // Reset thời gian và giá dự kiến
    setEstimatedDuration(0);
    setEstimatedPrice(0);

    // Logic để đánh dấu slot ở quá khứ là unavailable nếu ngày được chọn là ngày hiện tại
    const currentDate = dayjs();
    const selectedDay = dayjs(date).startOf("day");

    console.log("Ngày hiện tại:", currentDate.format("YYYY-MM-DD HH:mm:ss"));
    console.log("Ngày được chọn:", selectedDay.format("YYYY-MM-DD"));

    // Kiểm tra xem ngày được chọn có phải là hôm nay không
    if (selectedDay.isSame(currentDate.startOf("day"))) {
      console.log("Ngày hiện tại được chọn, kiểm tra các slot thời gian...");

      // Nếu đúng là ngày hiện tại, cập nhật trạng thái slot dựa trên giờ hiện tại
      const updatedTimeSlots = timeSlots.map((slot) => {
        const slotTime = dayjs(
          `${selectedDay.format("YYYY-MM-DD")} ${slot.time}`,
          ["YYYY-MM-DD h:mm A"]
        );

        console.log(
          `Kiểm tra slot: ${slot.time}, SlotTime: ${slotTime.format(
            "HH:mm:ss"
          )}`
        );
        console.log(
          "Slot này đã qua thời gian hiện tại?",
          slotTime.isBefore(currentDate)
        );

        // Nếu slot đã qua thời gian hiện tại thì đánh dấu là unavailable
        if (slotTime.isBefore(currentDate)) {
          console.log(`Slot ${slot.time} đã qua, đánh dấu là unavailable`);
          return { ...slot, status: "unavailable" };
        }
        return slot;
      });

      setTimeSlots(updatedTimeSlots); // Cập nhật lại các slot với trạng thái mới
      console.log("Danh sách slot sau khi cập nhật:", updatedTimeSlots);
    } else {
      console.log(
        "Ngày khác hôm nay được chọn, reset tất cả các slot thành available"
      );

      // Nếu chọn ngày khác hôm nay thì reset trạng thái các slot
      const resetTimeSlots = timeSlots.map((slot) => ({
        ...slot,
        status: "available", // Reset tất cả các slot thành available cho ngày mới
      }));
      setTimeSlots(resetTimeSlots); // Cập nhật các slot
      console.log("Danh sách slot sau khi reset:", resetTimeSlots);
    }
  };

  // Kiểm tra stylist và ánh xạ đúng lịch nghỉ
  const handleServiceChange = async (values: number[]) => {
    setSelectedServices(values);

    // Tính tổng duration từ các dịch vụ đã chọn
    const selectedDurations = values.map((id) => {
      const selectedService = services.find((service) => service.id === id);
      return selectedService ? selectedService.duration : 0;
    });
    setServiceDurations(selectedDurations);

    // Tính toán thời gian dự kiến và giá dự kiến
    const estimatedDuration = values.reduce((acc, id) => {
      const service = services.find((s) => s.id === id);
      return acc + (service ? parseInt(service.duration) : 0); // Đảm bảo duration là số nguyên
    }, 0);

    const estimatedPrice = values.reduce((acc, id) => {
      const service = services.find((s) => s.id === id);
      return acc + (service ? parseInt(service.price) : 0); // Đảm bảo price là số nguyên
    }, 0);

    console.log("Estimated duration:", estimatedDuration, "minutes");
    console.log("Estimated price:", estimatedPrice, "VND");

    setEstimatedDuration(estimatedDuration);
    setEstimatedPrice(estimatedPrice);

    let commonStylistIds = [];

    console.log("Selected Service IDs:", values);

    try {
      // Duyệt qua từng dịch vụ được chọn và gọi API để lấy stylist có thể làm dịch vụ
      for (const serviceId of values) {
        const response = await api.get(`/service/${serviceId}`);
        const serviceData = response.data;

        console.log(`Service Data for Service ID ${serviceId}:`, serviceData);

        // Lấy danh sách stylist account_id từ mỗi dịch vụ trả về
        const stylistIdsForService = serviceData.stylists.map(
          (stylist) => stylist.id
        );
        console.log(
          `Stylist IDs for Service ID ${serviceId}:`,
          stylistIdsForService
        );

        if (commonStylistIds.length === 0) {
          // Gán danh sách stylist của dịch vụ đầu tiên vào commonStylistIds
          commonStylistIds = stylistIdsForService;
        } else {
          // Lọc những stylist xuất hiện trong tất cả các dịch vụ đã chọn
          commonStylistIds = commonStylistIds.filter((id) =>
            stylistIdsForService.includes(id)
          );
        }
      }

      console.log("Common Stylist IDs after filtering:", commonStylistIds);

      // Kiểm tra nếu stylist hiện tại không nằm trong danh sách stylist có thể làm tất cả dịch vụ, xóa stylist đã chọn
      if (selectedStylist && !commonStylistIds.includes(selectedStylist)) {
        setSelectedStylist(null); // Xóa stylist đã chọn
        message.warning(
          "Stylist đã chọn không thể làm tất cả dịch vụ đã chọn."
        );
      }

      // Lấy danh sách tất cả account
      const accountResponse = await api.get(`/account`);
      const allAccounts = accountResponse.data;

      console.log("All Accounts:", allAccounts);

      // **Ánh xạ lại stylistID đúng với accountID và fullName**
      let availableStylists = commonStylistIds
        .map((stylistId) => {
          // Tìm account theo stylistId
          const account = allAccounts.find((acc) =>
            acc.stylists.some((stylist) => stylist.id === stylistId)
          );
          console.log(
            `Stylist ID ${stylistId} ánh xạ với account ID: ${
              account ? account.id : "Không tìm thấy"
            }, FullName: ${account ? account.fullName : "Không tìm thấy"}`
          );

          return account
            ? {
                id: stylistId,
                accountId: account.id,
                fullName: account.fullName,
              } // Sử dụng stylistId
            : null;
        })
        .filter(Boolean); // Loại bỏ stylist null nếu không tìm thấy

      console.log("Render based on Common Stylist IDs:", availableStylists);

      // **Kiểm tra stylist có slot khả dụng**
      const updatedAvailableStylists = [];
      for (const stylist of availableStylists) {
        const stylistId = stylist.id;

        // Lấy booking và lịch nghỉ của stylist
        const bookingsResponse = await api.get("/bookings/getBooking");
        const stylistBookings = bookingsResponse.data.filter(
          (booking) => booking.stylist.id === stylistId
        );

        const schedulesResponse = await api.get("/schedules");
        const approvedLeaves = schedulesResponse.data.filter(
          (schedule) =>
            schedule.stylist.id === stylistId && schedule.status === "Chấp nhận"
        );

        console.log(
          `Lịch nghỉ của stylist ${stylist.fullName}:`,
          approvedLeaves
        );

        // Kiểm tra nếu stylist còn slot nào khả dụng trong ngày được chọn
        let hasAvailableSlot = false;
        timeSlots.forEach((slot) => {
          const slotStart = dayjs(
            `${selectedDate.format("YYYY-MM-DD")} ${slot.time}`,
            ["YYYY-MM-DD h:mm A"]
          );

          const isOnLeave = approvedLeaves.some((leave) => {
            const leaveStart = dayjs(leave.startTime);
            const leaveEnd = dayjs(leave.endTime);
            console.log(
              `Checking leave for stylist ${stylist.fullName}: slotStart: ${slotStart}, leaveStart: ${leaveStart}, leaveEnd: ${leaveEnd}`
            );
            return (
              slotStart.isBetween(leaveStart, leaveEnd, null, "[)") ||
              slotStart.isSame(leaveStart)
            );
          });

          const isBooked = stylistBookings.some((booking) => {
            const bookingStart = dayjs(
              `${booking.appointmentDate} ${booking.startTime}`,
              "YYYY-MM-DD HH:mm:ss"
            );
            const bookingEnd = dayjs(
              `${booking.appointmentDate} ${booking.endTime}`,
              "YYYY-MM-DD HH:mm:ss"
            );
            return (
              slotStart.isSame(bookingStart) ||
              slotStart.isBetween(bookingStart, bookingEnd, null, "[)")
            );
          });

          console.log(
            `Slot: ${slot.time}, Booked: ${isBooked}, On Leave: ${isOnLeave}`
          );

          if (!isBooked && !isOnLeave) {
            hasAvailableSlot = true;
          }
        });

        console.log(
          `Stylist: ${stylist.fullName}, Has Available Slot: ${hasAvailableSlot}`
        );

        // Nếu stylist có ít nhất 1 slot khả dụng, thêm vào danh sách
        if (hasAvailableSlot) {
          updatedAvailableStylists.push(stylist);
        }
      }

      console.log("Updated available stylists:", updatedAvailableStylists);

      // Cập nhật danh sách stylist để render
      setAvailableStylists(updatedAvailableStylists);
    } catch (error) {
      console.error("Lỗi khi lọc stylist:", error);
      message.error("Không thể lọc stylist.");
    }
  };

  const handleStylistClick = async (stylistID: number) => {
    setSelectedStylist(stylistID);
    console.log("Stylist được chọn:", stylistID);

    // Xử lý chỉ cần cập nhật timeSlots mà không làm thay đổi danh sách stylist
    try {
      const bookingsResponse = await api.get("/bookings/getBooking");
      const stylistBookings = bookingsResponse.data.filter(
        (booking: any) => booking.stylist.id === stylistID
      );

      const schedulesResponse = await api.get("/schedules");
      const approvedLeaves = schedulesResponse.data.filter(
        (schedule: any) =>
          schedule.stylist.id === stylistID && schedule.status === "Chấp nhận"
      );

      // Lấy ngày và thời gian hiện tại
      const currentDate = dayjs();
      const selectedDay = selectedDate.startOf("day");

      // Cập nhật trạng thái các slot
      const updatedTimeSlots = timeSlots.map((slot) => {
        const slotStart = dayjs(
          `${selectedDate.format("YYYY-MM-DD")} ${slot.time}`,
          ["YYYY-MM-DD h:mm A"]
        );

        // Kiểm tra nếu slot đã qua thời gian hiện tại
        let isPastTime = false;
        if (
          selectedDay.isSame(currentDate.startOf("day")) &&
          slotStart.isBefore(currentDate)
        ) {
          console.log(
            `Slot ${slot.time} đã qua thời gian hiện tại, đánh dấu là unavailable.`
          );
          isPastTime = true;
        }

        const isOnLeaveSlot = approvedLeaves.some((leave: any) => {
          const leaveStart = dayjs(leave.startTime);
          const leaveEnd = dayjs(leave.endTime);
          return (
            slotStart.isBetween(leaveStart, leaveEnd, null, "[)") ||
            slotStart.isSame(leaveStart)
          );
        });

        const isBooked = stylistBookings.some((booking: any) => {
          const bookingStart = dayjs(
            `${booking.appointmentDate} ${booking.startTime}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          const bookingEnd = dayjs(
            `${booking.appointmentDate} ${booking.endTime}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return (
            slotStart.isSame(bookingStart) ||
            slotStart.isBetween(bookingStart, bookingEnd, null, "[)")
          );
        });

        return {
          ...slot,
          status:
            isPastTime || isBooked || isOnLeaveSlot
              ? "unavailable"
              : "available",
        };
      });

      setTimeSlots(updatedTimeSlots);
      console.log("Updated time slots:", updatedTimeSlots);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách booking hoặc lịch nghỉ:", error);
      message.error("Không thể tải danh sách booking hoặc lịch nghỉ.");
    }
  };

  const handleTimeSlotChange = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleSubmit = async () => {
    if (
      !selectedTimeSlot ||
      selectedServices.length === 0 ||
      selectedStylist === null ||
      !localStorage.getItem("customerId") // Kiểm tra customerId
    ) {
      message.error("Vui lòng chọn đầy đủ các thông tin!");
      return;
    }

    try {
      setLoading(true);
      const customerIdFromLocalStorage = localStorage.getItem("customerId");

      console.log(
        "Customer ID đang được truyền vào API:",
        customerIdFromLocalStorage
      );
      let commonStylistIds = [];

      for (const serviceId of selectedServices) {
        const response = await api.get(`/service/${serviceId}`);
        const serviceData = response.data;

        const stylistIdsForService = serviceData.stylists.map(
          (stylist) => stylist.id
        );

        if (commonStylistIds.length === 0) {
          commonStylistIds = stylistIdsForService;
        } else {
          commonStylistIds = commonStylistIds.filter((id) =>
            stylistIdsForService.includes(id)
          );
        }
      }

      console.log("Common Stylist IDs after filtering:", commonStylistIds);

      const stylistID = selectedStylist;

      if (!stylistID) {
        message.error("Không tìm thấy stylist ID.");
        return;
      }

      const selectedDurations = await Promise.all(
        selectedServices.map(async (serviceId) => {
          const response = await api.get(`/service/${serviceId}`);
          const serviceData = response.data;

          return parseInt(serviceData.duration);
        })
      );

      const totalDuration = selectedDurations.reduce(
        (acc, duration) => acc + duration,
        0
      );

      const appointmentDate = selectedDate.format("YYYY-MM-DD");
      const startTime = dayjs(`${appointmentDate} ${selectedTimeSlot}`, [
        "YYYY-MM-DD h:mm A",
      ]);

      const endTime = startTime.add(totalDuration, "minute");

      console.log("Start time:", startTime.format("HH:mm:ss"));
      console.log("End time:", endTime.format("HH:mm:ss"));
      console.log("Customer ID:", customerIdFromLocalStorage);
      console.log("Stylist ID:", stylistID);
      console.log("Selected Services:", selectedServices);

      const bookingsResponse = await api.get("/bookings/getBooking");
      const stylistBookings = bookingsResponse.data.filter(
        (booking) =>
          booking.stylist.id === stylistID &&
          booking.appointmentDate === appointmentDate
      );

      console.log("Danh sách lịch đã đặt cho stylist:", stylistBookings);

      const isOverlapping = stylistBookings.some((booking) => {
        const bookingStart = dayjs(
          `${booking.appointmentDate} ${booking.startTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const bookingEnd = dayjs(
          `${booking.appointmentDate} ${booking.endTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        console.log(
          "Lịch cũ - Start:",
          bookingStart.format("HH:mm:ss"),
          "End:",
          bookingEnd.format("HH:mm:ss")
        );
        console.log(
          "Lịch mới - Start:",
          startTime.format("HH:mm:ss"),
          "End:",
          endTime.format("HH:mm:ss")
        );

        // Sử dụng isSameOrAfter và isSameOrBefore để kiểm tra
        const isOverlap =
          (startTime.isSameOrAfter(bookingStart) &&
            startTime.isSameOrBefore(bookingEnd)) ||
          (endTime.isSameOrAfter(bookingStart) &&
            endTime.isSameOrBefore(bookingEnd)) ||
          (startTime.isBefore(bookingStart) && endTime.isAfter(bookingEnd));

        if (isOverlap) {
          console.log("Trùng lịch với booking:", booking);
        }

        return isOverlap;
      });

      if (isOverlapping) {
        message.error("Thời gian đã chọn trùng với lịch đặt khác!");
        return;
      }

      const closingTime = dayjs(
        `${appointmentDate} 20:00:00`,
        "YYYY-MM-DD HH:mm:ss"
      );
      if (endTime.isAfter(closingTime)) {
        message.error("Không được đặt dịch vụ quá 20h");
        return;
      }

      const bookingData = {
        service_id: selectedServices,
        stylist_id: { id: stylistID },
        customer_id: { id: customerIdFromLocalStorage },
        appointmentDate: appointmentDate,
        startTime: startTime.format("HH:mm:ss"),
        endTime: endTime.format("HH:mm:ss"),
        status: "Đã xác nhận",
      };

      console.log("Booking data to be sent:", bookingData);

      const response = await api.post("/bookings/createBooking", bookingData);

      if (response.status === 200) {
        message.success("Đặt lịch thành công!");

        setSelectedDate(dayjs());
        setSelectedServices([]);
        setSelectedStylist(null);
        setSelectedTimeSlot(null);
        setEstimatedDuration(0);
        setEstimatedPrice(0);
        setShowAllSlots(false);
        navigate("/customer/view-booking");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đặt lịch:", error);
      message.error("Đặt lịch không thành công, vui lòng thử lại.");
    } finally{
      setLoading(false);
      
    }
  };

  // Logic để vô hiệu hóa ngày trong quá khứ
  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf("day");
  };

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
       <Loading/> {/* Hiển thị component Loading khi đang loading */}
     </div>
   ) : (


    <div className="booking-wrapper">
      <h1>Đặt Lịch</h1>

      <div className="form-group">
        <label>Thời gian đặt lịch</label>
        <div className="date-picker">
          <DatePicker
            value={selectedDate}
            format="MM/DD/YYYY"
            onChange={handleDateChange}
            disabledDate={disabledDate}
            allowClear={false}
          />
          <span className="day-of-week">
            {selectedDate.format("dddd, MM/DD/YYYY")}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Chọn dịch vụ</label>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Chọn dịch vụ"
          value={selectedServices}
          onChange={handleServiceChange}
        >
          {services.map((service) => (
            <Option key={service.id} value={service.id}>
              {service.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Hiển thị thời gian dự kiến và giá dự kiến */}
      <div className="estimated-info">
        <p>
          Thời gian dự kiến:{" "}
          {estimatedDuration >= 60
            ? `${Math.floor(estimatedDuration / 60)} giờ ${
                estimatedDuration % 60
              } phút`
            : `${estimatedDuration} phút`}
        </p>
        <p>Giá dự kiến: {estimatedPrice.toLocaleString()} VND</p>
      </div>

      <div className="form-group">
        <label>Chọn Hair Stylist</label>
        {(() => {
          console.log("Available Stylists for rendering:", availableStylists);
          return null;
        })()}
        <Select
          value={selectedStylist}
          onChange={handleStylistClick}
          placeholder="Chọn Hair Stylist"
          className="stylist-select"
        >
          {availableStylists.map((stylist) => (
            <Option value={stylist.id} key={stylist.id}>
              {stylist.fullName}
            </Option>
          ))}
        </Select>
      </div>

      <div className="form-group">
        <Button
          onClick={toggleSlotVisibility}
          type="primary"
          className="submit-button view-slots-button"
          size="large"
        >
          {showAllSlots ? "Ẩn khung giờ" : "Xem khung giờ phục vụ"}
        </Button>

        {/* Hiển thị tất cả các slot nếu showAllSlots là true */}
        {showAllSlots && (
          <div className="time-slot-wrapper">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className={`time-slot ${slot.status} ${
                  selectedTimeSlot === slot.time ? "selected" : ""
                }`}
                onClick={() =>
                  slot.status === "available" && handleTimeSlotChange(slot.time)
                }
              >
                <span>{slot.time}</span>
                <span>
                  {slot.status === "available" ? " Còn chỗ" : " Hết chỗ"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị slot chỉ sau khi đã chọn stylist */}
      {selectedStylist && (
        <div className="form-group">
          <label>Chọn khung giờ phục vụ</label>
          <div className="time-slot-wrapper">
            {timeSlots
              .filter((slot) => slot.status === "available") // Chỉ hiển thị slot còn chỗ
              .map((slot) => (
                <div
                  key={slot.time}
                  className={`time-slot ${slot.status} ${
                    selectedTimeSlot === slot.time ? "selected" : ""
                  }`}
                  onClick={() =>
                    slot.status === "available" &&
                    handleTimeSlotChange(slot.time)
                  }
                >
                  <span>{slot.time}</span>
                  <span>
                    {slot.status === "available" ? " Còn chỗ" : " Hết chỗ"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <Button
        type="primary"
        className="submit-button"
        onClick={handleSubmit}
        size="large"
        
      >
        Đặt lịch ngay
      </Button>
    </div>)}
    </div>
  );
};

export default Booking;
