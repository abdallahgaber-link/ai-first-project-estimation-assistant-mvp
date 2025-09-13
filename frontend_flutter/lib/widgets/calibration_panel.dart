import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import '../models/estimation_response.dart';

class CalibrationPanel extends HookWidget {
  final EstimationResponse originalEstimation;
  final Function(EstimationResponse) onEstimationChanged;

  const CalibrationPanel({
    super.key,
    required this.originalEstimation,
    required this.onEstimationChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Calibration parameters
    final velocity = useState<double>(originalEstimation.velocity.toDouble());
    final bufferMultiplier = useState<double>(1.0 + originalEstimation.bufferUsed);
    final complexityMultiplier = useState<double>(1.0);
    final teamEfficiencyMultiplier = useState<double>(1.0);

    // Recalculate estimation when parameters change
    void recalculateEstimation() {
      final newEstimation = _applyCalibration(
        originalEstimation,
        velocity.value,
        bufferMultiplier.value,
        complexityMultiplier.value,
        teamEfficiencyMultiplier.value,
      );
      onEstimationChanged(newEstimation);
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.tune, color: Theme.of(context).primaryColor),
                const SizedBox(width: 8),
                const Text(
                  'Calibration Panel',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () {
                    velocity.value = originalEstimation.velocity.toDouble();
                    bufferMultiplier.value = 1.0 + originalEstimation.bufferUsed;
                    complexityMultiplier.value = 1.0;
                    teamEfficiencyMultiplier.value = 1.0;
                    onEstimationChanged(originalEstimation);
                  },
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Reset'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Adjust parameters to fine-tune the estimation based on your team and project specifics.',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 24),

            // Team Velocity Slider
            _buildSlider(
              'Team Velocity',
              '${velocity.value.toStringAsFixed(1)} points/week',
              velocity.value,
              5.0,
              50.0,
              (value) {
                velocity.value = value;
                recalculateEstimation();
              },
              'How many story points your team completes per week',
              Icons.speed,
              Colors.teal,
            ),

            const SizedBox(height: 24),

            // Buffer Multiplier Slider
            _buildSlider(
              'Buffer Multiplier',
              '${((bufferMultiplier.value - 1) * 100).toStringAsFixed(0)}% buffer',
              bufferMultiplier.value,
              1.0,
              2.0,
              (value) {
                bufferMultiplier.value = value;
                recalculateEstimation();
              },
              'Additional time buffer for unexpected issues and scope changes',
              Icons.security,
              Colors.orange,
            ),

            const SizedBox(height: 24),

            // Complexity Multiplier Slider
            _buildSlider(
              'Complexity Adjustment',
              '${((complexityMultiplier.value - 1) * 100).toStringAsFixed(0)}% ${complexityMultiplier.value >= 1 ? 'increase' : 'decrease'}',
              complexityMultiplier.value,
              0.5,
              2.0,
              (value) {
                complexityMultiplier.value = value;
                recalculateEstimation();
              },
              'Adjust based on project complexity relative to typical projects',
              Icons.psychology,
              Colors.purple,
            ),

            const SizedBox(height: 24),

            // Team Efficiency Multiplier Slider
            _buildSlider(
              'Team Efficiency',
              '${((teamEfficiencyMultiplier.value - 1) * 100).toStringAsFixed(0)}% ${teamEfficiencyMultiplier.value >= 1 ? 'boost' : 'reduction'}',
              teamEfficiencyMultiplier.value,
              0.5,
              1.5,
              (value) {
                teamEfficiencyMultiplier.value = value;
                recalculateEstimation();
              },
              'Adjust based on team experience and collaboration efficiency',
              Icons.group,
              Colors.blue,
            ),

            const SizedBox(height: 24),

            // Impact Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Calibration Impact',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('Original Estimate: '),
                      Text(
                        '${originalEstimation.mostLikely.toStringAsFixed(1)} weeks',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text('Calibrated Estimate: '),
                      Text(
                        '${_calculateCalibratedEstimate(originalEstimation, velocity.value, bufferMultiplier.value, complexityMultiplier.value, teamEfficiencyMultiplier.value).toStringAsFixed(1)} weeks',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(
    String title,
    String value,
    double currentValue,
    double min,
    double max,
    Function(double) onChanged,
    String description,
    IconData icon,
    Color color,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: color,
            thumbColor: color,
            overlayColor: color.withOpacity(0.2),
            inactiveTrackColor: color.withOpacity(0.3),
          ),
          child: Slider(
            value: currentValue,
            min: min,
            max: max,
            divisions: ((max - min) * 10).round(),
            onChanged: onChanged,
          ),
        ),
        Text(
          description,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  double _calculateCalibratedEstimate(
    EstimationResponse estimation,
    double velocity,
    double bufferMultiplier,
    double complexityMultiplier,
    double teamEfficiencyMultiplier,
  ) {
    // Apply calibration to the most likely estimate
    double calibratedEstimate = estimation.mostLikely;
    
    // Adjust for velocity change
    final velocityRatio = estimation.velocity / velocity;
    calibratedEstimate *= velocityRatio;
    
    // Apply buffer multiplier
    calibratedEstimate *= bufferMultiplier;
    
    // Apply complexity multiplier
    calibratedEstimate *= complexityMultiplier;
    
    // Apply team efficiency multiplier (inverse - higher efficiency = less time)
    calibratedEstimate /= teamEfficiencyMultiplier;
    
    return calibratedEstimate;
  }

  EstimationResponse _applyCalibration(
    EstimationResponse original,
    double velocity,
    double bufferMultiplier,
    double complexityMultiplier,
    double teamEfficiencyMultiplier,
  ) {
    final velocityRatio = original.velocity / velocity;
    final totalMultiplier = velocityRatio * bufferMultiplier * complexityMultiplier / teamEfficiencyMultiplier;
    
    // Apply calibration to all time estimates
    final calibratedOptimistic = original.optimistic * totalMultiplier;
    final calibratedMostLikely = original.mostLikely * totalMultiplier;
    final calibratedPessimistic = original.pessimistic * totalMultiplier;
    
    // Apply calibration to modules
    final calibratedModules = original.modules.map((module) {
      return ModuleEstimate(
        name: module.name,
        complexity: module.complexity,
        basePoints: module.basePoints,
        multipliers: module.multipliers,
        totalPoints: module.totalPoints,
        weeks: module.weeks * totalMultiplier,
        role: module.role,
        notes: module.notes,
        complexityRationale: module.complexityRationale,
        assumptions: module.assumptions,
        whyMatters: module.whyMatters,
      );
    }).toList();
    
    // Apply calibration to roles
    final calibratedRoles = original.roles.map((role) {
      return RoleEffortNew(
        role: role.role,
        effortWeeks: role.effortWeeks * totalMultiplier,
        percentage: role.percentage, // Percentage stays the same
      );
    }).toList();
    
    // Apply calibration to totals
    final calibratedTotals = ProjectTotals(
      developmentMDs: original.totals.developmentMDs * totalMultiplier,
      accessibilityMDs: original.totals.accessibilityMDs * totalMultiplier,
      externalApisMDs: original.totals.externalApisMDs * totalMultiplier,
      appStorePublishingMDs: original.totals.appStorePublishingMDs * totalMultiplier,
      bugFixingMDs: original.totals.bugFixingMDs * totalMultiplier,
      totalMDs: original.totals.totalMDs * totalMultiplier,
    );
    
    return EstimationResponse(
      modules: calibratedModules,
      roles: calibratedRoles,
      wbs: original.wbs, // WBS structure remains the same
      totals: calibratedTotals,
      optimistic: calibratedOptimistic,
      mostLikely: calibratedMostLikely,
      pessimistic: calibratedPessimistic,
      velocity: velocity.round(), // Use the new velocity
      bufferUsed: bufferMultiplier - 1.0, // Convert back to buffer percentage
      assumptions: original.assumptions,
      risks: original.risks,
    );
  }
}
