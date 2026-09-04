package com.hrithik.linktrack.controller;

import com.hrithik.linktrack.service.RedirectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@Tag(name = "Redirection", description = "Public high-performance URL redirection endpoint")
public class RedirectController {

    private final RedirectService redirectService;

    @GetMapping("/{shortCode:[a-zA-Z0-9_-]{3,50}}")
    @Operation(summary = "Redirect to target original URL and record click event")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode,
            HttpServletRequest request
    ) {
        String originalUrl = redirectService.getOriginalUrlAndTrackClick(shortCode, request);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(originalUrl));
        headers.set(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, max-age=0, must-revalidate");

        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
