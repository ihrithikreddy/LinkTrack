package com.hrithik.linktrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alice Wonder")
                .email("alice" + System.currentTimeMillis() + "@example.com")
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("User registered successfully")));
    }

    @Test
    void testRegisterDuplicateEmailFails() throws Exception {
        String email = "duplicate" + System.currentTimeMillis() + "@example.com";
        RegisterRequest request = RegisterRequest.builder()
                .name("Bob Builder")
                .email(email)
                .password("Password123")
                .build();

        // First registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("Conflict")));
    }

    @Test
    void testLoginSuccess() throws Exception {
        String email = "logintest" + System.currentTimeMillis() + "@example.com";
        RegisterRequest regRequest = RegisterRequest.builder()
                .name("Login Tester")
                .email(email)
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = LoginRequest.builder()
                .email(email)
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is(email)))
                .andExpect(jsonPath("$.user.name", is("Login Tester")));
    }

    @Test
    void testLoginInvalidCredentialsFails() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("")
                .email("invalid-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Error")))
                .andExpect(jsonPath("$.errors.email", notNullValue()))
                .andExpect(jsonPath("$.errors.password", notNullValue()));
    }
}
