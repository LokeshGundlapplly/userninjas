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
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SupabaseService supabaseService;

    public SubmissionController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @GetMapping
    public ResponseEntity<?> getAllSubmissions(Authentication authentication,
                                               @RequestParam(required = false) String testId) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        Map<String, String> filters = new HashMap<>();
        
        if ("ROLE_TESTER".equals(role)) {
            filters.put("tester_id", "eq." + userId);
            filters.put("select", "*");
        } else if ("ROLE_RECRUITER".equals(role)) {
            filters.put("select", "*,tests!inner(recruiter_id)");
            filters.put("tests.recruiter_id", "eq." + userId);
        } else {
            filters.put("select", "*");
        }

        if (testId != null) {
            filters.put("test_id", "eq." + testId);
        }

        var response = supabaseService.select("test_submissions", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmissionById(@PathVariable String id, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        Map<String, String> filters = Map.of(
            "id", "eq." + id,
            "select", "*,tests(recruiter_id)"
        );
        
        var response = supabaseService.select("test_submissions", filters);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<?, ?> submission = (Map<?, ?>) response.getBody().get(0);
        
        String testerId = (String) submission.get("tester_id");
        Map<?, ?> test = (Map<?, ?>) submission.get("tests");
        String recruiterId = (test != null) ? (String) test.get("recruiter_id") : null;

        if (!"ROLE_ADMIN".equals(role) && !userId.equals(testerId) && !userId.equals(recruiterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden: Access denied to this submission");
        }

        return ResponseEntity.ok(submission);
    }

    @PostMapping
    public ResponseEntity<?> createSubmission(@RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        body.put("tester_id", userId);
        body.put("status", "pending");

        var response = supabaseService.insert("test_submissions", body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response.getBody().get(0));
        }
        return ResponseEntity.badRequest().body("Failed to create submission");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubmission(@PathVariable String id, @RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        Map<String, String> checkFilters = Map.of(
            "id", "eq." + id,
            "select", "tester_id,tests(recruiter_id)"
        );
        var checkResponse = supabaseService.select("test_submissions", checkFilters);
        if (!checkResponse.getStatusCode().is2xxSuccessful() || checkResponse.getBody() == null || checkResponse.getBody().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<?, ?> subObj = (Map<?, ?>) checkResponse.getBody().get(0);
        String testerId = (String) subObj.get("tester_id");
        Map<?, ?> testObj = (Map<?, ?>) subObj.get("tests");
        String recruiterId = (testObj != null) ? (String) testObj.get("recruiter_id") : null;

        if (!"ROLE_ADMIN".equals(role) && !userId.equals(testerId) && !userId.equals(recruiterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden: Cannot update this submission");
        }

        body.remove("id");
        body.remove("tester_id");
        body.remove("test_id");
        body.remove("created_at");

        var response = supabaseService.update("test_submissions", Map.of("id", "eq." + id), body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.badRequest().body("Failed to update submission");
    }
}
