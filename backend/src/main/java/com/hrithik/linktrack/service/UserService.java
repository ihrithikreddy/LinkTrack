package com.hrithik.linktrack.service;

import com.hrithik.linktrack.dto.UpdateUserRequest;
import com.hrithik.linktrack.dto.UserResponse;
import com.hrithik.linktrack.entity.User;
import com.hrithik.linktrack.exception.ResourceNotFoundException;
import com.hrithik.linktrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateUserRequest request) {
        User user = getUserByEmail(email);
        user.setName(request.getName().trim());
        User updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
