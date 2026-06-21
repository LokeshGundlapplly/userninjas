package com.userninjas.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    private static final Logger log = LoggerFactory.getLogger(StorageController.class);

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.anon-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bucket", defaultValue = "submission-attachments") String bucket,
            @RequestParam(value = "path", required = false) String customPath) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String filename = file.getOriginalFilename();
            String path = customPath != null ? customPath : (System.currentTimeMillis() + "_" + filename);
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseAnonKey);
            headers.set("Authorization", "Bearer " + supabaseAnonKey);
            headers.setContentType(MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Construct public URL
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "url", publicUrl,
                    "path", path
                ));
            }

            return ResponseEntity.status(response.getStatusCode()).body("Failed to upload to Supabase storage");

        } catch (Exception e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
