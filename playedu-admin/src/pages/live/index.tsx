import { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message, Tag, Descriptions, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { live } from "../../api/index";
import { dateFormat } from "../../utils/index";
import { PerButton } from "../../components";

const { confirm } = Modal;

// 直播状态常量
const LIVE_STATUS = {
  NOT_STARTED: 0,
  LIVING: 1,
  ENDED: 2,
} as const;

type LiveStatus = typeof LIVE_STATUS[keyof typeof LIVE_STATUS];

// 状态显示配置
const STATUS_CONFIG: Record<LiveStatus, { text: string; color: string }> = {
  [LIVE_STATUS.NOT_STARTED]: { text: "未开始", color: "default" },
  [LIVE_STATUS.LIVING]: { text: "直播中", color: "processing" },
  [LIVE_STATUS.ENDED]: { text: "已结束", color: "success" },
};

interface DataType {
  id: number;
  title: string;
  status: LiveStatus;
  plannedStartTime: string;
  actualStartTime: string;
  actualEndTime: string;
  createdAt: string;
  streamKey: string;
  rtmpUrl: string;
  flvUrl: string;
  hlsUrl: string;
  webrtcUrl: string;
  description: string;
  viewerCount: number;
  peakViewerCount: number;
  coverImage: string;
}

interface ActionItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
  permission: string;
  danger?: boolean;
}

const LivePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<DataType[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentLive, setCurrentLive] = useState<DataType | null>(null);
  const [operatingId, setOperatingId] = useState<number | null>(null);

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
      })
      .catch((err) => {
        console.error("获取直播列表失败", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const showDetail = (record: DataType) => {
    setCurrentLive(record);
    setShowDetailModal(true);
  };

  const handleOperation = (
    id: number,
    operation: () => Promise<any>,
    successMessage: string
  ) => {
    if (operatingId !== null) return;
    setOperatingId(id);
    operation()
      .then(() => {
        message.success(successMessage);
        getData();
      })
      .catch((err) => {
        console.error("操作失败", err);
      })
      .finally(() => {
        setOperatingId(null);
      });
  };

  const destory = (id: number) => {
    confirm({
      title: "操作确认",
      icon: <ExclamationCircleFilled />,
      content: "确认删除此直播记录？",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        handleOperation(id, () => live.destroy(id), "删除成功");
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
        handleOperation(id, () => live.startLive(id), "开始直播成功");
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
        handleOperation(id, () => live.endLive(id), "结束直播成功");
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "直播标题",
      width: 250,
      dataIndex: "title",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: LiveStatus) => {
        const config = STATUS_CONFIG[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "观看人数",
      dataIndex: "viewerCount",
      width: 150,
      render: (count: number, record: DataType) => (
        <span>{count} / {record.peakViewerCount}（当前/最高）</span>
      ),
    },
    {
      title: "计划开始时间",
      dataIndex: "plannedStartTime",
      width: 180,
      render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
      title: "实际开始时间",
      dataIndex: "actualStartTime",
      width: 180,
      render: (text: string) => <span>{text ? dateFormat(text) : "-"}</span>,
    },
    {
      title: "实际结束时间",
      dataIndex: "actualEndTime",
      width: 180,
      render: (text: string) => <span>{text ? dateFormat(text) : "-"}</span>,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 180,
      render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: '编辑',
            onClick: () => navigate("/live/update?id=" + record.id),
            disabled: operatingId === record.id,
            permission: 'live.update'
          },
          {
            key: 'view',
            label: '查看',
            onClick: () => showDetail(record),
            disabled: operatingId === record.id,
            permission: 'live'
          }
        ];

        if (record.status === LIVE_STATUS.NOT_STARTED) {
          items.push({
            key: 'start',
            label: '开始',
            onClick: () => startLive(record.id),
            disabled: operatingId === record.id,
            permission: 'live.start'
          });
        }

        if (record.status === LIVE_STATUS.LIVING) {
          items.push({
            key: 'end',
            label: '结束',
            onClick: () => endLive(record.id),
            disabled: operatingId === record.id,
            permission: 'live.end'
          });
        }

        items.push({
          key: 'delete',
          label: '删除',
          onClick: () => destory(record.id),
          disabled: operatingId === record.id,
          permission: 'live.destroy'
        });

        return (
          <Space>
            {items.map((item) => (
              <PerButton
                key={item.key}
                type="link"
                text={item.label}
                class={item.key === 'delete' ? "c-red" : "c-primary"}
                icon={null}
                p={item.permission}
                onClick={item.onClick}
                disabled={item.disabled}
              />
            ))}
          </Space>
        );
      },
    },
  ];

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
          <div style={{ display: 'flex', gap: '20px' }}>
            <Descriptions column={1} bordered style={{ flex: 1 }}>
              <Descriptions.Item label="直播标题">{currentLive.title}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_CONFIG[currentLive.status].color}>
                  {STATUS_CONFIG[currentLive.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="直播简介">{currentLive.description}</Descriptions.Item>
              {currentLive.status === LIVE_STATUS.NOT_STARTED && (
                <>
                  <Descriptions.Item label="推流密钥">{currentLive.streamKey}</Descriptions.Item>
                  <Descriptions.Item label="推流地址">{currentLive.rtmpUrl}</Descriptions.Item>
                </>
              )}
              {currentLive.status === LIVE_STATUS.LIVING && (
                <>
                  <Descriptions.Item label="推流密钥">{currentLive.streamKey}</Descriptions.Item>
                  <Descriptions.Item label="推流地址">{currentLive.rtmpUrl}</Descriptions.Item>
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
            <div style={{ width: '200px' }}>
              <img 
                src={currentLive.coverImage} 
                alt="直播封面" 
                style={{ 
                  width: '100%', 
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }} 
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LivePage; 