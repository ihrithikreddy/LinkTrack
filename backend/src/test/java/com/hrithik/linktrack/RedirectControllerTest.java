package com.hrithik.linktrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.LoginResponse;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.dto.UrlRequest;
import com.hrithik.linktrack.dto.UrlResponse;
import com.hrithik.linktrack.repository.ClickEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RedirectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClickEventRepository clickEventRepository;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        String email = "redirectuser" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Redirect Tester")
                .email(email)
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        LoginRequest loginRequest = LoginRequest.builder()
                .email(email)
                .password("Password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        LoginResponse loginResponse = objectMapper.readValue(result.getResponse().getContentAsString(), LoginResponse.class);
        userToken = "Bearer " + loginResponse.getToken();
    }

    @Test
    void testRedirectAndRecordClickEvent() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://news.ycombinator.com")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        UrlResponse urlResponse = objectMapper.readValue(createResult.getResponse().getContentAsString(), UrlResponse.class);
        String shortCode = urlResponse.getShortCode();
        Long urlId = urlResponse.getId();

        long initialClicks = clickEventRepository.countByUrlId(urlId);

        // Perform redirect
        mockMvc.perform(get("/" + shortCode)
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                        .header("Referer", "https://twitter.com"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "https://news.ycombinator.com"));

        // Check click event recorded
        long afterClicks = clickEventRepository.countByUrlId(urlId);
        assertEquals(initialClicks + 1, afterClicks);

        // Check URL clickCount updated
        mockMvc.perform(get("/api/urls/" + urlId)
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clickCount", is(1)));
    }

    @Test
    void testRedirectCustomAlias() throws Exception {
        String alias = "myalias-" + (System.currentTimeMillis() % 100000);
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://github.com")
                .customAlias(alias)
                .build();

        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/" + alias))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "https://github.com"));
    }

    @Test
    void testRedirectDeactivatedUrlFails() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://google.com")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        UrlResponse urlResponse = objectMapper.readValue(createResult.getResponse().getContentAsString(), UrlResponse.class);
        Long urlId = urlResponse.getId();
        String shortCode = urlResponse.getShortCode();

        // Deactivate
        mockMvc.perform(delete("/api/urls/" + urlId)
                        .header("Authorization", userToken))
                .andExpect(status().isOk());

        // Attempt redirect
        mockMvc.perform(get("/" + shortCode))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("deactivated")));
    }

    @Test
    void testRedirectNonExistentCodeReturns404() throws Exception {
        mockMvc.perform(get("/nonEx99"))
                .andExpect(status().isNotFound());
    }
}
