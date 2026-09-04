package com.hrithik.linktrack.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Set;

@Component
public class ShortCodeGenerator {

    private static final String BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 7;
    private final SecureRandom random = new SecureRandom();

    private static final Set<String> RESERVED_PATHS = Set.of(
            "api", "login", "register", "dashboard", "analytics", "profile",
            "admin", "swagger-ui", "v3", "actuator", "health", "metrics",
            "index", "static", "assets", "favicon.ico", "robots.txt", "sitemap.xml",
            "error", "404", "500", "null", "undefined"
    );

    public String generate() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(BASE62_CHARS.length());
            sb.append(BASE62_CHARS.charAt(index));
        }
        return sb.toString();
    }

    public boolean isReserved(String codeOrAlias) {
        if (codeOrAlias == null) {
            return false;
        }
        return RESERVED_PATHS.contains(codeOrAlias.toLowerCase().trim());
    }
}
