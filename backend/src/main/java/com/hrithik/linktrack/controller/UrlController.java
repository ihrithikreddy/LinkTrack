package com.hrithik.linktrack.controller;

import com.hrithik.linktrack.dto.PageResponse;
import com.hrithik.linktrack.dto.UrlRequest;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.dto.UrlUpdateRequest;
import com.hrithik.linktrack.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
@Tag(name = "URLs", description = "Endpoints for creating and managing shortened URLs")
@SecurityRequirement(name = "BearerAuth")
public class UrlController {

    private final UrlService urlService;

    @PostMapping
    @Operation(summary = "Create a shortened URL with optional custom alias and expiration")
    public ResponseEntity<UrlResponse> createUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UrlRequest request
    ) {
        UrlResponse response = urlService.createUrl(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get paginated list of URLs owned by the authenticated user")
    public ResponseEntity<PageResponse<UrlResponse>> getUserUrls(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<UrlResponse> response = urlService.getUserUrls(
                userDetails.getUsername(),
                page,
                size,
                search,
                status,
                sortBy,
                sortDir
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific shortened URL by ID")
    public ResponseEntity<UrlResponse> getUrlById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        UrlResponse response = urlService.getUrlById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shortened URL destination, expiration or status")
    public ResponseEntity<UrlResponse> updateUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UrlUpdateRequest request
    ) {
        UrlResponse response = urlService.updateUrl(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate/Delete shortened URL")
    public ResponseEntity<Map<String, String>> deleteUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        urlService.deleteUrl(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "URL deactivated successfully"));
    }
}
