class Product {
  final String id;
  final String name;
  final String? description;
  final String? barcode;
  final String? sku;
  final String? categoryId;
  final String? categoryName;
  final double costPrice;
  final double sellingPrice;
  final double taxRate;
  final int stockQuantity;
  final int minStockLevel;
  final String? unit;
  final String? imageUrl;
  final bool active;
  final bool trackInventory;

  Product({
    required this.id,
    required this.name,
    this.description,
    this.barcode,
    this.sku,
    this.categoryId,
    this.categoryName,
    required this.costPrice,
    required this.sellingPrice,
    this.taxRate = 0,
    this.stockQuantity = 0,
    this.minStockLevel = 5,
    this.unit,
    this.imageUrl,
    this.active = true,
    this.trackInventory = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'],
        name: json['name'],
        description: json['description'],
        barcode: json['barcode'],
        sku: json['sku'],
        categoryId: json['categoryId'],
        categoryName: json['categoryName'],
        costPrice: (json['costPrice'] as num).toDouble(),
        sellingPrice: (json['sellingPrice'] as num).toDouble(),
        taxRate: (json['taxRate'] as num?)?.toDouble() ?? 0,
        stockQuantity: json['stockQuantity'] ?? 0,
        minStockLevel: json['minStockLevel'] ?? 5,
        unit: json['unit'],
        imageUrl: json['imageUrl'],
        active: json['active'] ?? true,
        trackInventory: json['trackInventory'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'barcode': barcode,
        'sku': sku,
        'categoryId': categoryId,
        'categoryName': categoryName,
        'costPrice': costPrice,
        'sellingPrice': sellingPrice,
        'taxRate': taxRate,
        'stockQuantity': stockQuantity,
        'minStockLevel': minStockLevel,
        'unit': unit,
        'imageUrl': imageUrl,
        'active': active,
        'trackInventory': trackInventory,
      };

  bool get isLowStock => stockQuantity <= minStockLevel;
}
