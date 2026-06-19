package com.userninjas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record SignUpRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String fullName,
        @NotBlank String role  // "tester" | "recruiter"
    ) {}

    public record SignInRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record OtpRequest(
        @NotBlank @Email String email
    ) {}

    public record OtpVerifyRequest(
        @NotBlank @Email String email,
        @NotBlank String otp
    ) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6) String newPassword
    ) {}

    public record AuthResponse(
        String token,
        String userId,
        String email,
        String role,
        String fullName
    ) {}

    public record MessageResponse(String message) {}
}
