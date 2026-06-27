import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../services/api_service.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  List<Product> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final data = await ApiService().getProducts(size: 500);
      if (mounted) {
        setState(() {
          _products = data.map((p) => Product.fromJson(p)).toList();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Summary
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      _InfoChip(
                        label: 'Total Products',
                        value: '${_products.length}',
                        color: Colors.blue,
                      ),
                      const SizedBox(width: 12),
                      _InfoChip(
                        label: 'Low Stock',
                        value: '${_products.where((p) => p.isLowStock).length}',
                        color: Colors.orange,
                      ),
                      const SizedBox(width: 12),
                      _InfoChip(
                        label: 'Out of Stock',
                        value: '${_products.where((p) => p.stockQuantity == 0).length}',
                        color: Colors.red,
                      ),
                    ],
                  ),
                ),
                // Product list with stock levels
                Expanded(
                  child: ListView.builder(
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final p = _products[index];
                      return ListTile(
                        title: Text(p.name),
                        subtitle: Text(p.categoryName ?? ''),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${p.stockQuantity}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: p.isLowStock ? Colors.orange : Colors.green,
                                  ),
                                ),
                                Text('min: ${p.minStockLevel}',
                                    style: const TextStyle(fontSize: 10)),
                              ],
                            ),
                            const SizedBox(width: 8),
                            PopupMenuButton<String>(
                              onSelected: (action) =>
                                  _showStockDialog(p, action),
                              itemBuilder: (ctx) => [
                                const PopupMenuItem(
                                    value: 'in', child: Text('Stock In')),
                                const PopupMenuItem(
                                    value: 'out', child: Text('Stock Out')),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }

  void _showStockDialog(Product product, String action) {
    final qtyController = TextEditingController();
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${action == 'in' ? 'Stock In' : 'Stock Out'}: ${product.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current stock: ${product.stockQuantity}'),
            const SizedBox(height: 12),
            TextField(
              controller: qtyController,
              decoration: const InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(labelText: 'Reason'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final qty = int.tryParse(qtyController.text) ?? 0;
              if (qty <= 0) return;
              try {
                final data = {
                  'productId': product.id,
                  'quantity': qty,
                  'reason': reasonController.text,
                };
                if (action == 'in') {
                  await ApiService().stockIn(data);
                } else {
                  await ApiService().stockOut(data);
                }
                if (ctx.mounted) Navigator.pop(ctx);
                _loadProducts();
              } catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _InfoChip({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
