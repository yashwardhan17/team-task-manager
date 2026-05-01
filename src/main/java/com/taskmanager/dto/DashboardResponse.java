package com.taskmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long inReviewCount;
    private long doneCount;
    private long overdueCount;
    private List<?> recentActivity;
}