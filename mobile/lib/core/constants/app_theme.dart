import 'package:flutter/material.dart';

class AppTheme {
  static const _primary = Color(0xFF6C5CE7);
  static const _secondary = Color(0xFF00B894);
  static const _expense = Color(0xFFFF6B6B);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _primary,
      brightness: Brightness.light,
      primary: _primary,
      secondary: _secondary,
      error: _expense,
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      appBarTheme: const AppBarTheme(centerTitle: false),
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _primary,
      brightness: Brightness.dark,
      primary: _primary,
      secondary: _secondary,
      error: _expense,
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFF1A1A2E),
      appBarTheme: const AppBarTheme(centerTitle: false),
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
    );
  }
}
