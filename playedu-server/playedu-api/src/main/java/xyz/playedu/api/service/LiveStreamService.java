package xyz.playedu.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import xyz.playedu.api.domain.LiveStream;
import xyz.playedu.api.types.paginate.PaginationResult;

import java.util.Date;

public interface LiveStreamService extends IService<LiveStream> {
    PaginationResult<LiveStream> paginate(int page, int size);
    
    LiveStream create(String title, String description, String coverImage, Date plannedStartTime);
    
    void startLive(Integer id);
    
    void endLive(Integer id);
} 