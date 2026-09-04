package com.hrithik.linktrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlRequest {

    @NotBlank(message = "Original URL is required")
    @Pattern(
        regexp = "^(https?://)(localhost|([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(\\.\\d{1,3}){3})(:[0-9]{1,5})?(/.*)?$",
        message = "Must be a valid URL starting with http:// or https://"
    )
    private String originalUrl;

    @Pattern(
        regexp = "^$|^[a-zA-Z0-9_-]{3,30}$",
        message = "Custom alias must be 3-30 characters long and contain only letters, numbers, hyphens and underscores"
    )
    private String customAlias;

    private LocalDateTime expiresAt;
}
