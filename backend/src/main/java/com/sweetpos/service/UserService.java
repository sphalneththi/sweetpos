package com.sweetpos.service;

import com.sweetpos.dto.CreateUserRequest;
import com.sweetpos.dto.UserDto;
import com.sweetpos.entity.User;
import com.sweetpos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> findAll() {
        return userRepository.findAll().stream().map(UserDto::from).collect(Collectors.toList());
    }

    public UserDto findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(User.UserRole.valueOf(request.getRole().toUpperCase()))
                .active(true)
                .build();

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto update(UUID id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void toggleActive(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        user.setFailedLoginAttempts(0); // reset lock on toggle
        userRepository.save(user);
    }

    @Transactional
    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

    /**
     * Called on application startup to ensure an admin user exists
     */
    @Transactional
    public void ensureAdminExists() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("Administrator")
                    .role(User.UserRole.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
        }
        if (!userRepository.existsByUsername("cashier")) {
            User cashier = User.builder()
                    .username("cashier")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("Default Cashier")
                    .role(User.UserRole.CASHIER)
                    .active(true)
                    .build();
            userRepository.save(cashier);
        }
    }
}
