import React, { useEffect } from "react";
import { Form, Input, Row, Col, TimePicker, Button } from "antd";
import moment from "moment";

const DoctorForm = ({ onFinish, initialValues }) => {
  const [form] = Form.useForm();

  // Initialize form values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        timing: Array.isArray(initialValues.timing) && initialValues.timing.length === 2
          ? [
              moment(initialValues.timing[0], "HH:mm").isValid()
                ? moment(initialValues.timing[0], "HH:mm")
                : null,
              moment(initialValues.timing[1], "HH:mm").isValid()
                ? moment(initialValues.timing[1], "HH:mm")
                : null,
            ]
          : [null, null],
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        const formattedValues = {
          ...values,
          timing: values.timing
            ? values.timing.map((time) => moment(time).format("HH:mm")) // Convert to HH:mm format
            : [],
        };
        onFinish(formattedValues);
      }}
    >
      <h1 className="card-title">Doctor's Profile Information</h1>
      <Row gutter={20}>
        {/* First Name */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter your first name" }]}
          >
            <Input placeholder="Enter your first name" />
          </Form.Item>
        </Col>

        {/* Last Name */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Enter your last name" />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
        </Col>

        {/* Phone Number */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number",
              },
            ]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>
        </Col>

        {/* Website */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Website"
            name="website"
            rules={[{ required: false }]}
          >
            <Input placeholder="Enter your website (optional)" />
          </Form.Item>
        </Col>

        {/* Address */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input placeholder="Enter your address" />
          </Form.Item>
        </Col>

        {/* Specialization */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: "Please enter your specialization" }]}
          >
            <Input placeholder="Enter your specialization" />
          </Form.Item>
        </Col>

        {/* Experience */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Experience (Years)"
            name="experience"
            rules={[
              { required: true, message: "Please enter your experience in years" },
              {
                pattern: /^[0-9]+$/,
                message: "Experience must be a valid number",
              },
            ]}
          >
            <Input placeholder="Enter your experience (e.g., 5)" />
          </Form.Item>
        </Col>

        {/* Fees Per Consultation */}
        <Col span={12} xs={24} sm={24} lg={12}>
          <Form.Item
            label="Consultation Fees"
            name="feesPerConsultation"
            rules={[
              { required: true, message: "Please enter your consultation fees" },
              {
                pattern: /^[0-9]+$/,
                message: "Fees must be a valid number",
              },
            ]}
          >
            <Input placeholder="Enter consultation fees (e.g., 500)" />
          </Form.Item>
        </Col>

        {/* Consultation Time */}
        <Col span={12} xs={24} sm={12} lg={8}>
          <Form.Item
            label="Consultation Timing"
            name="timing"
            rules={[{ required: true, message: "Please select the consultation time" }]}
          >
            <TimePicker.RangePicker format="HH:mm" />
          </Form.Item>
        </Col>
      </Row>
      <div className="d-flex justify-content-end">
        <Button className="primary-button" type="primary" htmlType="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
};

export default DoctorForm;
