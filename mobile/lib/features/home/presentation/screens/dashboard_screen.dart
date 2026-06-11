import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _BalanceCard(),
          SizedBox(height: 16),
          _SectionHeader('Quick Stats'),
          SizedBox(height: 8),
          _PlaceholderStrip(),
          SizedBox(height: 16),
          _SectionHeader('Recent Transactions'),
          SizedBox(height: 8),
          _PlaceholderList(),
        ],
      ),
    );
  }
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Current Balance',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Text(r'$24,500.00',
                style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.titleLarge);
  }
}

class _PlaceholderStrip extends StatelessWidget {
  const _PlaceholderStrip();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        3,
        (index) => Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text('Item ${index + 1}'),
                  const SizedBox(height: 8),
                  const Text('0.00'),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PlaceholderList extends StatelessWidget {
  const _PlaceholderList();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        5,
        (index) => ListTile(
          leading: const CircleAvatar(child: Icon(Icons.receipt_long)),
          title: Text('Transaction ${index + 1}'),
          subtitle: const Text('Today'),
          trailing: const Text('-25.00'),
        ),
      ),
    );
  }
}
