import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sweetpos/screens/auth/login_screen.dart';
import 'package:sweetpos/screens/pos/pos_screen.dart';
import 'package:sweetpos/screens/dashboard/dashboard_screen.dart';
import 'package:sweetpos/screens/products/products_screen.dart';
import 'package:sweetpos/screens/customers/customers_screen.dart';
import 'package:sweetpos/screens/inventory/inventory_screen.dart';
import 'package:sweetpos/screens/settings/settings_screen.dart';
import 'package:sweetpos/providers/auth_provider.dart';
import 'package:sweetpos/utils/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: SweetPosApp()));
}

class SweetPosApp extends ConsumerWidget {
  const SweetPosApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'SweetPOS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      home: authState.isAuthenticated
          ? const MainShell()
          : const LoginScreen(),
    );
  }
}

class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    POSScreen(),
    DashboardScreen(),
    ProductsScreen(),
    CustomersScreen(),
    InventoryScreen(),
    SettingsScreen(),
  ];

  final List<NavigationDestination> _destinations = const [
    NavigationDestination(icon: Icon(Icons.point_of_sale), label: 'POS'),
    NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.inventory_2), label: 'Products'),
    NavigationDestination(icon: Icon(Icons.people), label: 'Customers'),
    NavigationDestination(icon: Icon(Icons.warehouse), label: 'Inventory'),
    NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) => setState(() => _currentIndex = index),
            labelType: NavigationRailLabelType.all,
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Column(
                children: [
                  const Text('🍬', style: TextStyle(fontSize: 28)),
                  const SizedBox(height: 4),
                  Text('SweetPOS',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          )),
                ],
              ),
            ),
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.point_of_sale), label: Text('POS')),
              NavigationRailDestination(icon: Icon(Icons.dashboard), label: Text('Dashboard')),
              NavigationRailDestination(icon: Icon(Icons.inventory_2), label: Text('Products')),
              NavigationRailDestination(icon: Icon(Icons.people), label: Text('Customers')),
              NavigationRailDestination(icon: Icon(Icons.warehouse), label: Text('Inventory')),
              NavigationRailDestination(icon: Icon(Icons.settings), label: Text('Settings')),
            ],
            trailing: Expanded(
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: IconButton(
                    icon: const Icon(Icons.logout, color: Colors.red),
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                  ),
                ),
              ),
            ),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: _screens[_currentIndex]),
        ],
      ),
    );
  }
}

// Screens are implemented in their respective files under lib/screens/
