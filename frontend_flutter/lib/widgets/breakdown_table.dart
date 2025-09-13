import 'package:flutter/material.dart';
import '../models/estimation_request.dart';

class BreakdownTable extends StatelessWidget {
  final EstimationBreakdown breakdown;
  final String filter;

  const BreakdownTable({
    super.key,
    required this.breakdown,
    required this.filter,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Item')),
          DataColumn(label: Text('Points'), numeric: true),
          DataColumn(label: Text('Weeks'), numeric: true),
          DataColumn(label: Text('Primary Role')),
        ],
        rows: _buildRows(breakdown, 0),
      ),
    );
  }

  List<DataRow> _buildRows(EstimationBreakdown item, int level) {
    final rows = <DataRow>[];
    
    // Add current item
    final indent = '  ' * level;
    final primaryRole = item.roles.isNotEmpty 
        ? item.roles.reduce((a, b) => a.effortWeeks > b.effortWeeks ? a : b).role
        : '';

    rows.add(DataRow(
      cells: [
        DataCell(Text('$indent${item.name}')),
        DataCell(Text(item.effortPoints.toStringAsFixed(0))),
        DataCell(Text(item.effortWeeks.toStringAsFixed(1))),
        DataCell(Text(primaryRole)),
      ],
    ));

    // Add children recursively
    for (final child in item.children) {
      rows.addAll(_buildRows(child, level + 1));
    }

    return rows;
  }
}
