import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Popconfirm,
  message,
  Col,
  Card,
  Row,
  UploadFile,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import "./index.scss";
import uploadFile from "../../../utils/file";

const { TextArea } = Input;

interface Category {
  id: number;
  nameCategory: string;
}

interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
  category: Category;
  description: string;
  date: string;
  serviceImage: string;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const AdminServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [form] = Form.useForm();

  // Fetch danh sách dịch vụ và danh mục từ API
  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        const [serviceResponse, categoryResponse] = await Promise.all([
          api.get("/service/getService"),
          api.get("/category/getCategory"),
        ]);

        const sortedServices = serviceResponse.data.sort(
          (a: Service, b: Service) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setServices(sortedServices);
        setFilteredServices(sortedServices);
        setCategories(categoryResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục hoặc dịch vụ:", error);
      }
    };

    fetchServicesAndCategories();
  }, []);

  const categoryMap: Record<number, string> = categories.reduce(
    (map, category) => {
      map[category.id] = category.nameCategory;
      return map;
    },
    {} as Record<number, string>
  );

  const handleCategoryFilter = (value: number | undefined) => {
    setSelectedCategory(value);
    filterServices(searchTerm, value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterServices(term, selectedCategory);
  };

  const filterServices = (searchTerm: string, category: number | undefined) => {
    let filtered = services;

    if (category) {
      filtered = filtered.filter(
        (service) => service.category?.id === category
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleView = (service: Service) => {
    setSelectedService(service);
  };

  const onFinish = async (values: any) => {
    try {
      const modifiedValues = {
        ...values,
        name: values.name || editingService?.name,
        description: values.description
          ? values.description.replace(/\n/g, "<br>")
          : editingService?.description,
        price:
          values.price !== undefined
            ? values.price.toString()
            : editingService?.price,
        duration:
          values.duration !== undefined
            ? values.duration.toString()
            : editingService?.duration,
        categoryId: values.categoryId || editingService?.category?.id,
      };

      let imageUrl = editingService?.serviceImage || ""; // Giữ ảnh gốc nếu không có thay đổi
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0];
        imageUrl = await uploadFile(file.originFileObj);
      }

      const currentDate = formatDate(new Date());

      const serviceData = {
        ...modifiedValues,
        category: { id: modifiedValues.categoryId },
        serviceImage: imageUrl,
        date: currentDate,
      };

      if (editingService) {
        await api.put(`/service/${editingService.id}`, serviceData);
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        await api.post("/service", serviceData);
        message.success("Thêm dịch vụ thành công!");
      }

      setOpenModal(false);
      form.resetFields();

      const response = await api.get("/service/getService");
      const sortedServices = response.data.sort(
        (a: Service, b: Service) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setServices(sortedServices);
      setFilteredServices(sortedServices);
      setEditingService(null);
    } catch (error) {
      console.error(
        "Lỗi khi tạo/cập nhật dịch vụ:",
        error.response?.data || error.message
      );
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);

    // Thiết lập fileList với hình ảnh hiện tại
    setFileList([
      {
        uid: "-1",
        name: "current_image",
        status: "done",
        url: service.serviceImage, // URL hình ảnh hiện tại
      },
    ]);

    form.setFieldsValue({
      ...service,
      description: service.description.replace(/<br>/g, "\n"), // Thay thế <br> bằng \n cho mô tả
      categoryId: service.category.id,
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/service/${id}`);
      message.success("Xóa dịch vụ thành công!");
      const response = await api.get("/service/getService");
      const sortedServices = response.data.sort(
        (a: Service, b: Service) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setServices(sortedServices);
      setFilteredServices(sortedServices);
    } catch (error) {
      message.error("Lỗi khi xóa dịch vụ!");
    }
  };

  const handleChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: string) =>
        `${new Intl.NumberFormat("vi-VN").format(Number(price))}`,
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: Category) =>
        category ? category.nameCategory : "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (date ? date.split("T")[0] : "Chưa có ngày"),
    },
    {
      title: "Hình ảnh",
      dataIndex: "serviceImage",
      key: "serviceImage",
      render: (imageUrl: string, service: Service) => (
        <img
          src={imageUrl}
          alt="Service"
          style={{ width: 50, height: 50, cursor: "pointer" }}
          onClick={() => handleView(service)}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (service: Service) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(service)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa dịch vụ này không?"
            onConfirm={() => handleDelete(service.id)}
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
    <Row gutter={16}>
      <Col span={16}>
        <h1>Quản Lý Dịch Vụ</h1>
        <div style={{ display: "flex", marginBottom: 16 }}>
          <Input
            className="custom-search-input"
            placeholder="Tìm kiếm dịch vụ"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            placeholder="Chọn danh mục"
            style={{ width: 200, marginRight: 16 }}
            onChange={handleCategoryFilter}
            allowClear
          >
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.nameCategory}
              </Select.Option>
            ))}
          </Select>

          <Button type="primary" onClick={() => setOpenModal(true)}>
            Thêm Dịch Vụ
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 20 }}
        />
      </Col>
      <Col span={8}>
        {selectedService && (
          <Card title="Thông tin dịch vụ" style={{ width: "100%" }}>
            <img
              src={selectedService.serviceImage}
              alt="Service"
              style={{ width: "100%", height: "auto", marginBottom: 16 }}
            />
            <p>
              <strong>Tên dịch vụ:</strong> {selectedService.name}
            </p>
            <p>
              <strong>Danh mục:</strong>{" "}
              {categoryMap[selectedService.category.id]}
            </p>
            <p>
              <strong>Giá:</strong>{" "}
              {new Intl.NumberFormat("vi-VN").format(
                Number(selectedService.price)
              )}
            </p>

            <p>
              <strong>Thời lượng:</strong> {selectedService.duration} phút
            </p>
            <p>
              <strong>Ngày tạo:</strong> {selectedService.date || "Chưa có"}
            </p>
          </Card>
        )}
      </Col>
      <Modal
        title={editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        visible={openModal}
        onCancel={() => {
          setOpenModal(false);
          setEditingService(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} labelCol={{ span: 24 }}>
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả dịch vụ!" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập 요금안내!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
            rules={[
              { required: true, message: "Vui lòng nhập thời lượng dịch vụ!" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[
              { required: true, message: "Vui lòng chọn danh mục dịch vụ!" },
            ]}
          >
            <Select placeholder="Chọn danh mục dịch vụ">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.nameCategory}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Upload Ảnh"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: "Vui lòng upload ảnh dịch vụ!" },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleChange}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingService ? "Cập nhật" : "Thêm dịch vụ"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default AdminServiceManagement;
