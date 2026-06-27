class Category {
  final String id;
  final String name;
  final String? description;
  final String? color;
  final String? icon;
  final int sortOrder;
  final bool active;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.color,
    this.icon,
    this.sortOrder = 0,
    this.active = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'],
        name: json['name'],
        description: json['description'],
        color: json['color'],
        icon: json['icon'],
        sortOrder: json['sortOrder'] ?? 0,
        active: json['active'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'color': color,
        'icon': icon,
        'sortOrder': sortOrder,
        'active': active,
      };
}
