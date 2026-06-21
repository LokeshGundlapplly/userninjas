package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/tester")
public class TesterController {

    private static final Logger log = LoggerFactory.getLogger(TesterController.class);

    private final SupabaseService supabaseService;
    private final EmailController emailController;

    @Value("${app.zoom.account-id:}")
    private String zoomAccountId;

    @Value("${app.zoom.client-id:}")
    private String zoomClientId;

    @Value("${app.zoom.client-secret:}")
    private String zoomClientSecret;

    @Value("${app.zoom.user-id:me}")
    private String zoomUserId;

    private final RestTemplate restTemplate = new RestTemplate();

    public TesterController(SupabaseService supabaseService, EmailController emailController) {
        this.supabaseService = supabaseService;
        this.emailController = emailController;
    }

    @GetMapping("/earnings")
    public ResponseEntity<?> getEarnings(Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        Map<String, String> filters = Map.of(
            "tester_id", "eq." + userId,
            "select", "*"
        );
        var response = supabaseService.select("earnings", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/scheduled-sessions")
    public ResponseEntity<?> getScheduledSessions(Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        Map<String, String> filters = Map.of(
            "tester_id", "eq." + userId,
            "select", "*,tests(title,reward_amount,estimated_duration),study_slots(start_time,end_time)"
        );
        var response = supabaseService.select("scheduled_sessions", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam String testId) {
        String now = Instant.now().toString();
        Map<String, String> filters = Map.of(
            "test_id", "eq." + testId,
            "status", "eq.available",
            "start_time", "gt." + now,
            "select", "*"
        );
        var response = supabaseService.select("study_slots", filters);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PostMapping("/book-slot")
    public ResponseEntity<?> bookSlot(@RequestBody Map<String, Object> body, Authentication authentication) {
        String userId = (String) authentication.getCredentials();
        String userEmail = authentication.getName(); // email from token
        String slotId = (String) body.get("slotId");
        String testId = (String) body.get("testId");

        if (slotId == null || testId == null) {
            return ResponseEntity.badRequest().body("slotId and testId are required");
        }

        // 1. Fetch test details
        Map<String, String> testFilters = Map.of("id", "eq." + testId, "select", "*");
        var testResponse = supabaseService.select("tests", testFilters);
        if (!testResponse.getStatusCode().is2xxSuccessful() || testResponse.getBody() == null || testResponse.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test not found");
        }
        Map<String, Object> testObj = (Map<String, Object>) testResponse.getBody().get(0);

        // 2. Fetch slot details
        Map<String, String> slotFilters = Map.of("id", "eq." + slotId, "select", "*");
        var slotResponse = supabaseService.select("study_slots", slotFilters);
        if (!slotResponse.getStatusCode().is2xxSuccessful() || slotResponse.getBody() == null || slotResponse.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Slot not found");
        }
        Map<String, Object> slotObj = (Map<String, Object>) slotResponse.getBody().get(0);

        // Verify status is available
        String status = (String) slotObj.get("status");
        if (!"available".equals(status)) {
            return ResponseEntity.badRequest().body("Slot is no longer available");
        }

        // 3. Update slot status to booked
        Map<String, Object> slotUpdate = new HashMap<>();
        slotUpdate.put("status", "booked");
        slotUpdate.put("booked_by", userId);
        slotUpdate.put("booked_at", Instant.now().toString());

        var updateResponse = supabaseService.update("study_slots", Map.of("id", "eq." + slotId, "status", "eq.available"), slotUpdate);
        if (!updateResponse.getStatusCode().is2xxSuccessful() || updateResponse.getBody() == null || updateResponse.getBody().isEmpty()) {
            return ResponseEntity.badRequest().body("Failed to book slot. It might have been booked by someone else.");
        }

        // 4. Create Zoom meeting details
        String zoomJoinUrl = (String) testObj.get("meeting_link");
        String zoomMeetingId = null;
        String zoomPassword = null;

        // Try Zoom meeting creation
        if (!zoomAccountId.isEmpty() && !zoomClientId.isEmpty() && !zoomClientSecret.isEmpty()) {
            try {
                String accessToken = getZoomAccessToken();
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(accessToken);
                headers.set("Content-Type", "application/json");

                Map<String, Object> meetingRequest = new HashMap<>();
                meetingRequest.put("topic", "User Research: " + testObj.get("title"));
                meetingRequest.put("type", 2);
                meetingRequest.put("start_time", slotObj.get("start_time"));
                meetingRequest.put("duration", testObj.getOrDefault("estimated_duration", 60));
                meetingRequest.put("timezone", "UTC");

                Map<String, Object> settings = new HashMap<>();
                settings.put("waiting_room", true);
                settings.put("join_before_host", false);
                meetingRequest.put("settings", settings);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(meetingRequest, headers);
                var zoomResponse = restTemplate.postForEntity(
                    "https://api.zoom.us/v2/users/" + zoomUserId + "/meetings",
                    entity,
                    Map.class
                );

                if (zoomResponse.getStatusCode().is2xxSuccessful() && zoomResponse.getBody() != null) {
                    Map<String, Object> meeting = (Map<String, Object>) zoomResponse.getBody();
                    zoomJoinUrl = (String) meeting.get("join_url");
                    zoomMeetingId = String.valueOf(meeting.get("id"));
                    zoomPassword = (String) meeting.get("password");
                }
            } catch (Exception e) {
                log.error("Failed to create Zoom meeting, falling back to static link", e);
            }
        }

        // 5. Create scheduled session
        Map<String, Object> sessionBody = new HashMap<>();
        sessionBody.put("slot_id", slotId);
        sessionBody.put("test_id", testId);
        sessionBody.put("tester_id", userId);
        sessionBody.put("meeting_url", zoomJoinUrl);
        sessionBody.put("zoom_meeting_id", zoomMeetingId);
        sessionBody.put("zoom_join_url", zoomJoinUrl);
        sessionBody.put("zoom_password", zoomPassword);
        sessionBody.put("status", "scheduled");

        var sessionResponse = supabaseService.insert("scheduled_sessions", sessionBody);
        if (!sessionResponse.getStatusCode().is2xxSuccessful()) {
            // rollback slot
            Map<String, Object> rollback = new HashMap<>();
            rollback.put("status", "available");
            rollback.put("booked_by", null);
            rollback.put("booked_at", null);
            supabaseService.update("study_slots", Map.of("id", "eq." + slotId), rollback);
            return ResponseEntity.badRequest().body("Failed to create scheduled session");
        }

        // 6. Create test submission in_progress if not already exists
        Map<String, String> subFilters = Map.of(
            "test_id", "eq." + testId,
            "tester_id", "eq." + userId
        );
        var subCheck = supabaseService.select("test_submissions", subFilters);
        if (subCheck.getBody() == null || subCheck.getBody().isEmpty()) {
            Map<String, Object> submissionBody = new HashMap<>();
            submissionBody.put("test_id", testId);
            submissionBody.put("tester_id", userId);
            submissionBody.put("status", "in_progress");
            supabaseService.insert("test_submissions", submissionBody);
        }

        // 7. Send confirmation email via EmailController
        try {
            sendConfirmationEmail(userEmail, (String) testObj.get("title"), (String) slotObj.get("start_time"), (String) slotObj.get("end_time"), (Number) testObj.get("reward_amount"), (Number) testObj.get("estimated_duration"), zoomJoinUrl, zoomPassword);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email", e);
        }

        return ResponseEntity.ok(sessionResponse.getBody().get(0));
    }

    private void sendConfirmationEmail(String toEmail, String testTitle, String startTime, String endTime, Number rewardAmount, Number estimatedDuration, String zoomJoinUrl, String zoomPassword) {
        String formattedDate = "";
        String formattedStart = "";
        String formattedEnd = "";
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy").withZone(ZoneId.of("UTC"));
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a").withZone(ZoneId.of("UTC"));
            Instant startInst = Instant.parse(startTime);
            Instant endInst = Instant.parse(endTime);
            formattedDate = formatter.format(startInst);
            formattedStart = timeFormatter.format(startInst);
            formattedEnd = timeFormatter.format(endInst);
        } catch (Exception e) {
            formattedDate = startTime;
            formattedStart = startTime;
            formattedEnd = endTime;
        }

        String rewardStr = rewardAmount != null ? String.format("$%.2f", rewardAmount.doubleValue()) : "$0.00";
        String durationStr = estimatedDuration != null ? estimatedDuration.intValue() + " minutes" : "60 minutes";

        String meetingBlock = zoomJoinUrl != null
            ? String.format("""
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
                  <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#16a34a;">🔗 Meeting Link Ready</p>
                  <a href="%s" style="color:#6366f1;font-size:14px;word-break:break-all;">%s</a>
                  %s
                  <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Click the link at the scheduled time to join.</p>
                </div>""", zoomJoinUrl, zoomJoinUrl, zoomPassword != null ? "<p style=\"margin:8px 0 0;font-size:13px;color:#4b5563;\"><strong>Password:</strong> " + zoomPassword + "</p>" : "")
            : """
                <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:16px 0;">
                  <p style="margin:0;font-size:14px;color:#92400e;">📩 Meeting link will be provided by the recruiter before the session.</p>
                </div>""";

        String html = String.format("""
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:24px;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 32px;text-align:center;">
                <div style="font-size:36px;margin-bottom:12px;">📅</div>
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Study Session Confirmed!</h1>
                <p style="color:#e0e7ff;margin:8px 0 0;font-size:16px;">%s</p>
              </div>
              <div style="padding:32px;">
                <p style="font-size:16px;color:#1f2937;margin:0 0 16px;">Hello,</p>
                <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 24px;">Your user research study session has been successfully scheduled. Here are the details:</p>
                <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;width:120px;">Date</td>
                    <td style="padding:8px 0;font-size:14px;color:#1f2937;font-weight:600;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;">Time</td>
                    <td style="padding:8px 0;font-size:14px;color:#1f2937;font-weight:600;">%s - %s (UTC)</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;">Duration</td>
                    <td style="padding:8px 0;font-size:14px;color:#1f2937;font-weight:600;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;">Reward</td>
                    <td style="padding:8px 0;font-size:14px;color:#1f2937;font-weight:600;color:#10b981;">%s</td>
                  </tr>
                </table>
                %s
              </div>
            </div>
            </body>
            </html>
            """, testTitle, formattedDate, formattedStart, formattedEnd, durationStr, rewardStr, meetingBlock);

        Map<String, Object> emailBody = new HashMap<>();
        emailBody.put("to", toEmail);
        emailBody.put("subject", "📅 Study Confirmed: " + testTitle + " — User Ninjas");
        emailBody.put("html", html);
        emailController.sendEmail(emailBody);
    }

    private String getZoomAccessToken() {
        String auth = zoomClientId + ":" + zoomClientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));

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
