import 'package:flutter/material.dart';
import '../models/estimation_request.dart';

class RolesChart extends StatelessWidget {
  final List<RoleEffort> roles;

  const RolesChart({super.key, required this.roles});

  @override
  Widget build(BuildContext context) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
      Colors.teal,
      Colors.indigo,
      Colors.pink,
    ];

    return Column(
      children: [
        // Simple bar chart representation
        Container(
          height: 200,
          padding: const EdgeInsets.all(16),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final availableWidth = constraints.maxWidth - 32; // Account for padding
              final barWidth = (availableWidth / roles.length).clamp(40.0, 80.0);
              final totalWidth = barWidth * roles.length;
              
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Container(
                  width: totalWidth > availableWidth ? totalWidth : availableWidth,
                  child: Row(
                    mainAxisAlignment: totalWidth > availableWidth 
                        ? MainAxisAlignment.start 
                        : MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: roles.asMap().entries.map((entry) {
                      final index = entry.key;
                      final role = entry.value;
                      final color = colors[index % colors.length];
                      final maxWeeks = roles.map((r) => r.effortWeeks).reduce((a, b) => a > b ? a : b);
                      final height = (role.effortWeeks / maxWeeks) * 120; // Reduced max height

                      return Container(
                        width: barWidth,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Container(
                              height: height,
                              decoration: BoxDecoration(
                                color: color,
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${role.effortWeeks.toStringAsFixed(1)}w',
                              style: Theme.of(context).textTheme.bodySmall,
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        // Legend
        Container(
          width: double.infinity,
          child: Wrap(
            spacing: 12,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: roles.asMap().entries.map((entry) {
              final index = entry.key;
              final role = entry.value;
              final color = colors[index % colors.length];

              return Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.4,
                  minWidth: 120,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        '${role.role} (${role.percentage.toStringAsFixed(1)}%)',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 11,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
