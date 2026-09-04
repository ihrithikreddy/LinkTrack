package com.hrithik.linktrack.repository;

import com.hrithik.linktrack.entity.ClickEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    long countByUrlId(Long urlId);

    @Query("SELECT COUNT(c) FROM ClickEvent c WHERE c.url.id = :urlId AND c.clickedAt >= :since")
    long countClicksSinceByUrlId(@Param("urlId") Long urlId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(c) FROM ClickEvent c WHERE c.url.user.id = :userId AND c.clickedAt >= :since")
    long countUserClicksSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(c) FROM ClickEvent c WHERE c.clickedAt >= :since")
    long countTotalClicksSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(c.browser, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.id = :urlId GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Object[]> countByBrowserByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT COALESCE(c.operatingSystem, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.id = :urlId GROUP BY c.operatingSystem ORDER BY COUNT(c) DESC")
    List<Object[]> countByOperatingSystemByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT COALESCE(c.device, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.id = :urlId GROUP BY c.device ORDER BY COUNT(c) DESC")
    List<Object[]> countByDeviceByUrlId(@Param("urlId") Long urlId);

    // User-wide analytics
    @Query("SELECT COALESCE(c.browser, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.user.id = :userId GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Object[]> countUserClicksByBrowser(@Param("userId") Long userId);

    @Query("SELECT COALESCE(c.device, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.user.id = :userId GROUP BY c.device ORDER BY COUNT(c) DESC")
    List<Object[]> countUserClicksByDevice(@Param("userId") Long userId);

    @Query("SELECT COALESCE(c.operatingSystem, 'Unknown'), COUNT(c) FROM ClickEvent c WHERE c.url.user.id = :userId GROUP BY c.operatingSystem ORDER BY COUNT(c) DESC")
    List<Object[]> countUserClicksByOs(@Param("userId") Long userId);

    // Timeline queries: returns [LocalDate/String, count]
    @Query("SELECT CAST(c.clickedAt AS date), COUNT(c) FROM ClickEvent c WHERE c.url.id = :urlId AND c.clickedAt >= :since GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date) ASC")
    List<Object[]> countDailyClicksByUrlId(@Param("urlId") Long urlId, @Param("since") LocalDateTime since);

    @Query("SELECT CAST(c.clickedAt AS date), COUNT(c) FROM ClickEvent c WHERE c.url.user.id = :userId AND c.clickedAt >= :since GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date) ASC")
    List<Object[]> countDailyClicksByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT CAST(c.clickedAt AS date), COUNT(c) FROM ClickEvent c WHERE c.clickedAt >= :since GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date) ASC")
    List<Object[]> countDailyClicksPlatformWide(@Param("since") LocalDateTime since);

    Page<ClickEvent> findByUrlIdOrderByClickedAtDesc(Long urlId, Pageable pageable);
}
