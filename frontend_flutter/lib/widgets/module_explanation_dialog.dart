import 'package:flutter/material.dart';
import '../models/estimation_response.dart';

class ModuleExplanationDialog extends StatelessWidget {
  final ModuleEstimate module;

  const ModuleExplanationDialog({
    super.key,
    required this.module,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: 600,
        constraints: const BoxConstraints(maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: Theme.of(context).primaryColor,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          module.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            _buildComplexityChip(context),
                            const SizedBox(width: 8),
                            Text(
                              '${module.weeks.toStringAsFixed(1)} weeks • ${module.role}',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),

            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Complexity Rationale
                    if (module.complexityRationale != null) ...[
                      _buildSection(
                        context,
                        'Complexity Rationale',
                        Icons.psychology,
                        Text(
                          module.complexityRationale!,
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Applied Multipliers
                    if (module.multipliers.isNotEmpty) ...[
                      _buildSection(
                        context,
                        'Applied Multipliers',
                        Icons.tune,
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: module.multipliers.entries.map((entry) {
                            final percentage = (entry.value * 100).toStringAsFixed(0);
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '+$percentage%',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.orange,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _getMultiplierName(entry.key),
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Estimation Breakdown
                    _buildSection(
                      context,
                      'Estimation Breakdown',
                      Icons.calculate,
                      Column(
                        children: [
                          _buildEstimationRow(
                            context,
                            'Base Points',
                            '${module.basePoints} pts',
                            'Based on ${module.complexity} complexity',
                          ),
                          _buildEstimationRow(
                            context,
                            'Total Points',
                            '${module.totalPoints} pts',
                            'After applying multipliers',
                          ),
                          _buildEstimationRow(
                            context,
                            'Estimated Effort',
                            '${module.weeks.toStringAsFixed(1)} weeks',
                            'Converted using team velocity',
                          ),
                        ],
                      ),
                    ),

                    // Specific Assumptions
                    if (module.assumptions != null && module.assumptions!.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      _buildSection(
                        context,
                        'Specific Assumptions',
                        Icons.checklist,
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: module.assumptions!.map((assumption) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    margin: const EdgeInsets.only(top: 6),
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).primaryColor,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      assumption,
                                      style: Theme.of(context).textTheme.bodyMedium,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],

                    // Why This Matters
                    if (module.whyMatters != null) ...[
                      const SizedBox(height: 24),
                      _buildSection(
                        context,
                        'Why This Matters',
                        Icons.lightbulb_outline,
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                            ),
                          ),
                          child: Text(
                            module.whyMatters!,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildComplexityChip(BuildContext context) {
    Color chipColor;
    switch (module.complexity) {
      case 'L':
        chipColor = Colors.green;
        break;
      case 'M':
        chipColor = Colors.orange;
        break;
      case 'H':
        chipColor = Colors.red;
        break;
      default:
        chipColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: chipColor.withOpacity(0.3)),
      ),
      child: Text(
        '${module.complexity} Complexity',
        style: TextStyle(
          color: chipColor,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, IconData icon, Widget content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: Theme.of(context).primaryColor),
            const SizedBox(width: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        content,
      ],
    );
  }

  Widget _buildEstimationRow(BuildContext context, String label, String value, String description) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              description,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getMultiplierName(String key) {
    const multiplierNames = {
      'payments': 'Payment Integration',
      'auth': 'Authentication',
      'offline': 'Offline Support',
      'maps': 'Maps Integration',
      'push': 'Push Notifications',
      'accessibility': 'Accessibility',
      'i18n': 'Internationalization',
    };
    return multiplierNames[key] ?? key.toUpperCase();
  }
}
