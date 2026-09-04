package com.hrithik.linktrack.controller;

import com.hrithik.linktrack.dto.AnalyticsResponse;
import com.hrithik.linktrack.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for link performance metrics and breakdowns")
@SecurityRequirement(name = "BearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{id}/analytics")
    @Operation(summary = "Get detailed analytics and metrics for a specific shortened URL")
    public ResponseEntity<AnalyticsResponse> getUrlAnalytics(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        AnalyticsResponse response = analyticsService.getUrlAnalytics(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
