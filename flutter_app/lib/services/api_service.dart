import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class ApiService {
  late final Dio _dio;
  String? _accessToken;
  String? _refreshToken;

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.defaultApiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 && _refreshToken != null) {
          try {
            final response = await _dio.post('/auth/refresh', data: {
              'refreshToken': _refreshToken,
            });
            _accessToken = response.data['accessToken'];
            _refreshToken = response.data['refreshToken'];
            await _saveTokens();

            // Retry original request
            error.requestOptions.headers['Authorization'] = 'Bearer $_accessToken';
            final retryResponse = await _dio.fetch(error.requestOptions);
            handler.resolve(retryResponse);
            return;
          } catch (e) {
            // Refresh failed, clear tokens
            await clearTokens();
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('access_token');
    _refreshToken = prefs.getString('refresh_token');
  }

  void setBaseUrl(String url) {
    _dio.options.baseUrl = url;
  }

  bool get isAuthenticated => _accessToken != null;

  String? get accessToken => _accessToken;

  // Auth
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'username': username,
      'password': password,
    });
    _accessToken = response.data['accessToken'];
    _refreshToken = response.data['refreshToken'];
    await _saveTokens();
    return response.data;
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }

  Future<void> _saveTokens() async {
    final prefs = await SharedPreferences.getInstance();
    if (_accessToken != null) await prefs.setString('access_token', _accessToken!);
    if (_refreshToken != null) await prefs.setString('refresh_token', _refreshToken!);
  }

  // Products
  Future<List<dynamic>> getProducts({String? search, int page = 0, int size = 100}) async {
    final response = await _dio.get('/products', queryParameters: {
      if (search != null) 'search': search,
      'page': page,
      'size': size,
    });
    return response.data['content'] ?? [];
  }

  Future<Map<String, dynamic>> getProductByBarcode(String barcode) async {
    final response = await _dio.get('/products/barcode/$barcode');
    return response.data;
  }

  // Categories
  Future<List<dynamic>> getCategories() async {
    final response = await _dio.get('/categories');
    return response.data;
  }

  // Customers
  Future<List<dynamic>> getCustomers({String? search}) async {
    final response = await _dio.get('/customers', queryParameters: {
      if (search != null) 'search': search,
    });
    return response.data['content'] ?? [];
  }

  // Sales
  Future<Map<String, dynamic>> createSale(Map<String, dynamic> saleData) async {
    final response = await _dio.post('/sales', data: saleData);
    return response.data;
  }

  Future<List<dynamic>> getSales({int page = 0, int size = 50}) async {
    final response = await _dio.get('/sales', queryParameters: {
      'page': page,
      'size': size,
    });
    return response.data['content'] ?? [];
  }

  // Dashboard
  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _dio.get('/dashboard');
    return response.data;
  }

  // Sync
  Future<Map<String, dynamic>> sync(Map<String, dynamic> payload) async {
    final response = await _dio.post('/sync', data: payload);
    return response.data;
  }

  // Inventory
  Future<void> stockIn(Map<String, dynamic> data) async {
    await _dio.post('/inventory/stock-in', data: data);
  }

  Future<void> stockOut(Map<String, dynamic> data) async {
    await _dio.post('/inventory/stock-out', data: data);
  }

  // Health check
  Future<bool> isServerReachable() async {
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
