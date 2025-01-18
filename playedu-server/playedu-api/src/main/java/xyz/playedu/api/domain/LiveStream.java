package xyz.playedu.api.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Getter
@Setter
@Accessors(chain = true)
@TableName("live_streams")
public class LiveStream {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private String title;

    private String description;

    @TableField("cover_image")
    private String coverImage;

    @TableField("planned_start_time")
    private Date plannedStartTime;

    @TableField("actual_start_time")
    private Date actualStartTime;

    @TableField("actual_end_time")
    private Date actualEndTime;

    private Integer status; // 0:未开始 1:直播中 2:已结束

    @TableField("stream_key")
    private String streamKey; // 直播流密钥

    @TableField("rtmp_url")
    private String rtmpUrl; // RTMP推流地址

    @TableField("flv_url")
    private String flvUrl; // HTTP-FLV播放地址

    @TableField("hls_url")
    private String hlsUrl; // HLS播放地址

    @TableField("webrtc_url")
    private String webrtcUrl; // WebRTC播放地址

    @TableField("viewer_count")
    private Integer viewerCount; // 当前观看人数

    @TableField("peak_viewer_count")
    private Integer peakViewerCount; // 最高观看人数

    @TableField("created_at")
    private Date createdAt;

    @TableField("updated_at")
    private Date updatedAt;
} 