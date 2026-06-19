package com.userninjas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * AIService - wraps Groq API calls (replacing Supabase Edge Functions).
 * Handles: ai-test-creator, ai-interview-session, ai-interview-report,
 *          ai-eligibility-check, summarize-transcript
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);
    private static final String MODEL = "llama3-8b-8192";

    @Value("${app.groq.api-key}")
    private String groqApiKey;

    @Value("${app.groq.base-url}")
    private String groqBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public record ChatMessage(String role, String content) {}

    public record AIRequest(String context, String userMessage, String systemPrompt) {}
    public record AIResponse(String response, boolean success) {}

    /**
     * Create test structure from description using Groq AI
     */
    public AIResponse createTest(String productDescription, String goals) {
        String systemPrompt = """
            You are an expert UX researcher. Create a structured usability test plan.
            Return a JSON object with: title, description, tasks (array), 
            screenerQuestions (array), estimatedDuration (minutes).
            """;
        String userMessage = "Product: " + productDescription + "\nGoals: " + goals;
        return callGroq(systemPrompt, userMessage);
    }

    /**
     * AI Interview session - get next question
     */
    public AIResponse getInterviewQuestion(String context, List<ChatMessage> history) {
        String systemPrompt = """
            You are an expert UX interviewer. Based on the context and conversation history,
            ask the next most relevant question to understand the user's experience.
            Keep questions open-ended and empathetic.
            """;
        StringBuilder historyStr = new StringBuilder();
        for (ChatMessage msg : history) {
            historyStr.append(msg.role()).append(": ").append(msg.content()).append("\n");
        }
        return callGroq(systemPrompt, "Context: " + context + "\n\nHistory:\n" + historyStr);
    }

    /**
     * Generate interview report
     */
    public AIResponse generateReport(String transcript, String goals) {
        String systemPrompt = """
            You are a UX research analyst. Analyze the interview transcript and create a comprehensive report.
            Include: key findings, pain points, opportunities, recommendations.
            Return structured JSON with sections.
            """;
        return callGroq(systemPrompt, "Goals: " + goals + "\n\nTranscript:\n" + transcript);
    }

    /**
     * Check tester eligibility based on screener answers
     */
    public AIResponse checkEligibility(String screenerQuestions, String answers) {
        String systemPrompt = """
            Evaluate if this tester meets the study criteria based on their screener answers.
            Return JSON: { "eligible": boolean, "reason": "explanation" }
            """;
        return callGroq(systemPrompt, "Questions: " + screenerQuestions + "\nAnswers: " + answers);
    }

    /**
     * Summarize transcript to key insights
     */
    public AIResponse summarizeTranscript(String transcript) {
        String systemPrompt = """
            Summarize this UX research transcript. Extract:
            - Top 3 pain points
            - Top 3 positive findings  
            - Key quotes
            - Recommended actions
            Return as structured JSON.
            """;
        return callGroq(systemPrompt, transcript);
    }

    private AIResponse callGroq(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(groqApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        var body = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "temperature", 0.7,
            "max_tokens", 2048
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                groqBaseUrl + "/chat/completions",
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> choices = (List<?>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) choice.get("message");
                    String content = (String) message.get("content");
                    return new AIResponse(content, true);
                }
            }
        } catch (Exception e) {
            log.error("Groq API error: {}", e.getMessage());
            return new AIResponse("AI service temporarily unavailable", false);
        }

        return new AIResponse("No response from AI", false);
    }
}
