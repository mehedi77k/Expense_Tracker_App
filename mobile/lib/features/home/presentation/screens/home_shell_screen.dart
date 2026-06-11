import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

import 'package:expense_tracker/features/analytics/presentation/screens/analytics_screen.dart';
import 'package:expense_tracker/features/budgets/presentation/screens/budgets_screen.dart';
import 'package:expense_tracker/features/home/presentation/screens/dashboard_screen.dart';
import 'package:expense_tracker/features/profile/presentation/screens/profile_screen.dart';
import 'package:expense_tracker/features/savings/presentation/screens/savings_screen.dart';
import 'package:expense_tracker/features/transactions/presentation/screens/transactions_screen.dart';

class HomeShellScreen extends StatefulWidget {
  const HomeShellScreen({super.key});

  @override
  State<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends State<HomeShellScreen> {
  final Connectivity _connectivity = Connectivity();
  int _index = 0;

  static const _titles = [
    'Dashboard',
    'Transactions',
    'Budgets',
    'Analytics',
    'Savings',
    'Profile',
  ];

  final _screens = const [
    DashboardScreen(),
    TransactionsScreen(),
    BudgetsScreen(),
    AnalyticsScreen(),
    SavingsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<ConnectivityResult>>(
      stream: _connectivity.onConnectivityChanged,
      initialData: const [ConnectivityResult.wifi],
      builder: (context, snapshot) {
        final online = snapshot.data?.isNotEmpty == true &&
            !snapshot.data!.contains(ConnectivityResult.none);

        return Scaffold(
          appBar: AppBar(
            title: Text(_titles[_index]),
          ),
          body: Column(
            children: [
              if (!online)
                Container(
                  width: double.infinity,
                  color: Theme.of(context).colorScheme.errorContainer,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Text(
                    'Offline mode - changes will sync later',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              Expanded(child: _screens[_index]),
            ],
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: _index,
            onDestinationSelected: (value) => setState(() => _index = value),
            destinations: const [
              NavigationDestination(
                  icon: Icon(Icons.dashboard_outlined), label: 'Home'),
              NavigationDestination(
                  icon: Icon(Icons.receipt_long_outlined), label: 'Trans'),
              NavigationDestination(
                  icon: Icon(Icons.account_balance_wallet_outlined),
                  label: 'Budgets'),
              NavigationDestination(
                  icon: Icon(Icons.analytics_outlined), label: 'Reports'),
              NavigationDestination(
                  icon: Icon(Icons.savings_outlined), label: 'Goals'),
              NavigationDestination(
                  icon: Icon(Icons.person_outline), label: 'Profile'),
            ],
          ),
        );
      },
    );
  }
}
