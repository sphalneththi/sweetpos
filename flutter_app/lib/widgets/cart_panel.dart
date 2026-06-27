import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../sync/sync_engine.dart';
import 'package:uuid/uuid.dart';

class CartPanel extends ConsumerStatefulWidget {
  final CartState cartState;

  const CartPanel({super.key, required this.cartState});

  @override
  ConsumerState<CartPanel> createState() => _CartPanelState();
}

class _CartPanelState extends ConsumerState<CartPanel> {
  bool _isProcessing = false;

  Future<void> _checkout() async {
    final cart = widget.cartState;
    if (cart.isEmpty) return;

    final authState = ref.read(authProvider);
    if (authState.user == null) return;

    setState(() => _isProcessing = true);

    try {
      final localId = const Uuid().v4();
      final saleData = {
        'localId': localId,
        'customerId': cart.customer?.id,
        'terminalId': 'FLUTTER-01',
        'items': cart.items.map((item) => item.toSaleItemJson()).toList(),
        'discountType': cart.discountType,
        'discountValue': cart.discountValue,
        'discountAmount': cart.discountAmount,
        'paymentMethod': cart.paymentMethod,
        'cashReceived': cart.paymentMethod == 'CASH' ? cart.total : null,
        'loyaltyRedeemed': cart.loyaltyRedeemed,
        'notes': null,
      };

      // Try direct API call first (online mode)
      try {
        await ApiService().createSale(saleData);
      } catch (e) {
        // If offline, queue for sync
        await SyncEngine().queueSale(localId, saleData);
      }

      ref.read(cartProvider.notifier).clear();

      if (mounted) {
        _showReceiptDialog(cart);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showReceiptDialog(CartState cart) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 8),
            Text('Sale Complete'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total: Rs. ${cart.total.toStringAsFixed(2)}'),
            Text('Payment: ${cart.paymentMethod}'),
            Text('Items: ${cart.itemCount}'),
            if (cart.customer != null)
              Text('Customer: ${cart.customer!.name}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = widget.cartState;
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        border: Border(left: BorderSide(color: theme.dividerColor)),
        color: theme.colorScheme.surface,
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: Row(
              children: [
                Icon(Icons.shopping_cart, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  'Cart (${cart.itemCount})',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                if (!cart.isEmpty)
                  TextButton.icon(
                    onPressed: () => ref.read(cartProvider.notifier).clear(),
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Clear'),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                  ),
              ],
            ),
          ),
          // Cart items
          Expanded(
            child: cart.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart_outlined,
                            size: 48, color: Colors.grey),
                        SizedBox(height: 8),
                        Text('Cart is empty',
                            style: TextStyle(color: Colors.grey)),
                        Text('Tap products or scan barcode',
                            style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: cart.items.length,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return ListTile(
                        dense: true,
                        title: Text(
                          item.product.name,
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w500),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          'Rs. ${item.product.sellingPrice.toStringAsFixed(0)} × ${item.quantity}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline,
                                  size: 20),
                              onPressed: () => ref
                                  .read(cartProvider.notifier)
                                  .updateQuantity(
                                      item.product.id, item.quantity - 1),
                            ),
                            Text('${item.quantity}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline,
                                  size: 20),
                              onPressed: () => ref
                                  .read(cartProvider.notifier)
                                  .updateQuantity(
                                      item.product.id, item.quantity + 1),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Rs. ${item.lineTotal.toStringAsFixed(0)}',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
          // Payment method selector
          if (!cart.isEmpty) _buildPaymentSelector(cart),
          // Totals & Checkout
          if (!cart.isEmpty) _buildTotals(cart, theme),
        ],
      ),
    );
  }

  Widget _buildPaymentSelector(CartState cart) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: SegmentedButton<String>(
        segments: const [
          ButtonSegment(value: 'CASH', label: Text('Cash'), icon: Icon(Icons.money)),
          ButtonSegment(value: 'CARD', label: Text('Card'), icon: Icon(Icons.credit_card)),
          ButtonSegment(value: 'QR', label: Text('QR'), icon: Icon(Icons.qr_code)),
        ],
        selected: {cart.paymentMethod},
        onSelectionChanged: (selection) {
          ref.read(cartProvider.notifier).setPaymentMethod(selection.first);
        },
        style: const ButtonStyle(
          visualDensity: VisualDensity.compact,
        ),
      ),
    );
  }

  Widget _buildTotals(CartState cart, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: theme.dividerColor)),
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
      ),
      child: Column(
        children: [
          _totalRow('Subtotal', 'Rs. ${cart.subtotal.toStringAsFixed(2)}'),
          if (cart.discountAmount > 0)
            _totalRow('Discount', '- Rs. ${cart.discountAmount.toStringAsFixed(2)}',
                color: Colors.green),
          if (cart.taxTotal > 0)
            _totalRow('Tax', 'Rs. ${cart.taxTotal.toStringAsFixed(2)}'),
          const Divider(height: 12),
          _totalRow(
            'TOTAL',
            'Rs. ${cart.total.toStringAsFixed(2)}',
            isBold: true,
            fontSize: 18,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isProcessing ? null : _checkout,
              icon: _isProcessing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.payment),
              label: Text(_isProcessing ? 'Processing...' : 'Complete Sale'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _totalRow(String label, String value,
      {bool isBold = false, double fontSize = 13, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                  fontSize: fontSize)),
          Text(value,
              style: TextStyle(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
                  fontSize: fontSize,
                  color: color)),
        ],
      ),
    );
  }
}
