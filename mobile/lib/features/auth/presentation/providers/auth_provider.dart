import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/token_storage.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_session.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(const FlutterSecureStorage());
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
      baseUrl: const String.fromEnvironment('API_BASE_URL',
          defaultValue: 'http://10.0.2.2:3000/api/v1'));
});

final authRepositoryProvider = Provider<AuthRepositoryImpl>((ref) {
  return AuthRepositoryImpl(
    AuthRemoteDataSource(ref.watch(apiClientProvider)),
    ref.watch(tokenStorageProvider),
  );
});

final authSessionProvider =
    StateNotifierProvider<AuthController, AsyncValue<AuthSession?>>((ref) {
  return AuthController(ref.watch(authRepositoryProvider));
});

class AuthController extends StateNotifier<AsyncValue<AuthSession?>> {
  AuthController(this._repository) : super(const AsyncData(null));

  final AuthRepositoryImpl _repository;

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
        () => _repository.login(email: email, password: password));
  }

  Future<void> register(
      {required String name,
      required String email,
      required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
        _repository.register(name: name, email: email, password: password));
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AsyncData(null);
  }
}
