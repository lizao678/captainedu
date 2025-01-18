import { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Upload, Space } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { live } from "../../api/index";
import { BackBartment } from "../../components";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getToken } from "../../utils/index";
import moment from "moment";

const LiveUpdatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const location = useLocation();
  const [id, setId] = useState(0);
  const [liveStatus, setLiveStatus] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = Number(params.get("id"));
    if (id) {
      setId(id);
      getDetail(id);
    }
  }, [location]);

  const getDetail = (id: number) => {
    live.detail(id).then((res: any) => {
      const data = res.data;
      setImageUrl(data.coverImage);
      setLiveStatus(data.status);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        planned_start_time: moment(data.plannedStartTime),
      });
    });
  };

  const onFinish = (values: any) => {
    if (!imageUrl) {
      message.error("请上传直播封面!");
      return;
    }
    if (loading) return;
    setLoading(true);
    live
      .update(id, {
        ...values,
        plannedStartTime: values.planned_start_time.format("YYYY-MM-DD HH:mm:ss"),
        coverImage: imageUrl,
      })
      .then(() => {
        message.success("更新成功");
        navigate("/live");
      })
      .catch((err) => {
        console.error("更新直播失败", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const uploadProps: UploadProps = {
    name: "file",
    action: "/backend/v1/upload/minio",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    data: {
      category_ids: "",  // 可以为空
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === "done") {
        setImageUrl(info.file.response.data.url);
        message.success("上传成功");
      } else if (info.file.status === "error") {
        message.error("上传失败");
      }
    },
  };

  // 重开直播
  const restartLive = () => {
    if (loading) return;
    setLoading(true);
    live
      .update(id, {
        title: form.getFieldValue('title'),
        description: form.getFieldValue('description'),
        plannedStartTime: form.getFieldValue('planned_start_time').format("YYYY-MM-DD HH:mm:ss"),
        coverImage: imageUrl,
        status: 0, // 重置状态为未开始
      })
      .then(() => {
        message.success("重开直播成功");
        setLiveStatus(0); // 更新本地状态
        navigate("/live");
      })
      .catch((err) => {
        console.error("重开直播失败", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="meedu-main-body">
      <BackBartment title="编辑直播" />
      <div className="float-left mt-30">
        <Form
          form={form}
          name="live-update"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="直播标题"
            name="title"
            rules={[{ required: true, message: "请输入直播标题!" }]}
          >
            <Input placeholder="请输入直播标题" allowClear />
          </Form.Item>

          <Form.Item 
            label="直播封面" 
            required
          >
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              {...uploadProps}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="封面" style={{ width: "100%" }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="开始时间"
            name="planned_start_time"
            rules={[{ required: true, message: "请选择开始时间!" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>

          <Form.Item
            label="直播简介"
            name="description"
            rules={[{ required: true, message: "请输入直播简介!" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入直播简介" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 3, span: 21 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              {liveStatus === 2 && ( // 只有已结束的直播才显示重开按钮
                <Button type="primary" onClick={restartLive} loading={loading}>
                  重开直播
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LiveUpdatePage; 