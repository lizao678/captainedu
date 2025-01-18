package xyz.playedu.api.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import xyz.playedu.api.domain.LiveStream;
import xyz.playedu.api.mapper.LiveStreamMapper;
import xyz.playedu.api.service.LiveStreamService;
import xyz.playedu.api.types.paginate.PaginationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Slf4j
@Service
public class LiveStreamServiceImpl extends ServiceImpl<LiveStreamMapper, LiveStream> implements LiveStreamService {
    
    @Value("${srs.rtmp.server}")
    private String rtmpServer;
    
    @Value("${srs.api.server}")
    private String apiServer;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PaginationResult<LiveStream> paginate(int page, int size) {
        PaginationResult<LiveStream> result = new PaginationResult<>();

        // 计算偏移量
        Long offset = (long) (page - 1) * size;

        // 查询总数
        Long total = lambdaQuery().count();

        // 如果总数为0，直接返回空结果
        if (total == 0) {
            result.setData(new ArrayList<>());
            result.setTotal(0L);
            return result;
        }

        // 查询数据
        List<LiveStream> data = lambdaQuery()
                .orderByDesc(LiveStream::getId)
                .last(String.format("LIMIT %d,%d", offset, size))
                .list();

        result.setData(data);
        result.setTotal(total);

        return result;
    }

    @Override
    public LiveStream create(String title, String description, String coverImage, Date plannedStartTime) {
        String streamKey = generateStreamKey();
        Map<String, String> urls = generateStreamUrls(streamKey);
        
        LiveStream liveStream = new LiveStream()
            .setTitle(title)
            .setDescription(description)
            .setCoverImage(coverImage)
            .setPlannedStartTime(plannedStartTime)
            .setStreamKey(streamKey)
            .setRtmpUrl(urls.get("rtmp"))
            .setFlvUrl(urls.get("flv"))
            .setHlsUrl(urls.get("hls"))
            .setWebrtcUrl(urls.get("webrtc"))
            .setStatus(0)
            .setCreatedAt(new Date())
            .setUpdatedAt(new Date());
        
        save(liveStream);
        return liveStream;
    }

    @Override
    public void startLive(Integer id) {
        LiveStream liveStream = getById(id);
        if (liveStream == null || liveStream.getStatus() != 0) {
            return;
        }
        
        liveStream.setStatus(1)
            .setActualStartTime(new Date())
            .setUpdatedAt(new Date());
        
        updateById(liveStream);
    }

    @Override
    public void endLive(Integer id) {
        LiveStream liveStream = getById(id);
        if (liveStream == null || liveStream.getStatus() != 1) {
            return;
        }
        
        liveStream.setStatus(2)
            .setActualEndTime(new Date())
            .setUpdatedAt(new Date());
        
        updateById(liveStream);
    }

    /**
     * 生成推流地址
     */
    private Map<String, String> generateStreamUrls(String streamKey) {
        Map<String, String> urls = new HashMap<>();
        
        // RTMP推流地址
        String rtmpUrl = String.format("%s/live/%s", rtmpServer, streamKey);
        urls.put("rtmp", rtmpUrl);
        
        // HTTP-FLV播放地址
        String flvUrl = String.format("%s/live/%s.flv", apiServer, streamKey);
        urls.put("flv", flvUrl);
        
        // HLS播放地址
        String hlsUrl = String.format("%s/live/%s.m3u8", apiServer, streamKey);
        urls.put("hls", hlsUrl);
        
        // WebRTC播放地址
        String webrtcUrl = String.format("webrtc://%s/live/%s", apiServer, streamKey);
        urls.put("webrtc", webrtcUrl);
        
        return urls;
    }

    /**
     * 生成唯一的流密钥
     */
    private String generateStreamKey() {
        return UUID.randomUUID().toString().replace("-", "");
    }
} 