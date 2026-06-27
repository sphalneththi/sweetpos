import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../models/customer.dart';

class CartState {
  final List<CartItem> items;
  final Customer? customer;
  final String? discountType; // 'percentage' or 'fixed'
  final double discountValue;
  final String paymentMethod;
  final int loyaltyRedeemed;

  CartState({
    this.items = const [],
    this.customer,
    this.discountType,
    this.discountValue = 0,
    this.paymentMethod = 'CASH',
    this.loyaltyRedeemed = 0,
  });

  double get subtotal =>
      items.fold(0, (sum, item) => sum + item.lineTotal);

  double get taxTotal =>
      items.fold(0, (sum, item) => sum + item.taxAmount);

  double get discountAmount {
    if (discountType == 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  }

  double get total =>
      subtotal - discountAmount + taxTotal - loyaltyRedeemed;

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  bool get isEmpty => items.isEmpty;

  CartState copyWith({
    List<CartItem>? items,
    Customer? customer,
    String? discountType,
    double? discountValue,
    String? paymentMethod,
    int? loyaltyRedeemed,
  }) =>
      CartState(
        items: items ?? this.items,
        customer: customer ?? this.customer,
        discountType: discountType ?? this.discountType,
        discountValue: discountValue ?? this.discountValue,
        paymentMethod: paymentMethod ?? this.paymentMethod,
        loyaltyRedeemed: loyaltyRedeemed ?? this.loyaltyRedeemed,
      );
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(CartState());

  void addProduct(Product product) {
    final existingIndex =
        state.items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      final updated = List<CartItem>.from(state.items);
      updated[existingIndex].quantity++;
      state = state.copyWith(items: updated);
    } else {
      state = state.copyWith(
        items: [...state.items, CartItem(product: product)],
      );
    }
  }

  void removeProduct(String productId) {
    state = state.copyWith(
      items: state.items.where((i) => i.product.id != productId).toList(),
    );
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    final updated = List<CartItem>.from(state.items);
    final index = updated.indexWhere((i) => i.product.id == productId);
    if (index >= 0) {
      updated[index].quantity = quantity;
      state = state.copyWith(items: updated);
    }
  }

  void setCustomer(Customer? customer) {
    state = state.copyWith(customer: customer);
  }

  void setDiscount(String? type, double value) {
    state = state.copyWith(discountType: type, discountValue: value);
  }

  void setPaymentMethod(String method) {
    state = state.copyWith(paymentMethod: method);
  }

  void setLoyaltyRedeemed(int points) {
    state = state.copyWith(loyaltyRedeemed: points);
  }

  void clear() {
    state = CartState();
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
