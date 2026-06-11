import 'package:flutter/material.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        children: const [
          _Slide(title: 'Track', subtitle: 'Capture every expense and income.'),
          _Slide(title: 'Budget', subtitle: 'Stay on top of every category.'),
          _Slide(
              title: 'Achieve', subtitle: 'Reach savings goals with clarity.'),
        ],
      ),
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 16),
          Text(subtitle, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
