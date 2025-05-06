import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { message } from "antd";
import { useUser } from "../../context/UserContext";

interface ProtectedRouteProps {
  roleRequired: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roleRequired,
  children,
}) => {
  const { user, isLoading } = useUser();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [hasShownMessage, setHasShownMessage] = useState(false); // Kiểm soát hiển thị thông báo

  useEffect(() => {
    if (isLoading) return; // Chờ cho đến khi quá trình tải kết thúc

    console.log("User hiện tại:", user);

    // Kiểm tra nếu user không tồn tại, thiếu token, hoặc role không phù hợp với roleRequired
    if (!user || !user.token || user.role !== roleRequired) {
      if (!hasShownMessage) {
        message.error("Bạn không có quyền truy cập vào trang này!");
        setHasShownMessage(true);
      }
      setRedirect("/"); // Chuyển hướng về 홈 nếu role không phù hợp
    }
  }, [user, isLoading, hasShownMessage, roleRequired]);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
