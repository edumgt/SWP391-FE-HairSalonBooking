import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  message,
  Col,
  Row,
  Select,
  Button,
  Upload,
  Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import uploadFile from "../../../utils/file";
import "./index.scss";

interface Service {
  id: number;
  name: string;
  stylists: { id: number }[];
}

interface Stylist {
  id: number;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  image: string;
  rating: string;
  service_id: number[];
}

const StylistInfo: React.FC = () => {
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<number[]>([]); // ID của dịch vụ stylist đã làm
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };

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
        passwordForm.resetFields();
      } else {
        message.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
    }
  };

  useEffect(() => {
    const fetchAndUpdateStylistRating = async () => {
      try {
        const accountId = localStorage.getItem("accountId");
        console.log("Account ID from localStorage:", accountId);

        if (!accountId) {
          console.error("Không tìm thấy accountID trong localStorage.");
          return;
        }

        // Lấy thông tin tài khoản và từ đó lấy stylistID
        const accountResponse = await api.get(`/${accountId}`);
        const accountData = accountResponse.data;
        console.log("Account Data:", accountData);

        const stylistID = accountData.stylists?.[0]?.id;
        console.log("Stylist ID:", stylistID);

        if (!stylistID) {
          console.error("Stylist ID không tồn tại trong dữ liệu tài khoản.");
          return;
        }

        // Lấy toàn bộ feedbacks
        const feedbackResponse = await api.get("/feedback/getAllFeedback");
        const feedbacks = feedbackResponse.data;
        console.log("All Feedback Data:", feedbacks);

        // Lọc feedback của stylist có ID tương ứng
        const stylistFeedbacks = feedbacks.filter(
          (feedback: any) => feedback.booking.stylist?.id === stylistID
        );
        console.log("Filtered Feedbacks for Stylist:", stylistFeedbacks);

        if (stylistFeedbacks.length > 0) {
          const totalRating = stylistFeedbacks.reduce(
            (sum: number, feedback: any) =>
              sum + parseFloat(feedback.rating_stylist),
            0
          );
          const averageRating = (totalRating / stylistFeedbacks.length).toFixed(
            1
          );

          console.log("Average Rating for Stylist:", averageRating);

          console.log("Sending PUT request to update rating for stylist:", {
            stylistID,
            rating: averageRating,
          });

          // Cập nhật rating
          await api.put(`/stylist/${stylistID}/rating`, averageRating, {
            headers: {
              "Content-Type": "text/plain",
            },
          });

          // Cập nhật rating trong state
          setStylist((prevStylist) => ({
            ...prevStylist!,
            rating: averageRating,
          }));
        } else {
          console.log("Không có feedback cho stylist này.");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật rating của stylist:", error);
        message.error("Không thể cập nhật rating của stylist.");
      }
    };

    fetchAndUpdateStylistRating();
  }, []);

  useEffect(() => {
    const fetchAccountAndServices = async () => {
      try {
        const accountId = localStorage.getItem("accountId");

        if (!accountId) {
          throw new Error("Không tìm thấy accountId.");
        }

        const responseAccount = await api.get(`/${accountId}`);
        console.log("Current User Data:", responseAccount.data);

        const currentUser = responseAccount.data;

        if (currentUser && currentUser.role === "STYLIST") {
          const stylistID = currentUser.stylists[0].id;

          // Lấy toàn bộ dịch vụ
          const responseAllServices = await api.get("/service/getService");
          setAllServices(responseAllServices.data);

          // Lọc những dịch vụ stylist đã làm
          const servicesForStylist = responseAllServices.data.filter(
            (service: Service) =>
              service.stylists.some((stylist) => stylist.id === stylistID)
          );

          // Lưu ID của các dịch vụ mà stylist đã làm
          const selectedServiceIds = servicesForStylist.map(
            (service) => service.id
          );

          setFilteredServices(selectedServiceIds);

          form.setFieldsValue({
            fullName: currentUser.fullName,
            gender: currentUser.gender || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            image: currentUser.stylists[0].image || "",
            rating: currentUser.stylists[0].rating || "",
            service_id: selectedServiceIds,
          });

          setStylist({
            id: stylistID,
            fullName: currentUser.fullName,
            gender: currentUser.gender || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            image: currentUser.stylists[0].image || "",
            rating: currentUser.stylists[0].rating || "",
            service_id: selectedServiceIds,
          });
        }

        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            "Lỗi khi lấy thông tin tài khoản và dịch vụ:",
            error.message
          );
          message.error(
            "Lỗi khi lấy thông tin tài khoản và dịch vụ: " + error.message
          );
        } else {
          console.error("Lỗi không xác định:", error);
          message.error(
            "Lỗi không xác định khi lấy thông tin tài khoản và dịch vụ"
          );
        }
      }
    };

    fetchAccountAndServices();
  }, [form]);

  const handleEditClick = () => {
    setEditable(true);
  };

  const handleChange = ({ fileList: newFileList }: any) =>
    setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const onFinish = async (values: Stylist) => {
    try {
      const accountId = localStorage.getItem("accountId");
      const stylistID = stylist?.id;
      console.log(accountId + "    " + stylistID);

      let imageUrl = stylist?.image; // Giữ URL hiện tại nếu không có ảnh mới
      if (fileList.length > 0) {
        const file = fileList[0];
        imageUrl = await uploadFile(file.originFileObj); // Upload ảnh mới
      }

      // PUT request cho fullName, email, gender
      await api.put(`/${accountId}`, {
        fullName: values.fullName,
        email: values.email,
        gender: values.gender,
      });

      // PUT request cho hình ảnh và rating
      await api.put(`/stylist/${stylistID}`, {
        id: stylistID,
        image: imageUrl ?? "",
        service_id: values.service_id,
      });

      // Cập nhật lại stylist state để hiển thị hình ảnh mới ngay lập tức
      setStylist((prevStylist) => ({
        ...prevStylist!,
        image: imageUrl ?? "",
      }));

      message.success("Cập nhật thông tin stylist thành công!");
      setEditable(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      message.error("Cập nhật thông tin thất bại, vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Row gutter={16}>
      <Col span={24}>
        <h1>Thông Tin Stylist</h1>
        {stylist && (
          <Form form={form} onFinish={onFinish}>
            <Form.Item label="Tên của bạn" name="fullName">
              <Input disabled={!editable} />
            </Form.Item>

            <Form.Item label="연락처" name="phone">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Email của bạn" name="email">
              <Input disabled={!editable} />
            </Form.Item>

            <Form.Item label="Giới tính của bạn" name="gender">
              <Select disabled={!editable}>
                <Select.Option value="Male">Nam</Select.Option>
                <Select.Option value="Female">Nữ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Hình ảnh" name="image">
              {!editable ? (
                <img
                  src={stylist?.image}
                  alt="Stylist Image"
                  className="stylist-image"
                />
              ) : (
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleChange}
                  beforeUpload={() => false}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              )}
            </Form.Item>

            <Form.Item label="Rating" name="rating">
              <Input disabled />
            </Form.Item>

            {/* Dịch vụ - Hiển thị tất cả và chọn các dịch vụ stylist đã làm */}
            <Form.Item label="Dịch vụ" name="service_id">
              <Select
                mode="multiple"
                disabled={!editable}
                placeholder="Chọn dịch vụ"
              >
                {allServices.map((service) => (
                  <Select.Option key={service.id} value={service.id}>
                    {service.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Button kích hoạt chế độ chỉnh sửa */}
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
        )}

        {/* Modal Đổi Mật Khẩu */}
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
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              ]}
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
      </Col>
    </Row>
  );
};

export default StylistInfo;
