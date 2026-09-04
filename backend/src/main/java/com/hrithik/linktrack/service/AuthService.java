package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.LoginRequest;
import com.hrithik.linktrack.dto.LoginResponse;
import com.hrithik.linktrack.dto.RegisterRequest;
import com.hrithik.linktrack.dto.UserResponse;
import com.hrithik.linktrack.entity.Role;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.exception.BadRequestException;
import com.hrithik.linktrack.exception.DuplicateResourceException;
import com.hrithik.linktrack.repository.UserRepository;
import com.hrithik.linktrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("name", user.getName());

        org.springframework.security.core.userdetails.UserDetails userDetails =
                (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(userDetails, extraClaims);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }
}
