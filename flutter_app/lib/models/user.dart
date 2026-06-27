class User {
  final String id;
  final String username;
  final String fullName;
  final String? email;
  final String? phone;
  final String role;
  final bool active;

  User({
    required this.id,
    required this.username,
    required this.fullName,
    this.email,
    this.phone,
    required this.role,
    required this.active,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'],
        username: json['username'],
        fullName: json['fullName'],
        email: json['email'],
        phone: json['phone'],
        role: json['role'],
        active: json['active'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'role': role,
        'active': active,
      };

  bool get isAdmin => role == 'ADMIN';
  bool get isCashier => role == 'CASHIER';
}
