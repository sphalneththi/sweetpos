import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({User? user, bool? isLoading, String? error}) => AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;

  AuthNotifier(this._api) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    await _api.init();
    if (_api.isAuthenticated) {
      // Token exists, try to verify
      try {
        // We could call /auth/me here, but for offline-first
        // we'll trust the stored token
        state = state.copyWith(isLoading: false);
      } catch (e) {
        state = AuthState();
      }
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.login(username, password);
      final user = User.fromJson(data['user']);
      state = AuthState(user: user);
    } catch (e) {
      String msg = 'Login failed';
      if (e.toString().contains('Invalid credentials')) {
        msg = 'Invalid username or password';
      } else if (e.toString().contains('locked')) {
        msg = 'Account is locked';
      } else if (e.toString().contains('disabled')) {
        msg = 'Account is disabled';
      }
      state = AuthState(error: msg);
    }
  }

  Future<void> logout() async {
    await _api.clearTokens();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ApiService());
});
