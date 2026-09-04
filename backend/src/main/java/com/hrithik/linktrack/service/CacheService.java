package com.hrithik.linktrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    private static final String KEY_PREFIX = "linktrack:url:";

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.redis.enabled:true}")
    private boolean redisEnabled;

    public CacheService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String getUrl(String code) {
        if (!redisEnabled || code == null) {
            return null;
        }
        try {
            String originalUrl = redisTemplate.opsForValue().get(KEY_PREFIX + code);
            if (originalUrl != null) {
                log.debug("Redis cache HIT for key: {}{}", KEY_PREFIX, code);
            }
            return originalUrl;
        } catch (Exception e) {
            log.warn("Redis lookup failed for key: {}. Falling back to DB. Error: {}", KEY_PREFIX + code, e.getMessage());
            return null;
        }
    }

    public void cacheUrl(String code, String originalUrl, Duration ttl) {
        if (!redisEnabled || code == null || originalUrl == null) {
            return;
        }
        try {
            if (ttl != null && !ttl.isNegative() && !ttl.isZero()) {
                redisTemplate.opsForValue().set(KEY_PREFIX + code, originalUrl, ttl);
            } else {
                // Default cache for 24 hours if no explicit TTL
                redisTemplate.opsForValue().set(KEY_PREFIX + code, originalUrl, Duration.ofHours(24));
            }
            log.debug("Cached URL for key: {}{}", KEY_PREFIX, code);
        } catch (Exception e) {
            log.warn("Redis caching failed for key: {}. Error: {}", KEY_PREFIX + code, e.getMessage());
        }
    }

    public void evictUrl(String code) {
        if (!redisEnabled || code == null) {
            return;
        }
        try {
            redisTemplate.delete(KEY_PREFIX + code);
            log.debug("Evicted Redis cache for key: {}{}", KEY_PREFIX, code);
        } catch (Exception e) {
            log.warn("Redis eviction failed for key: {}. Error: {}", KEY_PREFIX + code, e.getMessage());
        }
    }
}
