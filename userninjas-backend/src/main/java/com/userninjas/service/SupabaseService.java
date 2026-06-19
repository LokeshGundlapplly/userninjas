package com.userninjas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class SupabaseService {

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.anon-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", "Bearer " + supabaseAnonKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Prefer", "return=representation");
        return headers;
    }

    public ResponseEntity<List> select(String table, Map<String, String> filters) {
        HttpHeaders headers = getHeaders();
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(supabaseUrl + "/rest/v1/" + table);
        if (filters != null) {
            filters.forEach(builder::queryParam);
        }
        HttpEntity<?> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity, List.class);
    }

    public ResponseEntity<List> insert(String table, Map<String, Object> body) {
        HttpHeaders headers = getHeaders();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        return restTemplate.exchange(supabaseUrl + "/rest/v1/" + table, HttpMethod.POST, entity, List.class);
    }

    public ResponseEntity<List> update(String table, Map<String, String> filters, Map<String, Object> body) {
        HttpHeaders headers = getHeaders();
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(supabaseUrl + "/rest/v1/" + table);
        if (filters != null) {
            filters.forEach(builder::queryParam);
        }
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        return restTemplate.exchange(builder.toUriString(), HttpMethod.PATCH, entity, List.class);
    }

    public ResponseEntity<Void> delete(String table, Map<String, String> filters) {
        HttpHeaders headers = getHeaders();
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(supabaseUrl + "/rest/v1/" + table);
        if (filters != null) {
            filters.forEach(builder::queryParam);
        }
        HttpEntity<?> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(builder.toUriString(), HttpMethod.DELETE, entity, Void.class);
    }
}
