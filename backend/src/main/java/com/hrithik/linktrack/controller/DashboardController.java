package com.hrithik.linktrack.controller;

import com.hrithik.linktrack.dto.DashboardResponse;
import com.hrithik.linktrack.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for authenticated user dashboard summaries and charts")
@SecurityRequirement(name = "BearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get aggregate dashboard statistics, top URLs and click history for authenticated user")
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        DashboardResponse response = dashboardService.getUserDashboard(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
