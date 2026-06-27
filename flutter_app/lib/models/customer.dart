class Customer {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? address;
  final int loyaltyPoints;
  final double totalSpent;
  final int visitCount;
  final String? notes;
  final bool active;

  Customer({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.address,
    this.loyaltyPoints = 0,
    this.totalSpent = 0,
    this.visitCount = 0,
    this.notes,
    this.active = true,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'],
        name: json['name'],
        phone: json['phone'],
        email: json['email'],
        address: json['address'],
        loyaltyPoints: json['loyaltyPoints'] ?? 0,
        totalSpent: (json['totalSpent'] as num?)?.toDouble() ?? 0,
        visitCount: json['visitCount'] ?? 0,
        notes: json['notes'],
        active: json['active'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'address': address,
        'loyaltyPoints': loyaltyPoints,
        'totalSpent': totalSpent,
        'visitCount': visitCount,
        'notes': notes,
        'active': active,
      };
}
