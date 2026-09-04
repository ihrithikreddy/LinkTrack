package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.AnalyticsResponse;
import com.hrithik.linktrack.dto.DailyClickDto;
import com.hrithik.linktrack.entity.Role;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.exception.ResourceNotFoundException;
import com.hrithik.linktrack.exception.UnauthorizedException;
import com.hrithik.linktrack.repository.ClickEventRepository;
import com.hrithik.linktrack.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final UserService userService;

    public AnalyticsResponse getUrlAnalytics(Long urlId, String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + urlId));

        if (!url.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to view analytics for this URL");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().minusDays(29).atStartOfDay();

        long totalClicks = url.getClickCount();
        long clicksToday = clickEventRepository.countClicksSinceByUrlId(urlId, startOfToday);
        long clicksThisWeek = clickEventRepository.countClicksSinceByUrlId(urlId, startOfWeek);
        long clicksThisMonth = clickEventRepository.countClicksSinceByUrlId(urlId, startOfMonth);

        Map<String, Long> browserStats = listToMap(clickEventRepository.countByBrowserByUrlId(urlId));
        Map<String, Long> deviceStats = listToMap(clickEventRepository.countByDeviceByUrlId(urlId));
        Map<String, Long> osStats = listToMap(clickEventRepository.countByOperatingSystemByUrlId(urlId));

        List<DailyClickDto> dailyClicks = generateDailyClicksTimeline(
                clickEventRepository.countDailyClicksByUrlId(urlId, startOfMonth),
                LocalDate.now().minusDays(29),
                LocalDate.now()
        );

        return AnalyticsResponse.builder()
                .urlId(url.getId())
                .shortCode(url.getShortCode())
                .customAlias(url.getCustomAlias())
                .originalUrl(url.getOriginalUrl())
                .totalClicks(totalClicks)
                .clicksToday(clicksToday)
                .clicksThisWeek(clicksThisWeek)
                .clicksThisMonth(clicksThisMonth)
                .browserStats(browserStats)
                .deviceStats(deviceStats)
                .osStats(osStats)
                .dailyClicks(dailyClicks)
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

    public List<DailyClickDto> generateDailyClicksTimeline(List<Object[]> rawCounts, LocalDate startDate, LocalDate endDate) {
        Map<String, Long> countMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Object[] row : rawCounts) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String dateStr = String.valueOf(row[0]);
                long count = ((Number) row[1]).longValue();
                countMap.put(dateStr, count);
            }
        }

        List<DailyClickDto> timeline = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String dateStr = current.format(formatter);
            long clicks = countMap.getOrDefault(dateStr, 0L);
            timeline.add(new DailyClickDto(dateStr, clicks));
            current = current.plusDays(1);
        }

        return timeline;
    }
}
