import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class ProductsState {
  final List<Product> products;
  final List<Category> categories;
  final bool isLoading;
  final String? error;
  final String? selectedCategoryId;
  final String searchQuery;

  ProductsState({
    this.products = const [],
    this.categories = const [],
    this.isLoading = false,
    this.error,
    this.selectedCategoryId,
    this.searchQuery = '',
  });

  List<Product> get filteredProducts {
    var filtered = products.where((p) => p.active).toList();
    if (selectedCategoryId != null) {
      filtered = filtered.where((p) => p.categoryId == selectedCategoryId).toList();
    }
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      filtered = filtered
          .where((p) =>
              p.name.toLowerCase().contains(q) ||
              (p.barcode?.contains(q) ?? false))
          .toList();
    }
    return filtered;
  }

  ProductsState copyWith({
    List<Product>? products,
    List<Category>? categories,
    bool? isLoading,
    String? error,
    String? selectedCategoryId,
    String? searchQuery,
  }) =>
      ProductsState(
        products: products ?? this.products,
        categories: categories ?? this.categories,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
        searchQuery: searchQuery ?? this.searchQuery,
      );
}

class ProductsNotifier extends StateNotifier<ProductsState> {
  final ApiService _api;

  ProductsNotifier(this._api) : super(ProductsState());

  Future<void> loadProducts() async {
    state = state.copyWith(isLoading: true);
    try {
      final data = await _api.getProducts(size: 500);
      final products = data.map((p) => Product.fromJson(p)).toList();
      state = state.copyWith(products: products, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadCategories() async {
    try {
      final data = await _api.getCategories();
      final categories = data.map((c) => Category.fromJson(c)).toList();
      state = state.copyWith(categories: categories);
    } catch (e) {
      // Non-critical
    }
  }

  void selectCategory(String? categoryId) {
    state = state.copyWith(
      selectedCategoryId: categoryId == state.selectedCategoryId ? null : categoryId,
    );
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Product? findByBarcode(String barcode) {
    try {
      return state.products.firstWhere((p) => p.barcode == barcode);
    } catch (e) {
      return null;
    }
  }
}

final productsProvider =
    StateNotifierProvider<ProductsNotifier, ProductsState>((ref) {
  return ProductsNotifier(ApiService());
});
