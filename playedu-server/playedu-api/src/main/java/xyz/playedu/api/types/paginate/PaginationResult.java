package xyz.playedu.api.types.paginate;

import lombok.Data;

import java.util.List;

@Data
public class PaginationResult<T> {
    private List<T> data;
    private long total;
} 