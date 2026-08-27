package com.kitenge.controller;

import com.kitenge.dto.BusinessStats;
import com.kitenge.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    
    private final StatsService statsService;
    
    @GetMapping("/business")
    public ResponseEntity<BusinessStats> getBusinessStats() {
        BusinessStats stats = statsService.getBusinessStats();
        return ResponseEntity.ok(stats);
    }
}

