package com.hrithik.linktrack.util;

import org.springframework.stereotype.Component;

@Component
public class UserAgentParser {

    public record UserAgentDetails(String browser, String operatingSystem, String device) {}

    public UserAgentDetails parse(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return new UserAgentDetails("Unknown", "Unknown", "Unknown");
        }

        String ua = userAgent.toLowerCase();

        // 1. Determine Device
        String device;
        if (ua.contains("ipad") || ua.contains("tablet") || (ua.contains("android") && !ua.contains("mobile"))) {
            device = "Tablet";
        } else if (ua.contains("mobile") || ua.contains("iphone") || ua.contains("ipod") || ua.contains("android") || ua.contains("windows phone")) {
            device = "Mobile";
        } else if (ua.contains("curl") || ua.contains("postman") || ua.contains("wget") || ua.contains("httpclient") || ua.contains("bot") || ua.contains("spider")) {
            device = "API/Bot";
        } else {
            device = "Desktop";
        }

        // 2. Determine OS
        String os;
        if (ua.contains("windows nt 10.0") || ua.contains("windows nt 11.0") || ua.contains("windows")) {
            os = "Windows";
        } else if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod") || ua.contains("cpu os")) {
            os = "iOS";
        } else if (ua.contains("macintosh") || ua.contains("mac os x")) {
            os = "macOS";
        } else if (ua.contains("android")) {
            os = "Android";
        } else if (ua.contains("cros")) {
            os = "Chrome OS";
        } else if (ua.contains("linux")) {
            os = "Linux";
        } else {
            os = "Other";
        }

        // 3. Determine Browser
        String browser;
        if (ua.contains("edg/") || ua.contains("edge/")) {
            browser = "Edge";
        } else if (ua.contains("opr/") || ua.contains("opera")) {
            browser = "Opera";
        } else if (ua.contains("samsungbrowser")) {
            browser = "Samsung Internet";
        } else if (ua.contains("chrome") && !ua.contains("chromium") && !ua.contains("edg")) {
            browser = "Chrome";
        } else if (ua.contains("safari") && !ua.contains("chrome") && !ua.contains("android")) {
            browser = "Safari";
        } else if (ua.contains("firefox") || ua.contains("fxios")) {
            browser = "Firefox";
        } else if (ua.contains("msie") || ua.contains("trident")) {
            browser = "Internet Explorer";
        } else if (ua.contains("postman")) {
            browser = "Postman";
        } else if (ua.contains("curl")) {
            browser = "cURL";
        } else {
            browser = "Other";
        }

        return new UserAgentDetails(browser, os, device);
    }
}
