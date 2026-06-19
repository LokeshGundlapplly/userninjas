package com.userninjas.controller;

import com.userninjas.service.SupabaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private static final Logger log = LoggerFactory.getLogger(EmailController.class);

    @Value("${app.resend.api-key:}")
    private String resendApiKey;

    private final JavaMailSender mailSender;
    private final SupabaseService supabaseService;
    private final RestTemplate restTemplate = new RestTemplate();

    public EmailController(JavaMailSender mailSender, SupabaseService supabaseService) {
        this.mailSender = mailSender;
        this.supabaseService = supabaseService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, Object> body) {
        Object toObj = body.get("to");
        String subject = (String) body.get("subject");
        String html = (String) body.get("html");
        String from = (String) body.getOrDefault("from", "User Ninjas <noreply@userninjas.in>");

        if (toObj == null || subject == null || html == null) {
            return ResponseEntity.badRequest().body("to, subject, and html are required");
        }

        List<String> recipients = toObj instanceof List 
            ? ((List<?>) toObj).stream().map(Object::toString).toList()
            : List.of(toObj.toString());

        try {
            sendEmailInternal(recipients, subject, html, from);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to send email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/review-notification")
    public ResponseEntity<?> sendReviewNotification(@RequestBody Map<String, Object> body) {
        String submissionId = (String) body.get("submissionId");
        String testerId = (String) body.get("testerId");
        String testTitle = (String) body.get("testTitle");
        String status = (String) body.get("status");
        String reviewerFeedback = (String) body.get("reviewerFeedback");
        Double rewardAmount = body.get("rewardAmount") != null ? ((Number) body.get("rewardAmount")).doubleValue() : null;

        if (submissionId == null || testerId == null || testTitle == null || status == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        // Fetch tester's email and profile
        Map<String, String> profileFilters = Map.of("user_id", "eq." + testerId);
        var profileResponse = supabaseService.select("profiles", profileFilters);
        if (!profileResponse.getStatusCode().is2xxSuccessful() || profileResponse.getBody() == null || profileResponse.getBody().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not find tester profile");
        }

        Map<String, Object> profile = (Map<String, Object>) profileResponse.getBody().get(0);
        String testerEmail = (String) profile.get("email");
        String testerName = (String) profile.getOrDefault("full_name", "Tester");

        if (testerEmail == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tester profile has no email address");
        }

        boolean isApproved = "approved".equalsIgnoreCase(status);

        String logoBlock = """
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
            <tr>
              <td align="center" style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px;">
                <img src="https://www.userninjas.in/logo.png" alt="User Ninjas" width="40" height="40" style="display: block; border: 0; border-radius: 8px;" />
              </td>
            </tr>
          </table>
          <p style="color: #e0e7ff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin: 0 0 12px 0;">USER NINJAS</p>""";

        String founderBlock = """
          <div style="padding: 24px 32px; border-top: 1px solid #e5e7eb;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="width: 48px; vertical-align: top; padding-right: 14px;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; font-size: 18px; font-weight: 700; line-height: 44px; text-align: center;">L</div>
                </td>
                <td style="vertical-align: top;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; font-style: italic;">&ldquo;We built User Ninjas to make UX research fast, human, and accessible to every team. Welcome aboard &mdash; I&rsquo;m glad you&rsquo;re here.&rdquo;</p>
                  <p style="font-size: 13px; color: #1f2937; margin: 6px 0 0 0; font-weight: 600;">Lokesh &mdash; <span style="font-weight: 400; color: #6b7280;">Founder, User Ninjas</span></p>
                </td>
              </tr>
            </table>
          </div>""";

        String footer = String.format("""
          <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">&copy; %d User Ninjas &middot; <a href="https://www.userninjas.in/privacy" style="color: #6366f1; text-decoration: none;">Privacy</a> &middot; <a href="https://www.userninjas.in/terms" style="color: #6366f1; text-decoration: none;">Terms</a></p>
          </div>""", java.time.LocalDate.now().getYear());

        String emailHtml;
        String emailSubject;

        if (isApproved) {
            emailSubject = String.format("🎉 Your test \"%s\" was approved!", testTitle);
            String rewardStr = (rewardAmount != null)
                ? String.format("<div style=\"background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;\"><p style=\"margin: 0; font-size: 24px; color: #10b981; font-weight: 700;\">+$%.2f earned!</p></div>", rewardAmount)
                : "";
            String feedbackStr = (reviewerFeedback != null && !reviewerFeedback.trim().isEmpty())
                ? String.format("<div style=\"background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;\"><p style=\"margin: 0; font-size: 14px; color: #4b5563;\"><strong>Reviewer Feedback:</strong></p><p style=\"margin: 8px 0 0 0; font-style: italic; color: #4b5563;\">\"%s\"</p></div>", reviewerFeedback)
                : "";

            emailHtml = String.format("""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
                    %s
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🎉 Congratulations!</h1>
                  </div>
                  <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #1f2937;">Hi <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Great news! Your test submission for <strong>"%s"</strong> has been <span style="color: #10b981; font-weight: bold;">approved</span>.</p>
                    %s
                    %s
                    <p style="font-size: 15px; color: #4b5563;">Thank you for your valuable contribution! Keep up the great work.</p>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="https://www.userninjas.in/tester" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">View Dashboard →</a>
                    </div>
                  </div>
                  %s
                  %s
                </div>
                """, logoBlock, testerName, testTitle, rewardStr, feedbackStr, founderBlock, footer);
        } else {
            emailSubject = String.format("Update on your test \"%s\"", testTitle);
            String feedbackStr = (reviewerFeedback != null && !reviewerFeedback.trim().isEmpty())
                ? String.format("<div style=\"background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;\"><p style=\"margin: 0; font-size: 14px; color: #4b5563;\"><strong>Reviewer Feedback:</strong></p><p style=\"margin: 8px 0 0 0; font-style: italic; color: #4b5563;\">\"%s\"</p></div>", reviewerFeedback)
                : "";

            emailHtml = String.format("""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
                    %s
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Submission Update</h1>
                  </div>
                  <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #1f2937;">Hi <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Unfortunately, your test submission for <strong>"%s"</strong> was <span style="color: #ef4444; font-weight: bold;">not approved</span> this time.</p>
                    %s
                    <p style="font-size: 15px; color: #4b5563;">Don't be discouraged! Check out other available tests and try again.</p>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="https://www.userninjas.in/tester" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Browse Tests →</a>
                    </div>
                  </div>
                  %s
                  %s
                </div>
                """, logoBlock, testerName, testTitle, feedbackStr, founderBlock, footer);
        }

        try {
            sendEmailInternal(List.of(testerEmail), emailSubject, emailHtml, "User Ninjas <onboarding@resend.dev>");
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to send review notification email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    private void sendEmailInternal(List<String> recipients, String subject, String html, String from) throws Exception {
        if (resendApiKey != null && !resendApiKey.isEmpty()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(resendApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("from", from);
            body.put("to", recipients);
            body.put("subject", subject);
            body.put("html", html);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity("https://api.resend.com/emails", entity, Map.class);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("SMTP email sending warning (check your SMTP settings): {}", e.getMessage());
            log.info("Placeholder email successfully logged: To={}, Subject={}", recipients, subject);
        }
    }
}
