package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final SupabaseService supabaseService;

    public AdminController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        // Fetch user roles
        ResponseEntity<List> rolesResponse = supabaseService.select("user_roles", Map.of("select", "*"));
        if (!rolesResponse.getStatusCode().is2xxSuccessful() || rolesResponse.getBody() == null) {
            return ResponseEntity.status(rolesResponse.getStatusCode()).body("Failed to load user roles");
        }
        List<Map<String, Object>> roles = (List<Map<String, Object>>) rolesResponse.getBody();

        // Fetch profiles
        ResponseEntity<List> profilesResponse = supabaseService.select("profiles", Map.of("select", "*"));
        List<Map<String, Object>> profiles = profilesResponse.getBody() != null 
            ? (List<Map<String, Object>>) profilesResponse.getBody() 
            : new ArrayList<>();

        // Create a map of user_id -> profile
        Map<String, Map<String, Object>> profileMap = new HashMap<>();
        for (Map<String, Object> p : profiles) {
            String userId = (String) p.get("user_id");
            if (userId != null) {
                profileMap.put(userId, p);
            }
        }

        // Merge them
        List<Map<String, Object>> merged = new ArrayList<>();
        for (Map<String, Object> r : roles) {
            String userId = (String) r.get("user_id");
            Map<String, Object> mergedUser = new HashMap<>(r);
            if (userId != null && profileMap.containsKey(userId)) {
                mergedUser.put("profile", profileMap.get(userId));
            }
            merged.add(mergedUser);
        }

        return ResponseEntity.ok(merged);
    }

    // PUT /api/admin/users/{userId}/role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        String role = (String) body.get("role");
        if (role == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }
        // Update user_roles
        Map<String, String> filters = Map.of("user_id", "eq." + userId);
        Map<String, Object> updateBody = Map.of("role", role);
        ResponseEntity<List> updateResponse = supabaseService.update("user_roles", filters, updateBody);
        if (updateResponse.getStatusCode().is2xxSuccessful() && updateResponse.getBody() != null && !updateResponse.getBody().isEmpty()) {
            return ResponseEntity.ok(updateResponse.getBody().get(0));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user role");
    }

    // GET /api/admin/tests
    @GetMapping("/tests")
    public ResponseEntity<?> getTests() {
        ResponseEntity<List> testsResponse = supabaseService.select("tests", Map.of("select", "*", "order", "created_at.desc"));
        if (!testsResponse.getStatusCode().is2xxSuccessful() || testsResponse.getBody() == null) {
            return ResponseEntity.status(testsResponse.getStatusCode()).body("Failed to load tests");
        }
        List<Map<String, Object>> tests = (List<Map<String, Object>>) testsResponse.getBody();

        // Fetch profiles for recruiter mapping
        ResponseEntity<List> profilesResponse = supabaseService.select("profiles", Map.of("select", "*"));
        List<Map<String, Object>> profiles = profilesResponse.getBody() != null 
            ? (List<Map<String, Object>>) profilesResponse.getBody() 
            : new ArrayList<>();

        Map<String, Map<String, Object>> profileMap = new HashMap<>();
        for (Map<String, Object> p : profiles) {
            String userId = (String) p.get("user_id");
            if (userId != null) {
                profileMap.put(userId, p);
            }
        }

        List<Map<String, Object>> enrichedTests = new ArrayList<>();
        for (Map<String, Object> t : tests) {
            String recruiterId = (String) t.get("recruiter_id");
            Map<String, Object> enrichedTest = new HashMap<>(t);
            if (recruiterId != null && profileMap.containsKey(recruiterId)) {
                enrichedTest.put("recruiter", profileMap.get(recruiterId));
            }
            enrichedTests.add(enrichedTest);
        }

        return ResponseEntity.ok(enrichedTests);
    }

    // PUT /api/admin/tests/{testId}
    @PutMapping("/tests/{testId}")
    public ResponseEntity<?> updateTest(@PathVariable String testId, @RequestBody Map<String, Object> body) {
        Map<String, String> filters = Map.of("id", "eq." + testId);
        
        // Clean fields that shouldn't be edited directly
        body.remove("id");
        body.remove("created_at");
        body.remove("recruiter_id");

        ResponseEntity<List> response = supabaseService.update("tests", filters, body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update test");
    }

    // DELETE /api/admin/tests/{testId}
    @DeleteMapping("/tests/{testId}")
    public ResponseEntity<?> deleteTest(@PathVariable String testId) {
        Map<String, String> filters = Map.of("id", "eq." + testId);
        ResponseEntity<Void> response = supabaseService.delete("tests", filters);
        if (response.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete test");
    }

    // GET /api/admin/submissions
    @GetMapping("/submissions")
    public ResponseEntity<?> getSubmissions() {
        ResponseEntity<List> subsResponse = supabaseService.select("test_submissions", Map.of("select", "*", "order", "created_at.desc"));
        if (!subsResponse.getStatusCode().is2xxSuccessful() || subsResponse.getBody() == null) {
            return ResponseEntity.status(subsResponse.getStatusCode()).body("Failed to load submissions");
        }
        List<Map<String, Object>> submissions = (List<Map<String, Object>>) subsResponse.getBody();

        // Fetch tests
        ResponseEntity<List> testsResponse = supabaseService.select("tests", Map.of("select", "id,title,reward_amount"));
        List<Map<String, Object>> tests = testsResponse.getBody() != null 
            ? (List<Map<String, Object>>) testsResponse.getBody() 
            : new ArrayList<>();

        Map<String, Map<String, Object>> testMap = new HashMap<>();
        for (Map<String, Object> t : tests) {
            String id = (String) t.get("id");
            if (id != null) {
                testMap.put(id, t);
            }
        }

        // Fetch profiles
        ResponseEntity<List> profilesResponse = supabaseService.select("profiles", Map.of("select", "user_id,full_name"));
        List<Map<String, Object>> profiles = profilesResponse.getBody() != null 
            ? (List<Map<String, Object>>) profilesResponse.getBody() 
            : new ArrayList<>();

        Map<String, Map<String, Object>> profileMap = new HashMap<>();
        for (Map<String, Object> p : profiles) {
            String userId = (String) p.get("user_id");
            if (userId != null) {
                profileMap.put(userId, p);
            }
        }

        List<Map<String, Object>> enriched = new ArrayList<>();
        for (Map<String, Object> s : submissions) {
            String testId = (String) s.get("test_id");
            String testerId = (String) s.get("tester_id");
            Map<String, Object> enrichedSub = new HashMap<>(s);
            if (testId != null && testMap.containsKey(testId)) {
                enrichedSub.put("tests", testMap.get(testId));
            }
            if (testerId != null && profileMap.containsKey(testerId)) {
                enrichedSub.put("profiles", profileMap.get(testerId));
            }
            enriched.add(enrichedSub);
        }

        return ResponseEntity.ok(enriched);
    }

    // GET /api/admin/tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets() {
        ResponseEntity<List> response = supabaseService.select("support_tickets", Map.of("select", "*", "order", "created_at.desc"));
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return ResponseEntity.ok(response.getBody());
        }
        return ResponseEntity.status(response.getStatusCode()).body("Failed to load support tickets");
    }

    // PUT /api/admin/tickets/{ticketId}
    @PutMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, String> filters = Map.of("id", "eq." + ticketId);
        ResponseEntity<List> response = supabaseService.update("support_tickets", filters, body);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update ticket");
    }

    // GET /api/admin/conversations
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations() {
        ResponseEntity<List> response = supabaseService.select("chat_conversations", Map.of("select", "*", "order", "created_at.desc"));
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return ResponseEntity.ok(response.getBody());
        }
        return ResponseEntity.status(response.getStatusCode()).body("Failed to load chat conversations");
    }

    // GET /api/admin/conversations/{convId}/messages
    @GetMapping("/conversations/{convId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable String convId) {
        ResponseEntity<List> response = supabaseService.select("chat_messages", Map.of("conversation_id", "eq." + convId, "order", "created_at.asc"));
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return ResponseEntity.ok(response.getBody());
        }
        return ResponseEntity.status(response.getStatusCode()).body("Failed to load chat messages");
    }

    // POST /api/admin/conversations/{convId}/messages
    @PostMapping("/conversations/{convId}/messages")
    public ResponseEntity<?> sendAgentReply(@PathVariable String convId, @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message content is required");
        }

        Map<String, Object> messageData = Map.of(
            "conversation_id", convId,
            "role", "agent",
            "content", content.trim()
        );

        ResponseEntity<List> insertResponse = supabaseService.insert("chat_messages", messageData);
        if (!insertResponse.getStatusCode().is2xxSuccessful() || insertResponse.getBody() == null || insertResponse.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send reply message");
        }

        // Update conversation last message / updated timestamp
        Map<String, Object> convUpdate = Map.of(
            "last_message", content.trim(),
            "updated_at", java.time.Instant.now().toString()
        );
        supabaseService.update("chat_conversations", Map.of("id", "eq." + convId), convUpdate);

        return ResponseEntity.ok(insertResponse.getBody().get(0));
    }

    // PUT /api/admin/conversations/{convId}/close
    @PutMapping("/conversations/{convId}/close")
    public ResponseEntity<?> closeConversation(@PathVariable String convId) {
        Map<String, Object> convUpdate = Map.of(
            "status", "closed",
            "updated_at", java.time.Instant.now().toString()
        );
        ResponseEntity<List> response = supabaseService.update("chat_conversations", Map.of("id", "eq." + convId), convUpdate);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
            return ResponseEntity.ok(response.getBody().get(0));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to close conversation");
    }
}
