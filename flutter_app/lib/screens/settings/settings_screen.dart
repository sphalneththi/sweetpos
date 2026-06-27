import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/connectivity_service.dart';
import '../../sync/sync_engine.dart';
import '../../utils/constants.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _serverUrlController = TextEditingController(text: AppConstants.defaultApiUrl);

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // User info
        Card(
          child: ListTile(
            leading: CircleAvatar(
              child: Text(authState.user?.fullName[0].toUpperCase() ?? '?'),
            ),
            title: Text(authState.user?.fullName ?? 'Unknown'),
            subtitle: Text('${authState.user?.role ?? ''} • ${authState.user?.username ?? ''}'),
            trailing: const Icon(Icons.person),
          ),
        ),
        const SizedBox(height: 16),

        // Server configuration
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Server Configuration',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                TextField(
                  controller: _serverUrlController,
                  decoration: const InputDecoration(
                    labelText: 'API Server URL',
                    hintText: 'http://your-server:8080/api',
                    prefixIcon: Icon(Icons.cloud),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        ApiService().setBaseUrl(_serverUrlController.text);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Server URL updated')),
                        );
                      },
                      icon: const Icon(Icons.save, size: 18),
                      label: const Text('Save'),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final reachable = await ApiService().isServerReachable();
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(reachable
                                  ? '✓ Server is reachable'
                                  : '✗ Server is not reachable'),
                              backgroundColor:
                                  reachable ? Colors.green : Colors.red,
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.wifi_find, size: 18),
                      label: const Text('Test'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Sync
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Sync',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ListTile(
                  leading: Icon(
                    ConnectivityService().isOnline
                        ? Icons.cloud_done
                        : Icons.cloud_off,
                    color: ConnectivityService().isOnline
                        ? Colors.green
                        : Colors.red,
                  ),
                  title: Text(ConnectivityService().isOnline
                      ? 'Online - Connected to cloud'
                      : 'Offline - Working locally'),
                  dense: true,
                ),
                const SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: () async {
                    await SyncEngine().attemptSync();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Sync triggered')),
                      );
                    }
                  },
                  icon: const Icon(Icons.sync, size: 18),
                  label: const Text('Force Sync Now'),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () async {
                    await SyncEngine().fullSync();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Full sync completed')),
                      );
                    }
                  },
                  icon: const Icon(Icons.cloud_download, size: 18),
                  label: const Text('Full Sync (Pull All Data)'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // About
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('About',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('SweetPOS v${AppConstants.version}'),
                const Text('Offline-First Hybrid POS System'),
                const SizedBox(height: 8),
                const Text(
                  'Works offline with local SQLite database. '
                  'Syncs automatically to cloud when connected.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Logout
        OutlinedButton.icon(
          onPressed: () => ref.read(authProvider.notifier).logout(),
          icon: const Icon(Icons.logout, color: Colors.red),
          label: const Text('Logout', style: TextStyle(color: Colors.red)),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Colors.red),
            padding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }
}
