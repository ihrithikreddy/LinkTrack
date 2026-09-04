package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.PageResponse;
import com.hrithik.linktrack.dto.UrlRequest;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.dto.UrlUpdateRequest;
import com.hrithik.linktrack.entity.Role;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.exception.BadRequestException;
import com.hrithik.linktrack.exception.DuplicateResourceException;
import com.hrithik.linktrack.exception.ResourceNotFoundException;
import com.hrithik.linktrack.exception.UnauthorizedException;
import com.hrithik.linktrack.repository.UrlRepository;
import com.hrithik.linktrack.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final UserService userService;
    private final ShortCodeGenerator shortCodeGenerator;
    private final CacheService cacheService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    public UrlResponse createUrl(String userEmail, UrlRequest request) {
        User user = userService.getUserByEmail(userEmail);

        String customAlias = null;
        if (request.getCustomAlias() != null && !request.getCustomAlias().trim().isBlank()) {
            customAlias = request.getCustomAlias().trim();

            if (shortCodeGenerator.isReserved(customAlias)) {
                throw new BadRequestException("The custom alias '" + customAlias + "' is a reserved keyword and cannot be used");
            }

            if (urlRepository.existsByShortCode(customAlias) || urlRepository.existsByCustomAlias(customAlias)) {
                throw new DuplicateResourceException("Custom alias '" + customAlias + "' is already in use. Please choose another.");
            }
        }

        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiration date must be in the future");
        }

        // Generate a unique 7-char shortCode
        String shortCode = generateUniqueShortCode();

        Url url = Url.builder()
                .user(user)
                .originalUrl(request.getOriginalUrl().trim())
                .shortCode(shortCode)
                .customAlias(customAlias)
                .expiresAt(request.getExpiresAt())
                .active(true)
                .clickCount(0L)
                .createdAt(LocalDateTime.now())
                .build();

        Url saved = urlRepository.save(url);

        // Pre-cache in Redis if expiration allows
        Duration ttl = null;
        if (saved.getExpiresAt() != null) {
            long secondsUntilExpiry = Duration.between(LocalDateTime.now(), saved.getExpiresAt()).getSeconds();
            if (secondsUntilExpiry > 0) {
                ttl = Duration.ofSeconds(secondsUntilExpiry);
            }
        }
        cacheService.cacheUrl(saved.getShortCode(), saved.getOriginalUrl(), ttl);
        if (saved.getCustomAlias() != null) {
            cacheService.cacheUrl(saved.getCustomAlias(), saved.getOriginalUrl(), ttl);
        }

        return mapToUrlResponse(saved);
    }

    public PageResponse<UrlResponse> getUserUrls(
            String userEmail,
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            String sortDir
    ) {
        User user = userService.getUserByEmail(userEmail);

        String sortField = "createdAt";
        if ("clickCount".equalsIgnoreCase(sortBy) || "clicks".equalsIgnoreCase(sortBy)) {
            sortField = "clickCount";
        } else if ("originalUrl".equalsIgnoreCase(sortBy)) {
            sortField = "originalUrl";
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by(direction, sortField));

        Boolean activeFilter = null;
        Boolean expiredFilter = null;

        if ("ACTIVE".equalsIgnoreCase(status)) {
            activeFilter = true;
            expiredFilter = false;
        } else if ("EXPIRED".equalsIgnoreCase(status)) {
            expiredFilter = true;
        } else if ("INACTIVE".equalsIgnoreCase(status) || "DEACTIVATED".equalsIgnoreCase(status)) {
            activeFilter = false;
        }

        String searchPattern = (search != null && !search.trim().isBlank()) ? search.trim() : null;

        Page<Url> urlPage = urlRepository.findUserUrlsWithFilters(
                user.getId(),
                searchPattern,
                activeFilter,
                expiredFilter,
                LocalDateTime.now(),
                pageable
        );

        return PageResponse.of(urlPage, this::mapToUrlResponse);
    }

    public UrlResponse getUrlById(Long id, String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));

        if (!url.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to view this URL");
        }

        return mapToUrlResponse(url);
    }

    @Transactional
    public UrlResponse updateUrl(Long id, String userEmail, UrlUpdateRequest request) {
        User user = userService.getUserByEmail(userEmail);
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));

        if (!url.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to modify this URL");
        }

        if (request.getOriginalUrl() != null && !request.getOriginalUrl().trim().isBlank()) {
            url.setOriginalUrl(request.getOriginalUrl().trim());
        }

        if (request.getExpiresAt() != null) {
            if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Expiration date must be in the future");
            }
            url.setExpiresAt(request.getExpiresAt());
        }

        if (request.getActive() != null) {
            url.setActive(request.getActive());
        }

        Url updated = urlRepository.save(url);

        // Evict cache
        cacheService.evictUrl(url.getShortCode());
        if (url.getCustomAlias() != null) {
            cacheService.evictUrl(url.getCustomAlias());
        }

        if (updated.isAccessible()) {
            cacheService.cacheUrl(updated.getShortCode(), updated.getOriginalUrl(), null);
            if (updated.getCustomAlias() != null) {
                cacheService.cacheUrl(updated.getCustomAlias(), updated.getOriginalUrl(), null);
            }
        }

        return mapToUrlResponse(updated);
    }

    @Transactional
    public void deleteUrl(Long id, String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));

        if (!url.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to delete this URL");
        }

        // Soft deletion
        url.setActive(false);
        urlRepository.save(url);

        // Evict cache
        cacheService.evictUrl(url.getShortCode());
        if (url.getCustomAlias() != null) {
            cacheService.evictUrl(url.getCustomAlias());
        }
    }

    private String generateUniqueShortCode() {
        for (int i = 0; i < 10; i++) {
            String candidate = shortCodeGenerator.generate();
            if (!shortCodeGenerator.isReserved(candidate)
                    && !urlRepository.existsByShortCode(candidate)
                    && !urlRepository.existsByCustomAlias(candidate)) {
                return candidate;
            }
        }
        throw new RuntimeException("Could not generate a unique short code after 10 attempts. Please try again.");
    }

    public UrlResponse mapToUrlResponse(Url url) {
        String identifier = url.getCustomAlias() != null && !url.getCustomAlias().isBlank()
                ? url.getCustomAlias()
                : url.getShortCode();

        String shortUrl = baseUrl + "/" + identifier;

        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .customAlias(url.getCustomAlias())
                .shortUrl(shortUrl)
                .createdAt(url.getCreatedAt())
                .expiresAt(url.getExpiresAt())
                .active(url.isActive())
                .clickCount(url.getClickCount())
                .isExpired(url.isExpired())
                .build();
    }
}
