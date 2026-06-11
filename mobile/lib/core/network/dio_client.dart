import 'package:dio/dio.dart';

class DioClient {
  DioClient(String baseUrl)
    : dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 20),
        ),
      );

  final Dio dio;
}
