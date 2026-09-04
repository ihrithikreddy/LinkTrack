package com.hrithik.linktrack.repository;

import com.hrithik.linktrack.entity.Url;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    Optional<Url> findByShortCode(String shortCode);

    Optional<Url> findByCustomAlias(String customAlias);

    @Query("SELECT u FROM Url u WHERE u.shortCode = :code OR u.customAlias = :code")
    Optional<Url> findByShortCodeOrCustomAlias(@Param("code") String code);

    boolean existsByShortCode(String shortCode);

    boolean existsByCustomAlias(String customAlias);

    Optional<Url> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT u FROM Url u WHERE u.user.id = :userId " +
           "AND (:search IS NULL OR LOWER(u.originalUrl) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.shortCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR (u.customAlias IS NOT NULL AND LOWER(u.customAlias) LIKE LOWER(CONCAT('%', :search, '%')))) " +
           "AND (:active IS NULL OR u.active = :active) " +
           "AND (:isExpired IS NULL OR " +
           "     (:isExpired = true AND u.expiresAt IS NOT NULL AND u.expiresAt < :now) OR " +
           "     (:isExpired = false AND (u.expiresAt IS NULL OR u.expiresAt >= :now)))")
    Page<Url> findUserUrlsWithFilters(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("active") Boolean active,
            @Param("isExpired") Boolean isExpired,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    long countByUserId(Long userId);

    @Query("SELECT COUNT(u) FROM Url u WHERE u.user.id = :userId AND u.active = true AND (u.expiresAt IS NULL OR u.expiresAt >= :now)")
    long countActiveUrlsByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(u) FROM Url u WHERE u.user.id = :userId AND u.expiresAt IS NOT NULL AND u.expiresAt < :now")
    long countExpiredUrlsByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(u.clickCount), 0) FROM Url u WHERE u.user.id = :userId")
    long sumTotalClicksByUserId(@Param("userId") Long userId);

    List<Url> findTop5ByUserIdOrderByClickCountDesc(Long userId);

    List<Url> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    // Admin queries
    @Query("SELECT COALESCE(SUM(u.clickCount), 0) FROM Url u")
    long sumAllPlatformClicks();

    @Query("SELECT COUNT(u) FROM Url u WHERE u.active = true AND (u.expiresAt IS NULL OR u.expiresAt >= :now)")
    long countAllActiveUrls(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(u) FROM Url u WHERE u.expiresAt IS NOT NULL AND u.expiresAt < :now")
    long countAllExpiredUrls(@Param("now") LocalDateTime now);

    List<Url> findTop10ByOrderByClickCountDesc();

    Page<Url> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
