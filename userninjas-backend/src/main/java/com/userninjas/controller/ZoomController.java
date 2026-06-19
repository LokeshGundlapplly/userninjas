package com.userninjas.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/zoom")
public class ZoomController {

    private static final Logger log = LoggerFactory.getLogger(ZoomController.class);

    @Value("${app.zoom.account-id:}")
    private String zoomAccountId;

    @Value("${app.zoom.client-id:}")
    private String zoomClientId;

    @Value("${app.zoom.client-secret:}")
    private String zoomClientSecret;

    @Value("${app.zoom.user-id:me}")
    private String zoomUserId;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/meeting")
    public ResponseEntity<?> createMeeting(@RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("topic", "User Research Session");
        Integer duration = (Integer) body.getOrDefault("duration", 60);
        String startTime = (String) body.get("startTime");

        if (zoomAccountId.isEmpty() || zoomClientId.isEmpty() || zoomClientSecret.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "placeholder", true,
                "message", "Zoom credentials not configured. Falling back to static meeting link.",
                "joinUrl", "https://zoom.us/j/1234567890",
                "meetingId", "1234567890"
            ));
        }

        try {
            String accessToken = getZoomAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> meetingRequest = new HashMap<>();
            meetingRequest.put("topic", topic);
            meetingRequest.put("type", 2); // Scheduled meeting
            if (startTime != null) {
                meetingRequest.put("start_time", startTime);
            }
            meetingRequest.put("duration", duration);
            meetingRequest.put("timezone", "UTC");

            Map<String, Object> settings = new HashMap<>();
            settings.put("waiting_room", true);
            settings.put("join_before_host", false);
            settings.put("host_video", true);
            settings.put("participant_video", true);
            settings.put("mute_upon_entry", false);
            meetingRequest.put("settings", settings);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(meetingRequest, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.zoom.us/v2/users/" + zoomUserId + "/meetings",
                entity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> meeting = (Map<String, Object>) response.getBody();
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "placeholder", false,
                    "meetingId", String.valueOf(meeting.get("id")),
                    "joinUrl", meeting.get("join_url"),
                    "startUrl", meeting.get("start_url"),
                    "password", meeting.getOrDefault("password", "")
                ));
            }
        } catch (Exception e) {
            log.error("Failed to create Zoom meeting", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create Zoom meeting"));
    }

    private String getZoomAccessToken() {
        String auth = zoomClientId + ":" + zoomClientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + zoomAccountId,
            entity,
            Map.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("access_token");
        }
        throw new RuntimeException("Zoom authentication failed");
    }
}
