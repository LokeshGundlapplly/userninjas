package com.userninjas.controller;

import com.userninjas.dto.AuthDto;
import com.userninjas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthDto.AuthResponse> signUp(@Valid @RequestBody AuthDto.SignUpRequest req) {
        return ResponseEntity.ok(authService.signUp(req));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthDto.AuthResponse> signIn(@Valid @RequestBody AuthDto.SignInRequest req) {
        return ResponseEntity.ok(authService.signIn(req));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<AuthDto.MessageResponse> sendOtp(@Valid @RequestBody AuthDto.OtpRequest req) {
        authService.sendOtp(req.email());
        return ResponseEntity.ok(new AuthDto.MessageResponse("OTP sent to " + req.email()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthDto.AuthResponse> verifyOtp(@Valid @RequestBody AuthDto.OtpVerifyRequest req) {
        return ResponseEntity.ok(authService.verifyOtp(req));
    }
}
