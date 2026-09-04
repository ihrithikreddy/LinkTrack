package com.hrithik.linktrack.config;

import com.hrithik.linktrack.entity.ClickEvent;
import com.hrithik.linktrack.entity.Role;
import com.hrithik.linktrack.entity.Url;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.repository.ClickEventRepository;
import com.hrithik.linktrack.repository.UrlRepository;
import com.hrithik.linktrack.repository.UserRepository;
import com.hrithik.linktrack.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShortCodeGenerator shortCodeGenerator;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Bootstrapping initial demo users and sample analytics...");

            // 1. Create Admin
            User admin = User.builder()
                    .name("Platform Admin")
                    .email("admin@linktrack.com")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now().minusDays(30))
                    .build();
            userRepository.save(admin);

            // 2. Create Demo User
            User demoUser = User.builder()
                    .name("Hrithik Reddy")
                    .email("hrithik@example.com")
                    .password(passwordEncoder.encode("Password123"))
                    .role(Role.USER)
                    .createdAt(LocalDateTime.now().minusDays(15))
                    .build();
            userRepository.save(demoUser);

            // 3. Create Sample Short URLs for demo user
            Url url1 = Url.builder()
                    .user(demoUser)
                    .originalUrl("https://github.com/torvalds/linux")
                    .shortCode(shortCodeGenerator.generate())
                    .customAlias("linux-repo")
                    .active(true)
                    .clickCount(142)
                    .createdAt(LocalDateTime.now().minusDays(10))
                    .build();
            urlRepository.save(url1);

            Url url2 = Url.builder()
                    .user(demoUser)
                    .originalUrl("https://spring.io/projects/spring-boot")
                    .shortCode(shortCodeGenerator.generate())
                    .customAlias("spring-boot-docs")
                    .active(true)
                    .clickCount(88)
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build();
            urlRepository.save(url2);

            Url url3 = Url.builder()
                    .user(demoUser)
                    .originalUrl("https://news.ycombinator.com")
                    .shortCode(shortCodeGenerator.generate())
                    .customAlias(null)
                    .active(true)
                    .clickCount(25)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build();
            urlRepository.save(url3);

            // Seed click events across browsers/devices/days for rich chart visualization
            seedClicks(url1, 142);
            seedClicks(url2, 88);
            seedClicks(url3, 25);

            log.info("Data initialization completed successfully. Default admin: admin@linktrack.com, demo user: hrithik@example.com");
        }
    }

    private void seedClicks(Url url, int count) {
        String[] browsers = {"Chrome", "Firefox", "Safari", "Edge", "Opera"};
        String[] oss = {"Windows", "macOS", "Linux", "iOS", "Android"};
        String[] devices = {"Desktop", "Mobile", "Tablet"};

        for (int i = 0; i < count; i++) {
            int daysAgo = i % 10;
            ClickEvent event = ClickEvent.builder()
                    .url(url)
                    .clickedAt(LocalDateTime.now().minusDays(daysAgo).minusHours(i % 24).minusMinutes(i % 60))
                    .browser(browsers[i % browsers.length])
                    .operatingSystem(oss[(i * 2) % oss.length])
                    .device(devices[i % devices.length])
                    .ipAddress("192.168.1." + (10 + (i % 50)))
                    .userAgent("Mozilla/5.0 (Sample Seed Agent " + i + ")")
                    .referrer(i % 2 == 0 ? "https://google.com" : "https://twitter.com")
                    .build();
            clickEventRepository.save(event);
        }
    }
}
