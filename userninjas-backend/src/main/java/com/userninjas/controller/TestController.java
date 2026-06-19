package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final SupabaseService supabaseService;

    public TestController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTests(Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        Map<String, String> filters = new HashMap<>();
        filters.put("select", "*");
        if ("ROLE_RECRUITER".equals(role)) {
            filters.put("recruiter_id", "eq." + userId);
        }

        var response = supabaseService.select("tests", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestById(@PathVariable String id) {
        Map<String, String> filters = Map.of(
            "id", "eq." + id,
            "select", "*"
        );
        var response = supabaseService.select("tests", filters);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createTest(@RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        body.put("recruiter_id", userId);

        var response = supabaseService.insert("tests", body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response.getBody().get(0));
        }
        return ResponseEntity.badRequest().body("Failed to create test");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTest(@PathVariable String id, @RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // Verify ownership
        Map<String, String> checkFilters = Map.of("id", "eq." + id, "select", "recruiter_id");
        var checkResponse = supabaseService.select("tests", checkFilters);
        if (!checkResponse.getStatusCode().is2xxSuccessful() || checkResponse.getBody() == null || checkResponse.getBody().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<?, ?> testObj = (Map<?, ?>) checkResponse.getBody().get(0);
        String recruiterId = (String) testObj.get("recruiter_id");
        if (!"ROLE_ADMIN".equals(role) && !userId.equals(recruiterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden: You do not own this test");
        }

        body.remove("id");
        body.remove("recruiter_id");
        body.remove("created_at");

        var response = supabaseService.update("tests", Map.of("id", "eq." + id), body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.badRequest().body("Failed to update test");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTest(@PathVariable String id, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // Verify ownership
        Map<String, String> checkFilters = Map.of("id", "eq." + id, "select", "recruiter_id");
        var checkResponse = supabaseService.select("tests", checkFilters);
        if (!checkResponse.getStatusCode().is2xxSuccessful() || checkResponse.getBody() == null || checkResponse.getBody().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<?, ?> testObj = (Map<?, ?>) checkResponse.getBody().get(0);
        String recruiterId = (String) testObj.get("recruiter_id");
        if (!"ROLE_ADMIN".equals(role) && !userId.equals(recruiterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden: You do not own this test");
        }

        var response = supabaseService.delete("tests", Map.of("id", "eq." + id));
        return ResponseEntity.status(response.getStatusCode()).build();
    }
}
