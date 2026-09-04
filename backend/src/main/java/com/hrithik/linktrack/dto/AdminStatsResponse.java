package com.hrithik.linktrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalUrls;
    private long totalClicks;
    private long activeUrls;
    private long expiredUrls;
    private long clicksToday;
    private List<UrlResponse> topUrls;
    private List<DailyClickDto> clicksOverTime;
}
