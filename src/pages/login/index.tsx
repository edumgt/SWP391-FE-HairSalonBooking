import React, { useState } from "react";
import { Button, Input, Form, message } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Sử dụng UserContext để lưu trạng thái
import api from "../../config/axios.ts";
import Loading from "../../components/loading/index.tsx";

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setUser } = useUser(); // Dùng setUser để lưu thông tin người dùng vào UserContext
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      console.log("Đang 로그인 với:", values);

      const response = await api.post("login", {
        username: values.username,
        password: values.password,
      });

      console.log("Kết quả 로그인:", response.data);

      if (response.status === 200) {
        const token = response.data.token;
        const fullName = response.data.fullName;
        const phone = values.username; // Sử dụng 연락처 (username) để tìm tài khoản

        console.log("Token và 연락처:", { token, phone });

        // Kiểm tra xem token có được trả về hay không
        if (!token) {
          throw new Error("Không có token từ API!");
        }

        // Lưu thông tin vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("phone", phone);

        // Lấy tất cả thông tin tài khoản
        try {
          const accountResponse = await api.get("account", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Tất cả tài khoản từ API:", accountResponse.data);

          // Duyệt qua tất cả các tài khoản để tìm tài khoản hiện tại dựa trên 연락처
          const currentUser = accountResponse.data.find(
            (user: any) => user.phone === phone
          );

          console.log("Tài khoản hiện tại:", currentUser);

          if (currentUser) {
            // Cập nhật thông tin người dùng vào UserContext và lưu accountId
            setUser({
              id: currentUser.id,
              role: currentUser.role,
              name: currentUser.fullName,
              token: token,
            });

            localStorage.setItem("accountId", currentUser.id);

            // Nếu role là CUSTOMER thì kiểm tra và gọi API tạo thông tin khách hàng nếu chưa có
            if (currentUser.role === "CUSTOMER") {
              // Kiểm tra thông tin khách hàng
              const accountDetails = await api.get(`/${currentUser.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Kiểm tra trạng thái 'deleted'
              if (accountDetails.data.deleted) {
                message.error(
                  "Tài khoản của bạn đã bị cấm và không thể 로그인."
                );
                return; // Ngừng tiến trình 로그인 nếu tài khoản bị cấm
              }

              message.success("로그인 thành công!");

              // Kiểm tra "customers" có trống hay không
              if (accountDetails.data.customers.length === 0) {
                // Nếu "customers" trống
                const customerResponse = await api.post(
                  "/customer",
                  { id: 0 },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (
                  customerResponse.status === 201 ||
                  customerResponse.status === 200
                ) {
                  message.success("Tạo thông tin khách hàng thành công!");

                  localStorage.setItem("customerId", customerResponse.data.id);
                  console.log(
                    "Customer ID đã được tạo và lưu:",
                    customerResponse.data.id
                  );
                } else {
                  message.error("Tạo thông tin khách hàng thất bại!");
                }
              } else {
                // Nếu đã có customerId thì lưu vào localStorage
                const customerId = accountDetails.data.customers[0]?.id;
                if (customerId) {
                  localStorage.setItem("customerId", customerId);
                  console.log(
                    "Customer ID đã tồn tại và được lưu:",
                    customerId
                  );
                } else {
                  console.error("Không tìm thấy customerId.");
                }
              }

              console.log("Điều hướng đến 홈");
              navigate("/");
            }

            // Nếu role là STYLIST, kiểm tra thông tin stylist
            if (currentUser.role === "STYLIST") {
              // Kiểm tra nếu stylists array tồn tại và stylist đã có ID
              if (currentUser.stylists.length > 0) {
                const stylistId = currentUser.stylists[0].id;
                localStorage.setItem("stylistId", stylistId);
                console.log("Stylist ID saved to localStorage:", stylistId);
              } else {
                // Nếu không có stylist nào tồn tại, tạo stylist mới
                const newStylist = {
                  rating: "",
                  image: "",
                  service_id: [],
                };

                try {
                  const stylistResponse = await api.post(
                    "/stylist",
                    newStylist,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (
                    stylistResponse.status === 201 ||
                    stylistResponse.status === 200
                  ) {
                    const newStylistId = stylistResponse.data.id;
                    localStorage.setItem("stylistId", newStylistId);
                    console.log(
                      "New Stylist ID created and saved:",
                      newStylistId
                    );
                  } else {
                    console.error("Lỗi khi tạo stylist mới:", stylistResponse);
                    message.error("Không thể tạo stylist mới.");
                  }
                } catch (error) {
                  console.error("Lỗi khi gọi API tạo stylist mới:", error);
                  message.error("Có lỗi khi tạo stylist.");
                }
              }
              message.success("로그인 thành công!");
              navigate("/stylistpage/stylistInfo");
            } else if (currentUser.role === "MANAGER") {
              message.success("로그인 thành công!");
              navigate("/adminpage/adminInfo");
            } else {
              console.log("Điều hướng đến 홈");
              navigate("/");
            }
          } else {
            message.error("Không tìm thấy tài khoản người dùng hiện tại!");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin tài khoản:", error);
          message.error("Đã xảy ra lỗi khi lấy thông tin tài khoản!");
        }
      } else {
        message.error("로그인 thất bại, vui lòng kiểm tra lại thông tin!");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        if (error.response.data === "Username or password invalid!") {
          message.error("Tài khoản hoặc mật khẩu sai.");
        }
      } else {
        message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
      }

    } finally {

      setLoading(false);
    }
  };

  const onFinish = (values: { username: string; password: string }) => {
    handleLogin(values);
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
          <Loading /> {/* Hiển thị component Loading khi đang loading */}
        </div>
      ) : (
        <div className="authen-template">
          <div className="authen-template__form">
            <h1 className="title">로그인</h1>
            <Form
              form={form}
              labelCol={{ span: 24 }}
              className="form"
              onFinish={onFinish}
            >
              <Form.Item
                label="연락처"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập 연락처!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  className="login-button"
                  htmlType="submit"
                >
                  로그인
                </Button>
              </Form.Item>

              <Form.Item className="register-link">
                <span onClick={() => navigate("/register")}>
                  Chưa có tài khoản? 등록 tại đây
                </span>
              </Form.Item>

              <Form.Item className="forgot-password-link">
                <span onClick={() => navigate("/reset-password")}>
                  Quên mật khẩu?
                </span>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
