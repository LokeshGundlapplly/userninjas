package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final SupabaseService supabaseService;

    public UserController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        Map<String, String> filters = Map.of(
            "user_id", "eq." + userId,
            "select", "*"
        );
        var response = supabaseService.select("profiles", filters);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        Map<String, String> filters = Map.of("user_id", "eq." + userId);
        
        // Exclude system fields from direct updates
        body.remove("id");
        body.remove("user_id");
        body.remove("role");
        
        var response = supabaseService.update("profiles", filters, body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.badRequest().body("Failed to update profile");
    }
}
