import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';

class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  final Connectivity _connectivity = Connectivity();
  final _controller = StreamController<bool>.broadcast();

  Stream<bool> get onlineStream => _controller.stream;
  bool _isOnline = false;
  bool get isOnline => _isOnline;

  Future<void> init() async {
    // Check initial connectivity
    final result = await _connectivity.checkConnectivity();
    _isOnline = !result.contains(ConnectivityResult.none);

    // Also check if server is actually reachable
    if (_isOnline) {
      _isOnline = await ApiService().isServerReachable();
    }
    _controller.add(_isOnline);

    // Listen for changes
    _connectivity.onConnectivityChanged.listen((results) async {
      final connected = !results.contains(ConnectivityResult.none);
      if (connected) {
        // Verify server is reachable
        _isOnline = await ApiService().isServerReachable();
      } else {
        _isOnline = false;
      }
      _controller.add(_isOnline);
    });
  }

  void dispose() {
    _controller.close();
  }
}
