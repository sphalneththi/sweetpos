package com.sweetpos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sync_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncLog extends BaseEntity {

    @Column(nullable = false)
    private UUID terminalDeviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyncDirection direction;

    @Column(nullable = false, length = 50)
    private String entityType;

    @Column(nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyncStatus status;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(length = 500)
    private String errorMessage;

    @Column
    private LocalDateTime syncedAt;

    public enum SyncDirection {
        LOCAL_TO_CLOUD, CLOUD_TO_LOCAL
    }

    public enum SyncStatus {
        PENDING, SYNCED, FAILED, CONFLICT
    }
}
