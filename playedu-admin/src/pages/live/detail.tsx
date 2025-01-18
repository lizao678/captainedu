import { useState, useEffect } from "react";
import { Descriptions, Button, Tag } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { live } from "../../api/index";
import { BackBartment } from "../../components";
import { dateFormat } from "../../utils/index";

const LiveDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<any>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = Number(params.get("id"));
    if (id) {
      getDetail(id);
    }
  }, [location]);

  const getDetail = (id: number) => {
    if (loading) return;
    setLoading(true);
    live.detail(id)
      .then((res: any) => {
        setDetail(res.data);
      })
      .catch((err) => {
        console.error("获取直播详情失败", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="meedu-main-body">
      <BackBartment title="直播详情" />
      <div className="float-left mt-30">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="直播标题">{detail.title}</Descriptions.Item>
          <Descriptions.Item label="直播封面">
            <img src={detail.cover_image} alt="封面" style={{ maxWidth: "200px" }} />
          </Descriptions.Item>
          <Descriptions.Item label="直播状态">
            <Tag color={detail.status === 0 ? "default" : detail.status === 1 ? "processing" : "success"}>
              {detail.status === 0 ? "未开始" : detail.status === 1 ? "直播中" : "已结束"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="计划开始时间">
            {dateFormat(detail.planned_start_time)}
          </Descriptions.Item>
          <Descriptions.Item label="实际开始时间">
            {detail.actual_start_time ? dateFormat(detail.actual_start_time) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="实际结束时间">
            {detail.actual_end_time ? dateFormat(detail.actual_end_time) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="直播简介">{detail.description}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dateFormat(detail.created_at)}
          </Descriptions.Item>
        </Descriptions>
        <div className="mt-30">
          <Button type="primary" onClick={() => navigate("/live")}>
            返回列表
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveDetailPage; 