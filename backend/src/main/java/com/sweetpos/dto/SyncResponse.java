package com.sweetpos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncResponse {
    private long serverTimestamp;
    private int accepted;
    private int rejected;
    private List<SyncResultItem> results;
    private List<CloudChange> cloudChanges; // changes from cloud to push to local

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncResultItem {
        private String localId;
        private String status; // accepted, rejected, conflict
        private String serverId;
        private String error;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloudChange {
        private String entityType;
        private String action;
        private String serverId;
        private String payload; // JSON
        private long timestamp;
    }
}
