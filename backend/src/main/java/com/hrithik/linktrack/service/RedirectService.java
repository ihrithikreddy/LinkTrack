package com.hrithik.linktrack.service;

import com.hrithik.linktrack.entity.ClickEvent;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.exception.BadRequestException;
import com.hrithik.linktrack.exception.ResourceNotFoundException;
import com.hrithik.linktrack.repository.ClickEventRepository;
import com.hrithik.linktrack.repository.UrlRepository;
import com.hrithik.linktrack.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RedirectService {

    private static final Logger log = LoggerFactory.getLogger(RedirectService.class);

    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final CacheService cacheService;
    private final UserAgentParser userAgentParser;

    @Transactional
    public String getOriginalUrlAndTrackClick(String code, HttpServletRequest request) {
        // 1. Check Redis cache first
        String cachedOriginalUrl = cacheService.getUrl(code);

        Url url = urlRepository.findByShortCodeOrCustomAlias(code)
                .orElseThrow(() -> new ResourceNotFoundException("Short link not found for code: " + code));

        if (!url.isActive()) {
            cacheService.evictUrl(code);
            throw new BadRequestException("This link has been deactivated by its owner");
        }

        if (url.isExpired()) {
            cacheService.evictUrl(code);
            throw new BadRequestException("This link has expired");
        }

        // Increment click count
        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);

        // Record ClickEvent asynchronously / transactionally
        recordClickEvent(url, request);

        // Cache if not already cached
        if (cachedOriginalUrl == null) {
            Duration ttl = null;
            if (url.getExpiresAt() != null) {
                long seconds = Duration.between(LocalDateTime.now(), url.getExpiresAt()).getSeconds();
                if (seconds > 0) {
                    ttl = Duration.ofSeconds(seconds);
                }
            }
            cacheService.cacheUrl(code, url.getOriginalUrl(), ttl);
        }

        return url.getOriginalUrl();
    }

    private void recordClickEvent(Url url, HttpServletRequest request) {
        try {
            String ipAddress = extractClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String referrer = request.getHeader("Referer");

            UserAgentParser.UserAgentDetails details = userAgentParser.parse(userAgent);

            ClickEvent event = ClickEvent.builder()
                    .url(url)
                    .clickedAt(LocalDateTime.now())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                    .browser(details.browser())
                    .operatingSystem(details.operatingSystem())
                    .device(details.device())
                    .referrer(referrer != null && referrer.length() > 500 ? referrer.substring(0, 500) : referrer)
                    .build();

            clickEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to record click event: {}", e.getMessage());
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
