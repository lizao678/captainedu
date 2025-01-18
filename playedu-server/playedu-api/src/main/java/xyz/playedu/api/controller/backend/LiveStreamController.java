package xyz.playedu.api.controller.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import xyz.playedu.api.domain.LiveStream;
import xyz.playedu.api.request.backend.LiveStreamRequest;
import xyz.playedu.api.service.LiveStreamService;
import xyz.playedu.common.annotation.BackendPermission;
import xyz.playedu.common.annotation.Log;
import xyz.playedu.common.constant.BPermissionConstant;
import xyz.playedu.common.constant.BusinessTypeConstant;
import xyz.playedu.common.types.JsonResponse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;

@RestController
@Slf4j
@RequestMapping("/backend/v1/live")
public class LiveStreamController {

    @Autowired
    private LiveStreamService liveStreamService;

    @BackendPermission(slug = "live")
    @GetMapping("/index")
    @Log(title = "直播-列表", businessType = BusinessTypeConstant.GET)
    public JsonResponse index(@RequestParam(value = "page", defaultValue = "1") Integer page,
                             @RequestParam(value = "size", defaultValue = "10") Integer size) {
        return JsonResponse.data(liveStreamService.paginate(page, size));
    }

    @BackendPermission(slug = "live-store")
    @PostMapping("/store")
    @Log(title = "直播-创建", businessType = BusinessTypeConstant.INSERT)
    public JsonResponse store(@RequestBody @Validated LiveStreamRequest req) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date plannedStartTime = format.parse(req.getPlannedStartTime());

        LiveStream liveStream = liveStreamService.create(
            req.getTitle(),
            req.getDescription(),
            req.getCoverImage(),
            plannedStartTime
        );

        return JsonResponse.success("创建成功");
    }

    @BackendPermission(slug = "live")
    @GetMapping("/{id}")
    @Log(title = "直播-详情", businessType = BusinessTypeConstant.GET)
    public JsonResponse detail(@PathVariable Integer id) {
        LiveStream liveStream = liveStreamService.getById(id);
        if (liveStream == null) {
            return JsonResponse.error("直播不存在");
        }
        return JsonResponse.data(liveStream);
    }

    @BackendPermission(slug = "live-update")
    @PutMapping("/{id}")
    @Log(title = "直播-更新", businessType = BusinessTypeConstant.UPDATE)
    public JsonResponse update(@PathVariable Integer id, @RequestBody @Validated LiveStreamRequest req) throws ParseException {
        LiveStream liveStream = liveStreamService.getById(id);
        if (liveStream == null) {
            return JsonResponse.error("直播不存在");
        }

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date plannedStartTime = format.parse(req.getPlannedStartTime());

        liveStream.setTitle(req.getTitle());
        liveStream.setDescription(req.getDescription());
        liveStream.setCoverImage(req.getCoverImage());
        liveStream.setPlannedStartTime(plannedStartTime);
        liveStream.setUpdatedAt(new Date());
        
        if (req.getStatus() != null) {
            liveStream.setStatus(req.getStatus());
        }

        liveStreamService.updateById(liveStream);

        return JsonResponse.success("更新成功");
    }

    @BackendPermission(slug = "live-destroy")
    @PostMapping("/{id}/delete")
    @Log(title = "直播-删除", businessType = BusinessTypeConstant.DELETE)
    public JsonResponse destroy(@PathVariable Integer id) {
        LiveStream liveStream = liveStreamService.getById(id);
        if (liveStream == null) {
            return JsonResponse.error("直播不存在");
        }

        liveStreamService.removeById(id);

        return JsonResponse.success("删除成功");
    }

    @BackendPermission(slug = "live-start")
    @PostMapping("/{id}/start")
    @Log(title = "直播-开始", businessType = BusinessTypeConstant.UPDATE)
    public JsonResponse start(@PathVariable Integer id) {
        LiveStream liveStream = liveStreamService.getById(id);
        if (liveStream == null) {
            return JsonResponse.error("直播不存在");
        }

        if (liveStream.getStatus() != 0) {
            return JsonResponse.error("直播状态错误");
        }

        liveStreamService.startLive(id);

        return JsonResponse.success("开始直播成功");
    }

    @BackendPermission(slug = "live-end")
    @PostMapping("/{id}/end")
    @Log(title = "直播-结束", businessType = BusinessTypeConstant.UPDATE)
    public JsonResponse end(@PathVariable Integer id) {
        LiveStream liveStream = liveStreamService.getById(id);
        if (liveStream == null) {
            return JsonResponse.error("直播不存在");
        }

        if (liveStream.getStatus() != 1) {
            return JsonResponse.error("直播状态错误");
        }

        liveStreamService.endLive(id);

        return JsonResponse.success("结束直播成功");
    }
} 