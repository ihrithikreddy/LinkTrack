package com.hrithik.linktrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalUrls;
    private long totalClicks;
    private long activeUrls;
    private long expiredUrls;
    private long clicksToday;
    private long clicksThisWeek;
    private long clicksThisMonth;
    private List<UrlResponse> topUrls;
    private List<DailyClickDto> clicksOverTime;
    private Map<String, Long> browserStats;
    private Map<String, Long> deviceStats;
    private Map<String, Long> osStats;
}
