package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final SupabaseService supabaseService;

    public PublicController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactForm(@RequestBody Map<String, Object> body) {
        Map<String, Object> submission = new HashMap<>();
        submission.put("first_name", body.get("firstName"));
        submission.put("last_name", body.get("lastName"));
        submission.put("email", body.get("email"));
        submission.put("subject", body.get("subject"));
        submission.put("message", body.get("message"));

        var response = supabaseService.insert("contact_submissions", submission);
        if (response.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Contact form submitted successfully"));
        }
        return ResponseEntity.badRequest().body("Failed to submit contact form");
    }
}
