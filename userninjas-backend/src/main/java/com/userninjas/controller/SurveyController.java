package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/surveys")
@PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
public class SurveyController {

    private final SupabaseService supabaseService;

    public SurveyController(SupabaseService supabaseService) {
        this.supabaseService = supabaseService;
    }

    @GetMapping
    public ResponseEntity<?> getSurveys(Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        Map<String, String> filters = new HashMap<>();
        filters.put("select", "*");
        filters.put("recruiter_id", "eq." + userId);
        filters.put("order", "created_at.desc");

        var response = supabaseService.select("surveys", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/{surveyId}/responses")
    public ResponseEntity<?> getResponses(@PathVariable String surveyId) {
        Map<String, String> filters = new HashMap<>();
        filters.put("select", "*");
        filters.put("survey_id", "eq." + surveyId);
        filters.put("order", "created_at.desc");

        var response = supabaseService.select("survey_responses", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PostMapping
    public ResponseEntity<?> createSurvey(@RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();

        // 1. Insert Survey
        Map<String, Object> surveyData = new HashMap<>();
        surveyData.put("recruiter_id", userId);
        surveyData.put("title", body.get("title"));
        surveyData.put("description", body.get("description"));
        surveyData.put("status", "active");

        ResponseEntity<List> surveyInsertResponse = supabaseService.insert("surveys", surveyData);
        if (!surveyInsertResponse.getStatusCode().is2xxSuccessful() || surveyInsertResponse.getBody() == null || surveyInsertResponse.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to insert survey record");
        }

        Map<String, Object> createdSurvey = (Map<String, Object>) surveyInsertResponse.getBody().get(0);
        String surveyId = (String) createdSurvey.get("id");

        // 2. Insert Questions
        List<Map<String, Object>> questions = (List<Map<String, Object>>) body.get("questions");
        if (questions != null) {
            for (int i = 0; i < questions.size(); i++) {
                Map<String, Object> q = new HashMap<>(questions.get(i));
                String qText = (String) q.get("question_text");
                if (qText == null || qText.trim().isEmpty()) {
                    continue;
                }
                q.put("survey_id", surveyId);
                q.put("sort_order", i);
                
                // Filter empty options
                if ("mcq".equals(q.get("question_type"))) {
                    List<String> options = (List<String>) q.get("options");
                    if (options != null) {
                        List<String> filteredOptions = new ArrayList<>();
                        for (String opt : options) {
                            if (opt != null && !opt.trim().isEmpty()) {
                                filteredOptions.add(opt.trim());
                            }
                        }
                        q.put("options", filteredOptions);
                    }
                } else {
                    q.put("options", new ArrayList<>());
                }

                supabaseService.insert("survey_questions", q);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSurvey);
    }
}
