package com.sweetpos.controller;

import com.sweetpos.dto.SyncPayload;
import com.sweetpos.dto.SyncResponse;
import com.sweetpos.entity.User;
import com.sweetpos.sync.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @PostMapping
    public ResponseEntity<SyncResponse> sync(@RequestBody SyncPayload payload,
                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(syncService.processSync(payload, user.getId()));
    }
}
