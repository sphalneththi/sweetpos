package com.sweetpos.repository;

import com.sweetpos.entity.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, UUID> {
    List<SyncLog> findByTerminalDeviceIdAndStatus(UUID terminalId, SyncLog.SyncStatus status);
    List<SyncLog> findByStatusOrderByCreatedAtAsc(SyncLog.SyncStatus status);
}
