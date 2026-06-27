import 'product.dart';

class CartItem {
  final Product product;
  int quantity;
  double discountAmount;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.discountAmount = 0,
  });

  double get lineTotal =>
      (product.sellingPrice * quantity) - discountAmount;

  double get taxAmount =>
      lineTotal * (product.taxRate / 100);

  double get totalWithTax => lineTotal + taxAmount;

  Map<String, dynamic> toSaleItemJson() => {
        'productId': product.id,
        'quantity': quantity,
        'discountAmount': discountAmount,
      };
}
