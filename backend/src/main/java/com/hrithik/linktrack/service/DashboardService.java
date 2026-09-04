package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.DailyClickDto;
import com.hrithik.linktrack.dto.DashboardResponse;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.repository.ClickEventRepository;
import com.hrithik.linktrack.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final UserService userService;
    private final UrlService urlService;
    private final AnalyticsService analyticsService;

    public DashboardResponse getUserDashboard(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().minusDays(29).atStartOfDay();

        long totalUrls = urlRepository.countByUserId(user.getId());
        long activeUrls = urlRepository.countActiveUrlsByUserId(user.getId(), now);
        long expiredUrls = urlRepository.countExpiredUrlsByUserId(user.getId(), now);
        long totalClicks = urlRepository.sumTotalClicksByUserId(user.getId());

        long clicksToday = clickEventRepository.countUserClicksSince(user.getId(), startOfToday);
        long clicksThisWeek = clickEventRepository.countUserClicksSince(user.getId(), startOfWeek);
        long clicksThisMonth = clickEventRepository.countUserClicksSince(user.getId(), startOfMonth);

        List<Url> topEntities = urlRepository.findTop5ByUserIdOrderByClickCountDesc(user.getId());
        List<UrlResponse> topUrls = topEntities.stream().map(urlService::mapToUrlResponse).toList();

        List<DailyClickDto> clicksOverTime = analyticsService.generateDailyClicksTimeline(
                clickEventRepository.countDailyClicksByUserId(user.getId(), startOfMonth),
                LocalDate.now().minusDays(29),
                LocalDate.now()
        );

        Map<String, Long> browserStats = listToMap(clickEventRepository.countUserClicksByBrowser(user.getId()));
        Map<String, Long> deviceStats = listToMap(clickEventRepository.countUserClicksByDevice(user.getId()));
        Map<String, Long> osStats = listToMap(clickEventRepository.countUserClicksByOs(user.getId()));

        return DashboardResponse.builder()
                .totalUrls(totalUrls)
                .totalClicks(totalClicks)
                .activeUrls(activeUrls)
                .expiredUrls(expiredUrls)
                .clicksToday(clicksToday)
                .clicksThisWeek(clicksThisWeek)
                .clicksThisMonth(clicksThisMonth)
                .topUrls(topUrls)
                .clicksOverTime(clicksOverTime)
                .browserStats(browserStats)
                .deviceStats(deviceStats)
                .osStats(osStats)
                .build();
    }

    private Map<String, Long> listToMap(List<Object[]> queryResults) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : queryResults) {
            if (row != null && row.length >= 2 && row[0] != null) {
                map.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
            }
        }
        return map;
    }
}
