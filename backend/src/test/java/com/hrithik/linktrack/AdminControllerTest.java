package com.hrithik.linktrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.LoginResponse;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.entity.Role;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String normalUserToken;

    @BeforeEach
    void setUp() throws Exception {
        // Create Admin user
        String adminEmail = "admintest" + System.currentTimeMillis() + "@example.com";
        User admin = User.builder()
                .name("Admin User")
                .email(adminEmail)
                .password(passwordEncoder.encode("AdminPass123"))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(admin);

        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(adminEmail, "AdminPass123"))))
                .andReturn();
        LoginResponse adminLogin = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), LoginResponse.class);
        adminToken = "Bearer " + adminLogin.getToken();

        // Create Normal User
        String normalEmail = "normaltest" + System.currentTimeMillis() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("Normal User", normalEmail, "Password123"))));

        MvcResult normalLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(normalEmail, "Password123"))))
                .andReturn();
        LoginResponse normalLogin = objectMapper.readValue(normalLoginResult.getResponse().getContentAsString(), LoginResponse.class);
        normalUserToken = "Bearer " + normalLogin.getToken();
    }

    @Test
    void testAdminCanAccessStatistics() throws Exception {
        mockMvc.perform(get("/api/admin/statistics")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", notNullValue()))
                .andExpect(jsonPath("$.totalUrls", notNullValue()));
    }

    @Test
    void testNormalUserCannotAccessAdminStatistics() throws Exception {
        mockMvc.perform(get("/api/admin/statistics")
                        .header("Authorization", normalUserToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users?page=0&size=10")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));
    }

    @Test
    void testAdminCanListAllUrls() throws Exception {
        mockMvc.perform(get("/api/admin/urls?page=0&size=10")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));
    }
}
