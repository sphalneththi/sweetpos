import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/products_provider.dart';
import '../../widgets/product_grid.dart';
import '../../widgets/cart_panel.dart';

class POSScreen extends ConsumerStatefulWidget {
  const POSScreen({super.key});

  @override
  ConsumerState<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends ConsumerState<POSScreen> {
  final _searchController = TextEditingController();
  final _searchFocus = FocusNode();
  String _barcodeBuffer = '';
  DateTime _lastKeyTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    // Load products on first build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(productsProvider.notifier).loadProducts();
      ref.read(productsProvider.notifier).loadCategories();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  void _handleBarcodeScan(String barcode) {
    final product = ref.read(productsProvider.notifier).findByBarcode(barcode);
    if (product != null) {
      ref.read(cartProvider.notifier).addProduct(product);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added: ${product.name}'),
          duration: const Duration(seconds: 1),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Product not found: $barcode'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(productsProvider);
    final cartState = ref.watch(cartProvider);

    return KeyboardListener(
      focusNode: FocusNode(),
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          final now = DateTime.now();
          // Barcode scanners type fast (< 50ms between keys)
          if (now.difference(_lastKeyTime).inMilliseconds > 100) {
            _barcodeBuffer = '';
          }
          _lastKeyTime = now;

          if (event.logicalKey == LogicalKeyboardKey.enter) {
            if (_barcodeBuffer.length >= 3) {
              _handleBarcodeScan(_barcodeBuffer);
            }
            _barcodeBuffer = '';
          } else {
            final char = event.character;
            if (char != null && char.isNotEmpty) {
              _barcodeBuffer += char;
            }
          }
        }
      },
      child: Row(
        children: [
          // Left: Product grid
          Expanded(
            flex: 3,
            child: Column(
              children: [
                // Search & Category bar
                _buildSearchBar(productsState),
                // Category chips
                _buildCategoryChips(productsState),
                // Product grid
                Expanded(
                  child: productsState.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : ProductGrid(
                          products: productsState.filteredProducts,
                          onProductTap: (product) {
                            ref.read(cartProvider.notifier).addProduct(product);
                          },
                        ),
                ),
              ],
            ),
          ),
          // Right: Cart panel
          SizedBox(
            width: 380,
            child: CartPanel(cartState: cartState),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(ProductsState state) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: TextField(
        controller: _searchController,
        focusNode: _searchFocus,
        decoration: InputDecoration(
          hintText: 'Search products or scan barcode...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    ref.read(productsProvider.notifier).setSearchQuery('');
                  },
                )
              : null,
        ),
        onChanged: (value) {
          ref.read(productsProvider.notifier).setSearchQuery(value);
        },
      ),
    );
  }

  Widget _buildCategoryChips(ProductsState state) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: const Text('All'),
              selected: state.selectedCategoryId == null,
              onSelected: (_) =>
                  ref.read(productsProvider.notifier).selectCategory(null),
            ),
          ),
          ...state.categories.map((cat) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text('${cat.icon ?? ''} ${cat.name}'),
                  selected: state.selectedCategoryId == cat.id,
                  onSelected: (_) =>
                      ref.read(productsProvider.notifier).selectCategory(cat.id),
                ),
              )),
        ],
      ),
    );
  }
}
