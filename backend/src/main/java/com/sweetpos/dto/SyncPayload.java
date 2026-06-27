package com.sweetpos.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SyncPayload {
    private UUID deviceId;
    private long lastSyncTimestamp;
    private List<SyncItem> items;

    @Data
    public static class SyncItem {
        private String entityType; // sale, customer, product, inventory_movement
        private String action; // create, update, delete
        private String localId;
        private String payload; // JSON string of the entity
        private long timestamp;
    }
}
