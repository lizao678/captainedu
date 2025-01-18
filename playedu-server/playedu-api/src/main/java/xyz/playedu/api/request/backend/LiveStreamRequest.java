package xyz.playedu.api.request.backend;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LiveStreamRequest {
    @NotBlank(message = "直播标题不能为空")
    private String title;

    @NotBlank(message = "直播简介不能为空")
    private String description;

    private String coverImage;

    @NotBlank(message = "开始时间不能为空")
    private String plannedStartTime;

    private Integer status;
} 