import 'package:dio/dio.dart';

class ApiClient {
  ApiClient({required String baseUrl, String? token})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            headers: {
              if (token != null) 'Authorization': 'Bearer $token',
            },
          ),
        );

  final Dio _dio;

  Dio get dio => _dio;
}
