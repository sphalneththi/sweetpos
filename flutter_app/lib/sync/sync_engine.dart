import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import '../database/app_database.dart';
import '../services/api_service.dart';
import '../services/connectivity_service.dart';
import '../utils/constants.dart';

/// Offline-first sync engine.
/// - Queues all mutations locally
/// - When online, pushes pending items to cloud
/// - Pulls cloud changes back to local DB
class SyncEngine {
  static final SyncEngine _instance = SyncEngine._internal();
  factory SyncEngine() => _instance;
  SyncEngine._internal();

  late final AppDatabase _db;
  late final ApiService _api;
  late final ConnectivityService _connectivity;

  Timer? _syncTimer;
  bool _isSyncing = false;
  final _syncStatusController = StreamController<SyncStatus>.broadcast();

  Stream<SyncStatus> get statusStream => _syncStatusController.stream;

  void init(AppDatabase db, ApiService api, ConnectivityService connectivity) {
    _db = db;
    _api = api;
    _connectivity = connectivity;

    // Start periodic sync
    _syncTimer = Timer.periodic(AppConstants.syncInterval, (_) => attemptSync());

    // Sync when coming online
    _connectivity.onlineStream.listen((online) {
      if (online) attemptSync();
    });
  }

  /// Queue a sale for sync
  Future<void> queueSale(String localId, Map<String, dynamic> saleJson) async {
    await _db.addToSyncQueue(SyncQueueCompanion(
      entityType: const Value('sale'),
      action: const Value('create'),
      localId: Value(localId),
      payload: Value(jsonEncode(saleJson)),
    ));

    // Try immediate sync if online
    if (_connectivity.isOnline) {
      attemptSync();
    }
  }

  /// Queue a customer creation/update
  Future<void> queueCustomer(String localId, String action, Map<String, dynamic> json) async {
    await _db.addToSyncQueue(SyncQueueCompanion(
      entityType: const Value('customer'),
      action: Value(action),
      localId: Value(localId),
      payload: Value(jsonEncode(json)),
    ));

    if (_connectivity.isOnline) {
      attemptSync();
    }
  }

  /// Attempt to sync all pending items
  Future<void> attemptSync() async {
    if (_isSyncing || !_connectivity.isOnline) return;
    _isSyncing = true;
    _syncStatusController.add(SyncStatus.syncing);

    try {
      final pending = await _db.getPendingSyncItems();
      if (pending.isEmpty) {
        _syncStatusController.add(SyncStatus.idle);
        _isSyncing = false;
        return;
      }

      // Build sync payload
      final items = pending.map((entry) => {
            'entityType': entry.entityType,
            'action': entry.action,
            'localId': entry.localId,
            'payload': entry.payload,
            'timestamp': entry.createdAt.millisecondsSinceEpoch,
          }).toList();

      final payload = {
        'deviceId': 'flutter-device-001', // TODO: use actual device ID
        'lastSyncTimestamp': DateTime.now()
            .subtract(const Duration(hours: 1))
            .millisecondsSinceEpoch,
        'items': items,
      };

      final response = await _api.sync(payload);

      // Process results
      final results = (response['results'] as List?) ?? [];
      for (final result in results) {
        final localId = result['localId'] as String;
        final status = result['status'] as String;
        final entry = pending.firstWhere((e) => e.localId == localId,
            orElse: () => pending.first);

        if (status == 'accepted') {
          await _db.markSynced(entry.id);
          // If it's a sale, mark the local sale as synced
          if (entry.entityType == 'sale') {
            await _db.markSaleSynced(localId, result['serverId'] ?? '');
          }
        } else {
          await _db.markFailed(entry.id, result['error'] ?? 'Unknown error');
        }
      }

      // Apply cloud changes to local DB
      final cloudChanges = (response['cloudChanges'] as List?) ?? [];
      for (final change in cloudChanges) {
        await _applyCloudChange(change);
      }

      _syncStatusController.add(SyncStatus.synced);
    } catch (e) {
      _syncStatusController.add(SyncStatus.error);
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> _applyCloudChange(dynamic change) async {
    // Apply product/category/customer updates from cloud to local DB
    final entityType = change['entityType'] as String;
    final payload = jsonDecode(change['payload'] as String);

    switch (entityType) {
      case 'product':
        await _db.insertProduct(LocalProductsCompanion(
          id: Value(payload['id']),
          name: Value(payload['name']),
          barcode: Value(payload['barcode']),
          categoryId: Value(payload['categoryId']),
          categoryName: Value(payload['categoryName']),
          costPrice: Value((payload['costPrice'] as num).toDouble()),
          sellingPrice: Value((payload['sellingPrice'] as num).toDouble()),
          taxRate: Value((payload['taxRate'] as num?)?.toDouble() ?? 0),
          stockQuantity: Value(payload['stockQuantity'] ?? 0),
          minStockLevel: Value(payload['minStockLevel'] ?? 5),
          unit: Value(payload['unit']),
          active: Value(payload['active'] ?? true),
          trackInventory: Value(payload['trackInventory'] ?? true),
        ));
        break;
      case 'category':
        await _db.insertCategories([
          LocalCategoriesCompanion(
            id: Value(payload['id']),
            name: Value(payload['name']),
            description: Value(payload['description']),
            color: Value(payload['color']),
            icon: Value(payload['icon']),
            sortOrder: Value(payload['sortOrder'] ?? 0),
            active: Value(payload['active'] ?? true),
          ),
        ]);
        break;
      case 'customer':
        await _db.insertCustomers([
          LocalCustomersCompanion(
            id: Value(payload['id']),
            name: Value(payload['name']),
            phone: Value(payload['phone']),
            email: Value(payload['email']),
            loyaltyPoints: Value(payload['loyaltyPoints'] ?? 0),
            active: Value(payload['active'] ?? true),
          ),
        ]);
        break;
    }
  }

  /// Full sync: pull all data from cloud to populate local DB
  Future<void> fullSync() async {
    if (!_connectivity.isOnline) return;
    _syncStatusController.add(SyncStatus.syncing);

    try {
      // Pull products
      final products = await _api.getProducts(size: 1000);
      final productCompanions = products
          .map((p) => LocalProductsCompanion(
                id: Value(p['id']),
                name: Value(p['name']),
                description: Value(p['description']),
                barcode: Value(p['barcode']),
                categoryId: Value(p['categoryId']),
                categoryName: Value(p['categoryName']),
                costPrice: Value((p['costPrice'] as num).toDouble()),
                sellingPrice: Value((p['sellingPrice'] as num).toDouble()),
                taxRate: Value((p['taxRate'] as num?)?.toDouble() ?? 0),
                stockQuantity: Value(p['stockQuantity'] ?? 0),
                minStockLevel: Value(p['minStockLevel'] ?? 5),
                unit: Value(p['unit']),
                active: Value(p['active'] ?? true),
                trackInventory: Value(p['trackInventory'] ?? true),
              ))
          .toList();

      // Pull categories
      final categories = await _api.getCategories();
      final catCompanions = categories
          .map((c) => LocalCategoriesCompanion(
                id: Value(c['id']),
                name: Value(c['name']),
                description: Value(c['description']),
                color: Value(c['color']),
                icon: Value(c['icon']),
                sortOrder: Value(c['sortOrder'] ?? 0),
                active: Value(c['active'] ?? true),
              ))
          .toList();

      // Pull customers
      final customers = await _api.getCustomers();
      final custCompanions = customers
          .map((c) => LocalCustomersCompanion(
                id: Value(c['id']),
                name: Value(c['name']),
                phone: Value(c['phone']),
                email: Value(c['email']),
                loyaltyPoints: Value(c['loyaltyPoints'] ?? 0),
                totalSpent: Value((c['totalSpent'] as num?)?.toDouble() ?? 0),
                active: Value(c['active'] ?? true),
              ))
          .toList();

      await _db.clearAndReseed(
        products: productCompanions,
        categories: catCompanions,
        customers: custCompanions,
      );

      _syncStatusController.add(SyncStatus.synced);
    } catch (e) {
      _syncStatusController.add(SyncStatus.error);
    }
  }

  void dispose() {
    _syncTimer?.cancel();
    _syncStatusController.close();
  }
}

enum SyncStatus { idle, syncing, synced, error }
