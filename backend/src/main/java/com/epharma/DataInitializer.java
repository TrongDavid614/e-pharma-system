package com.epharma;

import com.epharma.entity.User;
import com.epharma.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin", "admin123", User.Role.ADMIN);
        createUserIfNotExists("pharmacist", "pharma123", User.Role.PHARMACIST);
    }

    private void createUserIfNotExists(String username, String password, User.Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .build();
            userRepository.save(user);
            log.info("Created default user: {} with role: {}", username, role);
        } else {
            log.info("User already exists: {}", username);
        }
    }
}
