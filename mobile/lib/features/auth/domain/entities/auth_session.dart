class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.email,
    required this.name,
  });

  final String accessToken;
  final String refreshToken;
  final int userId;
  final String email;
  final String name;
}
