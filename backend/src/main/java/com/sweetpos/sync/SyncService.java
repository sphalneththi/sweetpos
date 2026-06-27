package com.sweetpos.sync;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweetpos.dto.CreateSaleRequest;
import com.sweetpos.dto.SyncPayload;
import com.sweetpos.dto.SyncResponse;
import com.sweetpos.entity.Customer;
import com.sweetpos.entity.SyncLog;
import com.sweetpos.repository.SyncLogRepository;
import com.sweetpos.service.CustomerService;
import com.sweetpos.service.SaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final SyncLogRepository syncLogRepository;
    private final SaleService saleService;
    private final CustomerService customerService;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Process incoming sync batch from a Flutter POS terminal.
     * Each item is processed independently — failures don't block other items.
     */
    public SyncResponse processSync(SyncPayload payload, UUID userId) {
        List<SyncResponse.SyncResultItem> results = new ArrayList<>();
        int accepted = 0;
        int rejected = 0;

        for (SyncPayload.SyncItem item : payload.getItems()) {
            try {
                String serverId = processSyncItem(item, userId, payload.getDeviceId());
                results.add(SyncResponse.SyncResultItem.builder()
                        .localId(item.getLocalId())
                        .status("accepted")
                        .serverId(serverId)
                        .build());
                accepted++;

                // Log successful sync
                logSync(payload.getDeviceId(), item, SyncLog.SyncStatus.SYNCED, serverId, null);
            } catch (Exception e) {
                log.error("Sync failed for item {}: {}", item.getLocalId(), e.getMessage());
                results.add(SyncResponse.SyncResultItem.builder()
                        .localId(item.getLocalId())
                        .status("rejected")
                        .error(e.getMessage())
                        .build());
                rejected++;

                logSync(payload.getDeviceId(), item, SyncLog.SyncStatus.FAILED, null, e.getMessage());
            }
        }

        // Get cloud changes since last sync to push down
        List<SyncResponse.CloudChange> cloudChanges = getCloudChangesSince(
                payload.getDeviceId(), payload.getLastSyncTimestamp());

        SyncResponse response = SyncResponse.builder()
                .serverTimestamp(System.currentTimeMillis())
                .accepted(accepted)
                .rejected(rejected)
                .results(results)
                .cloudChanges(cloudChanges)
                .build();

        // Notify admin portal of sync event
        try {
            messagingTemplate.convertAndSend("/topic/sync", response);
        } catch (Exception e) {
            // WebSocket failure non-critical
        }

        return response;
    }

    private String processSyncItem(SyncPayload.SyncItem item, UUID userId, UUID deviceId) {
        return switch (item.getEntityType().toLowerCase()) {
            case "sale" -> processSaleSyncItem(item, userId);
            case "customer" -> processCustomerSyncItem(item);
            default -> throw new RuntimeException("Unknown entity type: " + item.getEntityType());
        };
    }

    private String processSaleSyncItem(SyncPayload.SyncItem item, UUID userId) {
        try {
            CreateSaleRequest request = objectMapper.readValue(item.getPayload(), CreateSaleRequest.class);
            request.setLocalId(item.getLocalId());
            var sale = saleService.create(request, userId);
            return sale.getId().toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to process sale: " + e.getMessage());
        }
    }

    private String processCustomerSyncItem(SyncPayload.SyncItem item) {
        try {
            Customer customer = objectMapper.readValue(item.getPayload(), Customer.class);
            if ("create".equals(item.getAction())) {
                var saved = customerService.create(customer);
                return saved.getId().toString();
            } else if ("update".equals(item.getAction())) {
                var saved = customerService.update(customer.getId(), customer);
                return saved.getId().toString();
            }
            throw new RuntimeException("Unknown action: " + item.getAction());
        } catch (Exception e) {
            throw new RuntimeException("Failed to process customer: " + e.getMessage());
        }
    }

    private void logSync(UUID deviceId, SyncPayload.SyncItem item, SyncLog.SyncStatus status,
                         String serverId, String error) {
        try {
            SyncLog syncLog = SyncLog.builder()
                    .terminalDeviceId(deviceId)
                    .direction(SyncLog.SyncDirection.LOCAL_TO_CLOUD)
                    .entityType(item.getEntityType())
                    .entityId(serverId != null ? UUID.fromString(serverId) : UUID.randomUUID())
                    .status(status)
                    .payload(item.getPayload())
                    .errorMessage(error)
                    .syncedAt(status == SyncLog.SyncStatus.SYNCED ? LocalDateTime.now() : null)
                    .build();
            syncLogRepository.save(syncLog);
        } catch (Exception e) {
            log.error("Failed to save sync log: {}", e.getMessage());
        }
    }

    /**
     * Get changes from cloud that need to be pushed to the device.
     * This includes products/categories/customers modified since last sync.
     */
    private List<SyncResponse.CloudChange> getCloudChangesSince(UUID deviceId, long lastSyncTimestamp) {
        // For now, return empty list - full implementation would query all entities
        // modified after the timestamp and return them as CloudChange items
        List<SyncResponse.CloudChange> changes = new ArrayList<>();

        // In production, you'd query products, categories, customers updated after lastSyncTimestamp
        // and package them as CloudChange items for the device to apply locally

        return changes;
    }
}
