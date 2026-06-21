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
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Value("${app.razorpay.key-id:rzp_live_Sx5YIPbX0SGPU4}")
    private String keyId;

    @Value("${app.razorpay.key-secret:qJYzHPmsnBGdnL1tNRW3Lclm}")
    private String keySecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Object amountObj = payload.get("amount");
            if (amountObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid amount is required"));
            }

            double amount = Double.parseDouble(amountObj.toString());
            if (amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than zero"));
            }

            String currency = (String) payload.getOrDefault("currency", "INR");
            long amountInPaise = Math.round(amount * 100);

            String auth = keyId + ":" + keySecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> rzpBody = new HashMap<>();
            rzpBody.put("amount", amountInPaise);
            rzpBody.put("currency", currency);
            rzpBody.put("receipt", "receipt_" + System.currentTimeMillis());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(rzpBody, headers);

            log.info("Creating Razorpay order for amount: {} {}", amount, currency);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.razorpay.com/v1/orders",
                entity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            }

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            log.error("Error creating Razorpay order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }
}
