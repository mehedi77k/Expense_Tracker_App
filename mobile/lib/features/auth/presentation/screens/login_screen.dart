import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authSessionProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 24),
          Text('Welcome back', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),
          AppTextField(
            label: 'Email',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          AppTextField(
            label: 'Password',
            controller: _passwordController,
            obscureText: true,
          ),
          if (authState.hasError) ...[
            const SizedBox(height: 16),
            Text(
              authState.error.toString(),
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 24),
          AppButton(
            label: isLoading ? 'Logging in...' : 'Login',
            onPressed: isLoading
                ? null
                : () async {
                    await ref.read(authSessionProvider.notifier).login(
                          email: _emailController.text.trim(),
                          password: _passwordController.text,
                        );
                    final session = ref.read(authSessionProvider).valueOrNull;
                    if (mounted && session != null) {
                      context.go('/dashboard');
                    }
                  },
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.go('/register'),
            child: const Text('Need an account? Register'),
          ),
        ],
      ),
    );
  }
}
