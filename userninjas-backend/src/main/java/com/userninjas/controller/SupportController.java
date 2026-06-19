package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final SupabaseService supabaseService;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w!#$%&'*+/=?`{|}~^-]+(?:\\.[\\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$");

    public SupportController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @PostMapping("/ticket")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String issue = (String) body.get("issue");
        String conversationId = (String) body.get("conversation_id");
        String priority = (String) body.get("priority");

        Map<String, String> errors = new HashMap<>();
        if (name == null || name.trim().length() < 2) {
            errors.put("name", "Name must be at least 2 characters");
        }
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            errors.put("email", "A valid email address is required");
        }
        if (issue == null || issue.trim().length() < 10) {
            errors.put("issue", "Issue description must be at least 10 characters");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "error", "Validation failed",
                "details", errors
            ));
        }

        List<String> validPriorities = List.of("low", "normal", "high", "urgent");
        String ticketPriority = (priority != null && validPriorities.contains(priority.toLowerCase()))
            ? priority.toLowerCase()
            : "normal";

        Map<String, Object> ticketData = new HashMap<>();
        ticketData.put("name", name.trim());
        ticketData.put("email", email.trim().toLowerCase());
        ticketData.put("issue", issue.trim());
        ticketData.put("priority", ticketPriority);
        ticketData.put("conversation_id", conversationId);
        ticketData.put("status", "open");

        var response = supabaseService.insert("support_tickets", ticketData);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create support ticket"));
        }

        Map<?, ?> ticket = (Map<?, ?>) response.getBody().get(0);

        if (conversationId != null && !conversationId.trim().isEmpty()) {
            Map<String, Object> updateConv = Map.of(
                "visitor_name", name.trim(),
                "visitor_email", email.trim().toLowerCase(),
                "status", "escalated",
                "escalated_at", Instant.now().toString()
            );
            supabaseService.update("chat_conversations", Map.of("id", "eq." + conversationId), updateConv);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "ticket", ticket
        ));
    }
}
