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
public class AnalyticsResponse {
    private Long urlId;
    private String shortCode;
    private String originalUrl;
    private String customAlias;
    private long totalClicks;
    private long clicksToday;
    private long clicksThisWeek;
    private long clicksThisMonth;
    private Map<String, Long> browserStats;
    private Map<String, Long> deviceStats;
    private Map<String, Long> osStats;
    private List<DailyClickDto> dailyClicks;
}
