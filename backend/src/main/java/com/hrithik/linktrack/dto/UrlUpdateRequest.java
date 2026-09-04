package com.hrithik.linktrack.dto;

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
public class UrlUpdateRequest {

    @Pattern(
        regexp = "^$|^(https?://)(localhost|([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(\\.\\d{1,3}){3})(:[0-9]{1,5})?(/.*)?$",
        message = "Must be a valid URL starting with http:// or https://"
    )
    private String originalUrl;

    private LocalDateTime expiresAt;

    private Boolean active;
}
