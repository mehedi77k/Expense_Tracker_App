import '../../../../core/network/token_storage.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/models/auth_session_model.dart';
import '../../domain/entities/auth_session.dart';

class AuthRepositoryImpl {
  AuthRepositoryImpl(this._remote, this._tokenStorage);

  final AuthRemoteDataSource _remote;
  final TokenStorage _tokenStorage;

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final json =
        await _remote.register(name: name, email: email, password: password);
    final session = AuthSessionModel.fromJson(json);
    await _tokenStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
    return session;
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final json = await _remote.login(email: email, password: password);
    final session = AuthSessionModel.fromJson(json);
    await _tokenStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
    return session;
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken != null) {
      await _remote.logout(refreshToken);
    }
    await _tokenStorage.clear();
  }
}
