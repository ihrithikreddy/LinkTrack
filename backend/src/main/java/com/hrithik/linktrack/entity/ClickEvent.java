package com.hrithik.linktrack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "click_events", indexes = {
    @Index(name = "idx_click_url_id", columnList = "url_id"),
    @Index(name = "idx_click_clicked_at", columnList = "clickedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    @Column(length = 100)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(length = 50)
    private String browser;

    @Column(length = 50)
    private String operatingSystem;

    @Column(length = 50)
    private String device;

    @Column(columnDefinition = "TEXT")
    private String referrer;

    @PrePersist
    protected void onCreate() {
        if (this.clickedAt == null) {
            this.clickedAt = LocalDateTime.now();
        }
    }
}
