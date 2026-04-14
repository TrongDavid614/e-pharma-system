package com.epharma.controller;

import com.epharma.dto.LoginRequest;
import com.epharma.dto.LoginResponse;
import com.epharma.dto.RegisterRequest;
import com.epharma.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.getUsername(), request.getPassword(), request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully"));
    }
}
