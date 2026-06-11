import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const _primary = Color(0xFF6C5CE7);
  static const _secondary = Color(0xFF00B894);
  static const _expense = Color(0xFFFF6B6B);

  static TextTheme _textTheme(Brightness brightness) {
    final base = GoogleFonts.plusJakartaSansTextTheme();
    return base.apply(
      bodyColor: brightness == Brightness.dark
          ? Colors.white
          : const Color(0xFF1E1E1E),
      displayColor: brightness == Brightness.dark
          ? Colors.white
          : const Color(0xFF1E1E1E),
    );
  }

  static CardThemeData _cardTheme() {
    return CardThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
    );
  }

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
      textTheme: _textTheme(Brightness.light),
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      appBarTheme: const AppBarTheme(centerTitle: false),
      cardTheme: _cardTheme(),
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
      textTheme: _textTheme(Brightness.dark),
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFF1A1A2E),
      appBarTheme: const AppBarTheme(centerTitle: false),
      cardTheme: _cardTheme(),
    );
  }
}
