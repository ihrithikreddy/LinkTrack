package com.hrithik.linktrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.LoginResponse;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.dto.UrlRequest;
import com.hrithik.linktrack.dto.UrlUpdateRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UrlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private String userEmail;

    @BeforeEach
    void setUp() throws Exception {
        userEmail = "urltester" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Url Tester")
                .email(userEmail)
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        LoginRequest loginRequest = LoginRequest.builder()
                .email(userEmail)
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
    void testCreateUrlSuccess() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://www.google.com/search?q=spring+boot")
                .build();

        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.shortCode", hasLength(7)))
                .andExpect(jsonPath("$.shortUrl", notNullValue()))
                .andExpect(jsonPath("$.originalUrl", is("https://www.google.com/search?q=spring+boot")))
                .andExpect(jsonPath("$.active", is(true)))
                .andExpect(jsonPath("$.clickCount", is(0)));
    }

    @Test
    void testCreateUrlWithCustomAlias() throws Exception {
        String alias = "my-custom-doc-" + (System.currentTimeMillis() % 100000);
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://docs.spring.io")
                .customAlias(alias)
                .build();

        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customAlias", is(alias)))
                .andExpect(jsonPath("$.shortUrl", containsString(alias)));
    }

    @Test
    void testCreateUrlDuplicateAliasFails() throws Exception {
        String alias = "same-alias-" + (System.currentTimeMillis() % 100000);
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://docs.spring.io")
                .customAlias(alias)
                .build();

        // First creation
        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate creation
        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testCreateUrlReservedAliasFails() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://docs.spring.io")
                .customAlias("dashboard")
                .build();

        mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetUserUrlsPagination() throws Exception {
        for (int i = 0; i < 5; i++) {
            UrlRequest request = UrlRequest.builder()
                    .originalUrl("https://example.com/page/" + i)
                    .build();

            mockMvc.perform(post("/api/urls")
                    .header("Authorization", userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)));
        }

        mockMvc.perform(get("/api/urls?page=0&size=3")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", is(5)))
                .andExpect(jsonPath("$.totalPages", is(2)));
    }

    @Test
    void testUpdateAndDeactivateUrl() throws Exception {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://initial.com")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/urls")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long urlId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Update URL
        UrlUpdateRequest updateRequest = UrlUpdateRequest.builder()
                .originalUrl("https://updated-target.com")
                .build();

        mockMvc.perform(put("/api/urls/" + urlId)
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalUrl", is("https://updated-target.com")));

        // Deactivate URL
        mockMvc.perform(delete("/api/urls/" + urlId)
                        .header("Authorization", userToken))
                .andExpect(status().isOk());

        // Verify deactivated
        mockMvc.perform(get("/api/urls/" + urlId)
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));
    }
}
