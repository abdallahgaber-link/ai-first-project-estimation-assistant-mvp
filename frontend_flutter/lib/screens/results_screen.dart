import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../models/estimation_response.dart';
import '../services/api_service.dart';
import '../widgets/module_explanation_dialog.dart';
import '../widgets/calibration_panel.dart';

class ResultsScreen extends HookConsumerWidget {
  final EstimationResponse estimation;
  final EstimationMeta meta;
  final String projectTitle;

  const ResultsScreen({
    super.key,
    required this.estimation,
    required this.meta,
    required this.projectTitle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedTabIndex = useState<int>(0);
    final isExporting = useState(false);
    final currentEstimation = useState<EstimationResponse>(estimation);

    Future<void> exportEstimation(String format) async {
      isExporting.value = true;
      try {
        await ApiService.exportEstimation(estimation, projectTitle, format);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Exported as $format successfully')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Export failed: ${e.toString()}')),
          );
        }
      } finally {
        isExporting.value = false;
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          projectTitle,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.blue[800],
        foregroundColor: Colors.white,
        elevation: 4,
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.green.shade400, Colors.green.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.green.withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: PopupMenuButton<String>(
              icon: const Icon(Icons.download, color: Colors.white),
              tooltip: 'Export',
              onSelected: (format) => exportEstimation(format),
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'csv',
                  child: Row(
                    children: [
                      Icon(Icons.table_chart, color: Colors.green[700]),
                      const SizedBox(width: 8),
                      const Text('Export CSV'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'xlsx',
                  child: Row(
                    children: [
                      Icon(Icons.grid_on, color: Colors.green[700]),
                      const SizedBox(width: 8),
                      const Text('Export Excel'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'pdf',
                  child: Row(
                    children: [
                      Icon(Icons.picture_as_pdf, color: Colors.green[700]),
                      const SizedBox(width: 8),
                      const Text('Export PDF'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          // Summary Cards at top
          SliverToBoxAdapter(
            child: Container(
              color: Colors.grey[50],
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Three-point estimation
                  Row(
                    children: [
                      Expanded(
                        child: _buildSummaryCard(
                          'Optimistic',
                          '${estimation.optimistic.toStringAsFixed(1)} weeks',
                          Colors.green,
                          Icons.trending_up,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSummaryCard(
                          'Most Likely',
                          '${estimation.mostLikely.toStringAsFixed(1)} weeks',
                          Colors.blue,
                          Icons.timeline,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSummaryCard(
                          'Pessimistic',
                          '${estimation.pessimistic.toStringAsFixed(1)} weeks',
                          Colors.orange,
                          Icons.trending_down,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Additional metrics
                  Row(
                    children: [
                      Expanded(
                        child: _buildSummaryCard(
                          'Total Effort',
                          '${currentEstimation.value.totals.developmentMDs.toStringAsFixed(1)} MD',
                          Colors.purple,
                          Icons.work,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSummaryCard(
                          'Buffer Used',
                          '${(estimation.bufferUsed * 100).toStringAsFixed(0)}%',
                          Colors.red,
                          Icons.security,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSummaryCard(
                          'Team Velocity',
                          '${estimation.velocity} pts/week',
                          Colors.teal,
                          Icons.speed,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.memory,
                                size: 12, color: Colors.blue[700]),
                            const SizedBox(width: 4),
                            Text(
                              'Model: ${meta.model}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (meta.retryCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.refresh,
                                  size: 12, color: Colors.orange[700]),
                              const SizedBox(width: 4),
                              Text(
                                '${meta.retryCount} ${meta.retryCount == 1 ? 'retry' : 'retries'}',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.orange[700],
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Sticky Tab bar
          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyTabBarDelegate(
              child: Container(
                color: Colors.white,
                height: 70,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                child: Row(
                  children: [
                    _buildTabButton(
                        'Modules', Icons.view_module, 0, selectedTabIndex),
                    _buildTabButton('Roles', Icons.people, 1, selectedTabIndex),
                    _buildTabButton(
                        'WBS', Icons.account_tree, 2, selectedTabIndex),
                    _buildTabButton(
                        'Risks', Icons.warning, 3, selectedTabIndex),
                    _buildTabButton(
                        'Calibrate', Icons.tune, 4, selectedTabIndex),
                  ],
                ),
              ),
            ),
          ),

          // Tab content - convert to proper slivers for full scrolling
          if (selectedTabIndex.value == 0) _buildModulesSliver(),
          if (selectedTabIndex.value == 1) _buildRolesSliver(),
          if (selectedTabIndex.value == 2) _buildWBSSliver(),
          if (selectedTabIndex.value == 3) _buildRisksSliver(),
          if (selectedTabIndex.value == 4) _buildCalibrationSliver(),
        ],
      ),
    );
  }

  Widget _buildTabButton(String title, IconData icon, int index,
      ValueNotifier<int> selectedTabIndex) {
    final isSelected = selectedTabIndex.value == index;
    return Expanded(
      child: InkWell(
        onTap: () => selectedTabIndex.value = index,
        child: Container(
          height: 60,
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
          margin: const EdgeInsets.symmetric(horizontal: 1),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isSelected ? Colors.blue : Colors.transparent,
                width: 3,
              ),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: isSelected ? Colors.blue : Colors.grey[600],
                size: 20,
              ),
              const SizedBox(height: 6),
              Flexible(
                child: Text(
                  title,
                  style: TextStyle(
                    color: isSelected ? Colors.blue : Colors.grey[600],
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
      String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModulesSliver() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final module = estimation.modules[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            module.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) =>
                                  ModuleExplanationDialog(module: module),
                            );
                          },
                          icon: const Icon(Icons.info_outline, size: 16),
                          label: const Text('Explain'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getComplexityColor(module.complexity),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            module.complexity,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      module.notes,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildModuleMetric(
                            'Base Points', '${module.basePoints}'),
                        _buildModuleMetric(
                            'Total Points', '${module.totalPoints}'),
                        _buildModuleMetric(
                            'Weeks', '${module.weeks.toStringAsFixed(1)}'),
                        _buildModuleMetric('Role', module.role),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
          childCount: estimation.modules.length,
        ),
      ),
    );
  }

  Widget _buildModuleMetric(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Color _getComplexityColor(String complexity) {
    switch (complexity.toUpperCase()) {
      case 'L':
      case 'LOW':
        return Colors.blue;
      case 'M':
      case 'MEDIUM':
        return Colors.orange;
      case 'H':
      case 'HIGH':
        return Colors.red;
      case 'XL':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  Widget _buildRolesSliver() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final role = estimation.roles[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      role.role,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildMetricChip(
                          'Effort',
                          '${role.effortWeeks.toStringAsFixed(1)} weeks',
                          Colors.blue,
                        ),
                        const SizedBox(width: 8),
                        _buildMetricChip(
                          'Percentage',
                          '${role.percentage.toStringAsFixed(1)}%',
                          Colors.green,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
          childCount: estimation.roles.length,
        ),
      ),
    );
  }

  Widget _buildMetricChip(String label, String value, Color color) {
    return Chip(
      label: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 12,
          color: Colors.white,
        ),
      ),
      backgroundColor: color,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    );
  }

  Widget _buildWBSSliver() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final epic = estimation.wbs.epics[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      epic.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...epic.modules.map((module) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 4,
                                height: 20,
                                color: _getComplexityColor(module.complexity),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  module.name,
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _getComplexityColor(module.complexity),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  module.complexity,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            );
          },
          childCount: estimation.wbs.epics.length,
        ),
      ),
    );
  }

  Widget _buildRisksSliver() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverToBoxAdapter(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Project Risks',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                ...estimation.risks.map((risk) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildRiskSeverityBadge(
                              _categorizeRiskSeverity(risk)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  risk,
                                  style: const TextStyle(fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _getRiskSeverityDescription(
                                      _categorizeRiskSeverity(risk)),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCalibrationSliver() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverToBoxAdapter(
        child: CalibrationPanel(
          originalEstimation: estimation,
          onEstimationChanged: (updatedEstimation) {
            // Handle estimation update if needed
          },
        ),
      ),
    );
  }

  // Risk severity categorization methods
  String _categorizeRiskSeverity(String risk) {
    final riskLower = risk.toLowerCase();

    // High severity keywords
    if (riskLower.contains('security') ||
        riskLower.contains('data loss') ||
        riskLower.contains('critical') ||
        riskLower.contains('failure') ||
        riskLower.contains('breach') ||
        riskLower.contains('compliance') ||
        riskLower.contains('legal')) {
      return 'high';
    }

    // Medium severity keywords
    if (riskLower.contains('performance') ||
        riskLower.contains('delay') ||
        riskLower.contains('budget') ||
        riskLower.contains('integration') ||
        riskLower.contains('compatibility') ||
        riskLower.contains('scalability') ||
        riskLower.contains('maintenance')) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  }

  Widget _buildRiskSeverityBadge(String severity) {
    Color color;
    String label;
    IconData icon;

    switch (severity) {
      case 'high':
        color = Colors.red;
        label = 'HIGH';
        icon = Icons.warning;
        break;
      case 'medium':
        color = Colors.orange;
        label = 'MEDIUM';
        icon = Icons.info;
        break;
      case 'low':
      default:
        color = Colors.blue;
        label = 'LOW';
        icon = Icons.info_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _getRiskSeverityDescription(String severity) {
    switch (severity) {
      case 'high':
        return 'Requires immediate attention and mitigation planning';
      case 'medium':
        return 'Should be monitored and addressed during development';
      case 'low':
      default:
        return 'Low impact, can be addressed as needed';
    }
  }
}

class _StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;

  _StickyTabBarDelegate({required this.child});

  @override
  double get minExtent => 70.0;

  @override
  double get maxExtent => 70.0;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return child;
  }

  @override
  bool shouldRebuild(_StickyTabBarDelegate oldDelegate) {
    return oldDelegate.child != child;
  }
}
