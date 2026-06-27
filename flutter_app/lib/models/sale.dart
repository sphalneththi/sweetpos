class Sale {
  final String? id;
  final String? localId;
  final String? invoiceNumber;
  final String? terminalId;
  final String cashierId;
  final String? customerId;
  final double subtotal;
  final double discountAmount;
  final String? discountType;
  final double discountValue;
  final double taxAmount;
  final double totalAmount;
  final String paymentMethod;
  final double? cashReceived;
  final double? changeAmount;
  final int loyaltyEarned;
  final int loyaltyRedeemed;
  final String status;
  final String? notes;
  final List<SaleItem> items;
  final DateTime createdAt;
  final bool synced;

  Sale({
    this.id,
    this.localId,
    this.invoiceNumber,
    this.terminalId,
    required this.cashierId,
    this.customerId,
    required this.subtotal,
    this.discountAmount = 0,
    this.discountType,
    this.discountValue = 0,
    this.taxAmount = 0,
    required this.totalAmount,
    required this.paymentMethod,
    this.cashReceived,
    this.changeAmount,
    this.loyaltyEarned = 0,
    this.loyaltyRedeemed = 0,
    this.status = 'COMPLETED',
    this.notes,
    required this.items,
    required this.createdAt,
    this.synced = false,
  });

  Map<String, dynamic> toCreateJson() => {
        'localId': localId,
        'customerId': customerId,
        'terminalId': terminalId ?? 'FLUTTER-01',
        'items': items.map((i) => i.toJson()).toList(),
        'discountType': discountType,
        'discountValue': discountValue,
        'discountAmount': discountAmount,
        'paymentMethod': paymentMethod,
        'cashReceived': cashReceived,
        'loyaltyRedeemed': loyaltyRedeemed,
        'notes': notes,
      };
}

class SaleItem {
  final String productId;
  final String? productName;
  final int quantity;
  final double unitPrice;
  final double discountAmount;
  final double taxAmount;
  final double totalPrice;

  SaleItem({
    required this.productId,
    this.productName,
    required this.quantity,
    required this.unitPrice,
    this.discountAmount = 0,
    this.taxAmount = 0,
    required this.totalPrice,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'quantity': quantity,
        'discountAmount': discountAmount,
      };
}
