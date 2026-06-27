import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_service.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final data = await ApiService().getDashboard();
      if (mounted) setState(() { _data = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_data == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text('Unable to load dashboard'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () { setState(() => _loading = true); _loadDashboard(); },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final revenue = (_data!['todayRevenue'] as num?)?.toDouble() ?? 0;
    final transactions = (_data!['todayTransactions'] as num?)?.toInt() ?? 0;
    final topProducts = (_data!['topProducts'] as List?) ?? [];
    final lowStock = (_data!['lowStockAlerts'] as List?) ?? [];

    return RefreshIndicator(
      onRefresh: _loadDashboard,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Summary cards
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _SummaryCard(
                title: "Today's Revenue",
                value: 'Rs. ${revenue.toStringAsFixed(0)}',
                icon: Icons.attach_money,
                color: Colors.green,
              ),
              _SummaryCard(
                title: 'Transactions',
                value: '$transactions',
                icon: Icons.receipt_long,
                color: Colors.blue,
              ),
              _SummaryCard(
                title: 'Low Stock Items',
                value: '${lowStock.length}',
                icon: Icons.warning_amber,
                color: Colors.orange,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Top products
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Top Products Today',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (topProducts.isEmpty)
                    const Text('No sales today yet', style: TextStyle(color: Colors.grey))
                  else
                    ...topProducts.take(5).map((p) => ListTile(
                          dense: true,
                          title: Text(p['name'] ?? ''),
                          trailing: Text(
                            'Rs. ${(p['revenue'] as num?)?.toStringAsFixed(0) ?? '0'}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text('Qty: ${p['quantity'] ?? 0}'),
                        )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Low stock alerts
          if (lowStock.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.warning_amber, color: Colors.orange),
                        SizedBox(width: 8),
                        Text('Low Stock Alerts',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...lowStock.map((item) => ListTile(
                          dense: true,
                          title: Text(item['productName'] ?? ''),
                          trailing: Text(
                            '${item['currentStock']} / ${item['minStock']}',
                            style: const TextStyle(
                                color: Colors.orange, fontWeight: FontWeight.bold),
                          ),
                        )),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 4),
              Text(value,
                  style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
        ),
      ),
    );
  }
}
