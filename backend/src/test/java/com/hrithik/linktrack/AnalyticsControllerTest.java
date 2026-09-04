package com.hrithik.linktrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.LoginResponse;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.dto.UrlRequest;
import com.hrithik.linktrack.dto.UrlResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken1;
    private String userToken2;

    @BeforeEach
    void setUp() throws Exception {
        // User 1
        String email1 = "analyticsuser1" + System.currentTimeMillis() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("User One", email1, "Password123"))));

        MvcResult res1 = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email1, "Password123"))))
                .andReturn();
        LoginResponse log1 = objectMapper.readValue(res1.getResponse().getContentAsString(), LoginResponse.class);
        userToken1 = "Bearer " + log1.getToken();

        // User 2
        String email2 = "analyticsuser2" + System.currentTimeMillis() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("User Two", email2, "Password123"))));

        MvcResult res2 = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email2, "Password123"))))
                .andReturn();
        LoginResponse log2 = objectMapper.readValue(res2.getResponse().getContentAsString(), LoginResponse.class);
        userToken2 = "Bearer " + log2.getToken();
    }

    @Test
    void testGetAnalyticsSuccess() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://spring.io")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        UrlResponse urlResponse = objectMapper.readValue(createResult.getResponse().getContentAsString(), UrlResponse.class);
        Long urlId = urlResponse.getId();

        // Simulate click
        mockMvc.perform(get("/" + urlResponse.getShortCode())
                        .header("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"))
                .andExpect(status().isFound());

        // Fetch analytics
        mockMvc.perform(get("/api/urls/" + urlId + "/analytics")
                        .header("Authorization", userToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.urlId", is(urlId.intValue())))
                .andExpect(jsonPath("$.totalClicks", is(1)))
                .andExpect(jsonPath("$.clicksToday", is(1)))
                .andExpect(jsonPath("$.dailyClicks", hasSize(30)))
                .andExpect(jsonPath("$.deviceStats.Mobile", is(1)))
                .andExpect(jsonPath("$.osStats.iOS", is(1)));
    }

    @Test
    void testUserCannotAccessAnotherUsersAnalytics() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://private.com")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        UrlResponse urlResponse = objectMapper.readValue(createResult.getResponse().getContentAsString(), UrlResponse.class);
        Long urlId = urlResponse.getId();

        // User 2 attempts to access User 1's analytics
        mockMvc.perform(get("/api/urls/" + urlId + "/analytics")
                        .header("Authorization", userToken2))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testDashboardEndpoint() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", userToken1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUrls", notNullValue()))
                .andExpect(jsonPath("$.totalClicks", notNullValue()))
                .andExpect(jsonPath("$.clicksOverTime", hasSize(30)));
    }
}
