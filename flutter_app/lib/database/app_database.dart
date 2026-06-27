import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../utils/constants.dart';
import 'tables.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [
  LocalProducts,
  LocalCategories,
  LocalCustomers,
  LocalSales,
  LocalSaleItems,
  SyncQueue,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Products
  Future<List<LocalProduct>> getAllProducts() => select(localProducts).get();

  Future<LocalProduct?> getProductByBarcode(String barcode) =>
      (select(localProducts)..where((p) => p.barcode.equals(barcode)))
          .getSingleOrNull();

  Future<List<LocalProduct>> searchProducts(String query) =>
      (select(localProducts)
            ..where((p) =>
                p.name.like('%$query%') | p.barcode.like('%$query%')))
          .get();

  Future<List<LocalProduct>> getProductsByCategory(String categoryId) =>
      (select(localProducts)..where((p) => p.categoryId.equals(categoryId)))
          .get();

  Future<int> insertProduct(LocalProductsCompanion product) =>
      into(localProducts).insert(product, mode: InsertMode.insertOrReplace);

  Future<void> insertProducts(List<LocalProductsCompanion> products) async {
    await batch((b) {
      b.insertAll(localProducts, products, mode: InsertMode.insertOrReplace);
    });
  }

  // Categories
  Future<List<LocalCategory>> getAllCategories() =>
      (select(localCategories)..orderBy([(c) => OrderingTerm.asc(c.sortOrder)]))
          .get();

  Future<void> insertCategories(List<LocalCategoriesCompanion> cats) async {
    await batch((b) {
      b.insertAll(localCategories, cats, mode: InsertMode.insertOrReplace);
    });
  }

  // Customers
  Future<List<LocalCustomer>> getAllCustomers() => select(localCustomers).get();

  Future<void> insertCustomers(List<LocalCustomersCompanion> custs) async {
    await batch((b) {
      b.insertAll(localCustomers, custs, mode: InsertMode.insertOrReplace);
    });
  }

  // Sales (local offline sales)
  Future<int> insertSale(LocalSalesCompanion sale) =>
      into(localSales).insert(sale);

  Future<void> insertSaleItems(List<LocalSaleItemsCompanion> items) async {
    await batch((b) {
      b.insertAll(localSaleItems, items);
    });
  }

  Future<List<LocalSale>> getUnsyncedSales() =>
      (select(localSales)..where((s) => s.synced.equals(false))).get();

  Future<void> markSaleSynced(String localId, String serverId) async {
    await (update(localSales)..where((s) => s.localId.equals(localId)))
        .write(const LocalSalesCompanion(synced: Value(true)));
  }

  // Sync Queue
  Future<List<SyncQueueEntry>> getPendingSyncItems() =>
      (select(syncQueue)
            ..where((s) => s.status.equals('pending'))
            ..orderBy([(s) => OrderingTerm.asc(s.createdAt)]))
          .get();

  Future<int> addToSyncQueue(SyncQueueCompanion entry) =>
      into(syncQueue).insert(entry);

  Future<void> markSynced(int id) async {
    await (update(syncQueue)..where((s) => s.id.equals(id)))
        .write(const SyncQueueCompanion(status: Value('synced')));
  }

  Future<void> markFailed(int id, String error) async {
    await (update(syncQueue)..where((s) => s.id.equals(id)))
        .write(SyncQueueCompanion(
            status: const Value('failed'), errorMessage: Value(error)));
  }

  // Clear and reseed from cloud data
  Future<void> clearAndReseed({
    required List<LocalProductsCompanion> products,
    required List<LocalCategoriesCompanion> categories,
    required List<LocalCustomersCompanion> customers,
  }) async {
    await transaction(() async {
      await delete(localProducts).go();
      await delete(localCategories).go();
      await delete(localCustomers).go();
      await insertProducts(products);
      await insertCategories(categories);
      await insertCustomers(customers);
    });
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, AppConstants.dbName));
    return NativeDatabase.createInBackground(file);
  });
}
