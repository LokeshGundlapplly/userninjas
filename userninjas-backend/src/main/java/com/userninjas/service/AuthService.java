package com.userninjas.service;

import com.userninjas.dto.AuthDto;
import com.userninjas.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AuthService handles authentication by delegating to Supabase Auth REST API.
 * JWT tokens are issued by this Spring Boot service after Supabase auth verification.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.anon-key}")
    private String supabaseAnonKey;

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();

    // In-memory OTP store — use Redis in production
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public AuthService(JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Sign up via Supabase Auth then store extra metadata in profiles
     */
    public AuthDto.AuthResponse signUp(AuthDto.SignUpRequest req) {
        HttpHeaders headers = supabaseHeaders();
        headers.set("Content-Type", "application/json");

        var body = Map.of(
            "email", req.email(),
            "password", req.password(),
            "data", Map.of(
                "full_name", req.fullName(),
                "role", req.role()
            )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                supabaseUrl + "/auth/v1/signup",
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> responseBody = response.getBody();
                String userId = (String) responseBody.get("id");
                String token = jwtUtil.generateToken(req.email(), userId, req.role());
                return new AuthDto.AuthResponse(token, userId, req.email(), req.role(), req.fullName());
            }
        } catch (Exception e) {
            log.error("Supabase signup error: {}", e.getMessage());
            throw new RuntimeException("Sign up failed: " + e.getMessage());
        }

        throw new RuntimeException("Sign up failed");
    }

    /**
     * Sign in via Supabase Auth
     */
    public AuthDto.AuthResponse signIn(AuthDto.SignInRequest req) {
        HttpHeaders headers = supabaseHeaders();
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = Map.of(
            "email", req.email(),
            "password", req.password()
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                supabaseUrl + "/auth/v1/token?grant_type=password",
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body2 = response.getBody();
                Map<?, ?> user = (Map<?, ?>) body2.get("user");
                String userId = (String) user.get("id");
                Map<?, ?> metadata = (Map<?, ?>) user.get("user_metadata");
                String role = metadata != null ? (String) metadata.get("role") : "tester";
                String fullName = metadata != null ? (String) metadata.get("full_name") : "";

                String token = jwtUtil.generateToken(req.email(), userId, role != null ? role : "tester");
                return new AuthDto.AuthResponse(token, userId, req.email(), role, fullName);
            }
        } catch (Exception e) {
            log.error("Supabase signin error: {}", e.getMessage());
            throw new RuntimeException("Invalid email or password");
        }

        throw new RuntimeException("Sign in failed");
    }

    /**
     * Generate and send OTP for passwordless login
     */
    public void sendOtp(String email) {
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        otpStore.put(email, otp);

        // In production: send email via JavaMail or Supabase send-email function
        log.info("OTP for {} is {} (send via email in production)", email, otp);

        // Optionally: call Supabase magic link
        HttpHeaders headers = supabaseHeaders();
        Map<String, Object> body = Map.of("email", email);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        try {
            restTemplate.postForEntity(supabaseUrl + "/auth/v1/otp", req, Map.class);
        } catch (Exception e) {
            log.warn("Supabase OTP send warning: {}", e.getMessage());
        }
    }

    /**
     * Verify OTP and return auth token
     */
    public AuthDto.AuthResponse verifyOtp(AuthDto.OtpVerifyRequest req) {
        String storedOtp = otpStore.get(req.email());

        if (storedOtp != null && storedOtp.equals(req.otp())) {
            otpStore.remove(req.email());
            // Generate token with tester role (OTP users default to tester)
            String token = jwtUtil.generateToken(req.email(), req.email(), "tester");
            return new AuthDto.AuthResponse(token, req.email(), req.email(), "tester", "");
        }

        // Also verify via Supabase
        HttpHeaders headers = supabaseHeaders();
        Map<String, Object> body = Map.of("email", req.email(), "token", req.otp(), "type", "email");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                supabaseUrl + "/auth/v1/verify",
                request,
                Map.class
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> user = (Map<?, ?>) response.getBody().get("user");
                String userId = (String) user.get("id");
                String token = jwtUtil.generateToken(req.email(), userId, "tester");
                return new AuthDto.AuthResponse(token, userId, req.email(), "tester", "");
            }
        } catch (Exception e) {
            log.error("OTP verify error: {}", e.getMessage());
        }

        throw new RuntimeException("Invalid or expired OTP");
    }

    private HttpHeaders supabaseHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", "Bearer " + supabaseAnonKey);
        return headers;
    }
}
