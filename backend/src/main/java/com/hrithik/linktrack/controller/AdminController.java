package com.hrithik.linktrack.controller;

import com.hrithik.linktrack.dto.AdminStatsResponse;
import com.hrithik.linktrack.dto.PageResponse;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.dto.UserResponse;
import com.hrithik.linktrack.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints for platform administration (ADMIN role only)")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/statistics")
    @Operation(summary = "Get system-wide platform statistics and top URLs")
    public ResponseEntity<AdminStatsResponse> getStatistics() {
        AdminStatsResponse response = adminService.getPlatformStatistics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated list of all registered users")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<UserResponse> response = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/urls")
    @Operation(summary = "Get paginated list of all URLs across the entire platform")
    public ResponseEntity<PageResponse<UrlResponse>> getAllUrls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<UrlResponse> response = adminService.getAllUrls(pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/urls/{id}/status")
    @Operation(summary = "Activate or deactivate an abusive or flagged URL")
    public ResponseEntity<UrlResponse> updateUrlStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        UrlResponse response = adminService.updateUrlStatus(id, active);
        return ResponseEntity.ok(response);
    }
}
