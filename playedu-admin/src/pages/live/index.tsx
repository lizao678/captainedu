import { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message, Tag, Descriptions } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { live } from "../../api/index";
import { dateFormat } from "../../utils/index";
import { PerButton } from "../../components";

const { confirm } = Modal;

interface DataType {
  id: number;
  title: string;
  status: number;
  plannedStartTime: string;
  actualStartTime: string;
  actualEndTime: string;
  createdAt: string;
  streamKey: string;
  rtmpUrl: string;
  flvUrl: string;
  hlsUrl: string;
  webrtcUrl: string;
  viewerCount: number;
  peakViewerCount: number;
}

const LivePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentLive, setCurrentLive] = useState<DataType | null>(null);

  useEffect(() => {
    getData();
  }, [page, size]);

  const getData = () => {
    if (loading) return;
    setLoading(true);
    live
      .list({
        page: page,
        size: size,
      })
      .then((res: any) => {
        setList(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("获取直播列表失败", err);
        setLoading(false);
      });
  };

  const showDetail = (record: DataType) => {
    setCurrentLive(record);
    setShowDetailModal(true);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "直播标题",
      dataIndex: "title",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: number) => (
        <Tag color={status === 0 ? "default" : status === 1 ? "processing" : "success"}>
          {status === 0 ? "未开始" : status === 1 ? "直播中" : "已结束"}
        </Tag>
      ),
    },
    {
      title: "观看人数",
      dataIndex: "viewerCount",
      render: (count: number, record: DataType) => (
        <span>{count} / {record.peakViewerCount}（当前/最高）</span>
      ),
    },
    {
      title: "计划开始时间",
      dataIndex: "plannedStartTime",
      render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
      title: "实际开始时间",
      dataIndex: "actualStartTime",
      render: (text: string) => <span>{text ? dateFormat(text) : "-"}</span>,
    },
    {
      title: "实际结束时间",
      dataIndex: "actualEndTime",
      render: (text: string) => <span>{text ? dateFormat(text) : "-"}</span>,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 300,
      render: (_, record) => (
        <Space split={<div className="divider" />}>
          <PerButton
            type="link"
            text="编辑"
            class="c-primary"
            icon={null}
            p="live.update"
            onClick={() => {
              navigate("/live/update?id=" + record.id);
            }}
            disabled={false}
          />
          <PerButton
            type="link"
            text="查看"
            class="c-primary"
            icon={null}
            p="live"
            onClick={() => showDetail(record)}
            disabled={false}
          />
          {record.status === 0 && (
            <PerButton
              type="link"
              text="开始"
              class="c-primary"
              icon={null}
              p="live.start"
              onClick={() => {
                startLive(record.id);
              }}
              disabled={false}
            />
          )}
          {record.status === 1 && (
            <PerButton
              type="link"
              text="结束"
              class="c-red"
              icon={null}
              p="live.end"
              onClick={() => {
                endLive(record.id);
              }}
              disabled={false}
            />
          )}
          <PerButton
            type="link"
            text="删除"
            class="c-red"
            icon={null}
            p="live.destroy"
            onClick={() => {
              destory(record.id);
            }}
            disabled={false}
          />
        </Space>
      ),
    },
  ];

  const destory = (id: number) => {
    confirm({
      title: "操作确认",
      icon: <ExclamationCircleFilled />,
      content: "确认删除此直播记录？",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        if (loading) return;
        setLoading(true);
        live
          .destroy(id)
          .then(() => {
            message.success("删除成功");
            getData();
          })
          .catch((err) => {
            console.error("删除直播失败", err);
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const startLive = (id: number) => {
    confirm({
      title: "操作确认",
      icon: <ExclamationCircleFilled />,
      content: "确认开始直播？",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        if (loading) return;
        setLoading(true);
        live
          .startLive(id)
          .then(() => {
            message.success("开始直播成功");
            getData();
          })
          .catch((err) => {
            console.error("开始直播失败", err);
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const endLive = (id: number) => {
    confirm({
      title: "操作确认",
      icon: <ExclamationCircleFilled />,
      content: "确认结束直播？",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        if (loading) return;
        setLoading(true);
        live
          .endLive(id)
          .then(() => {
            message.success("结束直播成功");
            getData();
          })
          .catch((err) => {
            console.error("结束直播失败", err);
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  return (
    <div className="meedu-main-body">
      <div className="float-left mb-30">
        <PerButton
          type="primary"
          text="创建直播"
          class=""
          icon={null}
          p="live.store"
          onClick={() => navigate("/live/create")}
          disabled={false}
        />
      </div>
      <div className="float-left">
        <Table
          loading={loading}
          columns={columns}
          dataSource={list}
          rowKey={(record) => record.id}
          pagination={{
            total: total,
            pageSize: size,
            current: page,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `总共 ${total} 条`,
            onChange: (page: number, pageSize: number) => {
              setPage(page);
              setSize(pageSize);
            },
          }}
        />
      </div>

      <Modal
        title="直播详情"
        open={showDetailModal}
        footer={null}
        onCancel={() => setShowDetailModal(false)}
        width={800}
      >
        {currentLive && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="直播标题">{currentLive.title}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={currentLive.status === 0 ? "default" : currentLive.status === 1 ? "processing" : "success"}>
                {currentLive.status === 0 ? "未开始" : currentLive.status === 1 ? "直播中" : "已结束"}
              </Tag>
            </Descriptions.Item>
            {currentLive.status === 0 && (
              <>
                <Descriptions.Item label="推流密钥">{currentLive.streamKey}</Descriptions.Item>
                <Descriptions.Item label="推流地址">{currentLive.rtmpUrl}</Descriptions.Item>
              </>
            )}
            {currentLive.status === 1 && (
              <>
                <Descriptions.Item label="FLV播放地址">{currentLive.flvUrl}</Descriptions.Item>
                <Descriptions.Item label="HLS播放地址">{currentLive.hlsUrl}</Descriptions.Item>
                <Descriptions.Item label="WebRTC播放地址">{currentLive.webrtcUrl}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="观看人数">
              {currentLive.viewerCount} / {currentLive.peakViewerCount}（当前/最高）
            </Descriptions.Item>
            <Descriptions.Item label="计划开始时间">{dateFormat(currentLive.plannedStartTime)}</Descriptions.Item>
            <Descriptions.Item label="实际开始时间">
              {currentLive.actualStartTime ? dateFormat(currentLive.actualStartTime) : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="实际结束时间">
              {currentLive.actualEndTime ? dateFormat(currentLive.actualEndTime) : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default LivePage; 