import '../../../../core/network/api_client.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _client.dio.post('/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    final response = await _client.dio.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<void> logout(String refreshToken) async {
    await _client.dio.post('/auth/logout', data: {
      'refreshToken': refreshToken,
    });
  }
}
