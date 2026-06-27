class AppConstants {
  static const String appName = 'SweetPOS';
  static const String version = '2.0.0';

  // API Configuration
  static const String defaultApiUrl = 'http://localhost:8080/api';
  static const String wsUrl = 'ws://localhost:8080/ws';

  // Local DB
  static const String dbName = 'sweetpos_local.db';

  // Sync Configuration
  static const Duration syncInterval = Duration(seconds: 30);
  static const int maxRetries = 3;

  // Loyalty
  static const int loyaltyPointsPerHundred = 1; // 1 point per 100 LKR spent
}
