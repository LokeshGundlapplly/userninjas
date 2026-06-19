package com.userninjas.controller;

import com.userninjas.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/create-test")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<AIService.AIResponse> createTest(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            aiService.createTest(body.get("productDescription"), body.get("goals"))
        );
    }

    @PostMapping("/interview-question")
    public ResponseEntity<AIService.AIResponse> getInterviewQuestion(@RequestBody Map<String, Object> body) {
        String context = (String) body.get("context");
        @SuppressWarnings("unchecked")
        List<Map<String, String>> historyRaw = (List<Map<String, String>>) body.get("history");

        List<AIService.ChatMessage> history = historyRaw != null
            ? historyRaw.stream().map(m -> new AIService.ChatMessage(m.get("role"), m.get("content"))).toList()
            : List.of();

        return ResponseEntity.ok(aiService.getInterviewQuestion(context, history));
    }

    @PostMapping("/interview-report")
    public ResponseEntity<AIService.AIResponse> generateReport(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            aiService.generateReport(body.get("transcript"), body.get("goals"))
        );
    }

    @PostMapping("/eligibility-check")
    public ResponseEntity<AIService.AIResponse> checkEligibility(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            aiService.checkEligibility(body.get("screenerQuestions"), body.get("answers"))
        );
    }

    @PostMapping("/summarize-transcript")
    public ResponseEntity<AIService.AIResponse> summarizeTranscript(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.summarizeTranscript(body.get("transcript")));
    }
}
