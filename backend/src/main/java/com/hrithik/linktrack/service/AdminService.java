package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.AdminStatsResponse;
import com.hrithik.linktrack.dto.DailyClickDto;
import com.hrithik.linktrack.dto.PageResponse;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.dto.UserResponse;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.exception.ResourceNotFoundException;
import com.hrithik.linktrack.repository.ClickEventRepository;
import com.hrithik.linktrack.repository.UrlRepository;
import com.hrithik.linktrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final UrlService urlService;
    private final AnalyticsService analyticsService;
    private final CacheService cacheService;

    public AdminStatsResponse getPlatformStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().minusDays(29).atStartOfDay();

        long totalUsers = userRepository.count();
        long totalUrls = urlRepository.count();
        long totalClicks = urlRepository.sumAllPlatformClicks();
        long activeUrls = urlRepository.countAllActiveUrls(now);
        long expiredUrls = urlRepository.countAllExpiredUrls(now);
        long clicksToday = clickEventRepository.countTotalClicksSince(startOfToday);

        List<Url> topEntities = urlRepository.findTop10ByOrderByClickCountDesc();
        List<UrlResponse> topUrls = topEntities.stream().map(urlService::mapToUrlResponse).toList();

        List<DailyClickDto> clicksOverTime = analyticsService.generateDailyClicksTimeline(
                clickEventRepository.countDailyClicksPlatformWide(startOfMonth),
                LocalDate.now().minusDays(29),
                LocalDate.now()
        );

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalUrls(totalUrls)
                .totalClicks(totalClicks)
                .activeUrls(activeUrls)
                .expiredUrls(expiredUrls)
                .clicksToday(clicksToday)
                .topUrls(topUrls)
                .clicksOverTime(clicksOverTime)
                .build();
    }

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page, user -> UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build()
        );
    }

    public PageResponse<UrlResponse> getAllUrls(Pageable pageable) {
        Page<Url> page = urlRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page, urlService::mapToUrlResponse);
    }

    @Transactional
    public UrlResponse updateUrlStatus(Long urlId, boolean active) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + urlId));

        url.setActive(active);
        Url saved = urlRepository.save(url);

        if (!active) {
            cacheService.evictUrl(url.getShortCode());
            if (url.getCustomAlias() != null) {
                cacheService.evictUrl(url.getCustomAlias());
            }
        }

        return urlService.mapToUrlResponse(saved);
    }
}
