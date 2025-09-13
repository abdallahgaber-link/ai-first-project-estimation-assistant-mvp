import 'package:json_annotation/json_annotation.dart';

part 'estimation_response.g.dart';

@JsonSerializable()
class WBSModule {
  final String name;
  final String complexity;
  final String notes;
  @JsonKey(name: 'primary_role')
  final String? primaryRole;

  const WBSModule({
    required this.name,
    required this.complexity,
    required this.notes,
    this.primaryRole,
  });

  factory WBSModule.fromJson(Map<String, dynamic> json) =>
      _$WBSModuleFromJson(json);

  Map<String, dynamic> toJson() => _$WBSModuleToJson(this);
}

@JsonSerializable()
class WBSEpic {
  final String name;
  final List<String> assumptions;
  final List<String> risks;
  final List<WBSModule> modules;

  const WBSEpic({
    required this.name,
    required this.assumptions,
    required this.risks,
    required this.modules,
  });

  factory WBSEpic.fromJson(Map<String, dynamic> json) =>
      _$WBSEpicFromJson(json);

  Map<String, dynamic> toJson() => _$WBSEpicToJson(this);
}

@JsonSerializable()
class WBS {
  final List<WBSEpic> epics;

  const WBS({
    required this.epics,
  });

  factory WBS.fromJson(Map<String, dynamic> json) => _$WBSFromJson(json);

  Map<String, dynamic> toJson() => _$WBSToJson(this);
}

@JsonSerializable()
class ModuleEstimate {
  final String name;
  final String complexity;
  final int basePoints;
  final Map<String, double> multipliers;
  final int totalPoints;
  final double weeks;
  final String role;
  final String notes;
  final String? complexityRationale;
  final List<String>? assumptions;
  final String? whyMatters;

  const ModuleEstimate({
    required this.name,
    required this.complexity,
    required this.basePoints,
    required this.multipliers,
    required this.totalPoints,
    required this.weeks,
    required this.role,
    required this.notes,
    this.complexityRationale,
    this.assumptions,
    this.whyMatters,
  });

  factory ModuleEstimate.fromJson(Map<String, dynamic> json) =>
      _$ModuleEstimateFromJson(json);

  Map<String, dynamic> toJson() => _$ModuleEstimateToJson(this);
}

@JsonSerializable()
class RoleEffortNew {
  final String role;
  final double effortWeeks;
  final double percentage;

  const RoleEffortNew({
    required this.role,
    required this.effortWeeks,
    required this.percentage,
  });

  factory RoleEffortNew.fromJson(Map<String, dynamic> json) =>
      _$RoleEffortNewFromJson(json);

  Map<String, dynamic> toJson() => _$RoleEffortNewToJson(this);
}

@JsonSerializable()
class ProjectTotals {
  final double developmentMDs;
  final double accessibilityMDs;
  final double externalApisMDs;
  final double appStorePublishingMDs;
  final double bugFixingMDs;
  final double totalMDs;

  const ProjectTotals({
    required this.developmentMDs,
    required this.accessibilityMDs,
    required this.externalApisMDs,
    required this.appStorePublishingMDs,
    required this.bugFixingMDs,
    required this.totalMDs,
  });

  factory ProjectTotals.fromJson(Map<String, dynamic> json) =>
      _$ProjectTotalsFromJson(json);

  Map<String, dynamic> toJson() => _$ProjectTotalsToJson(this);
}

@JsonSerializable()
class EstimationMeta {
  final String provider;
  final String model;
  final String sessionId;
  final int latencyMs;
  final int retryCount;
  final int inputTokens;
  final int outputTokens;
  final int totalTokens;
  final String timestamp;

  const EstimationMeta({
    required this.provider,
    required this.model,
    required this.sessionId,
    required this.latencyMs,
    required this.retryCount,
    required this.inputTokens,
    required this.outputTokens,
    required this.totalTokens,
    required this.timestamp,
  });

  factory EstimationMeta.fromJson(Map<String, dynamic> json) =>
      _$EstimationMetaFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationMetaToJson(this);
}

@JsonSerializable()
class EstimationResponse {
  final WBS wbs;
  final List<ModuleEstimate> modules;
  final List<RoleEffortNew> roles;
  final ProjectTotals totals;
  final double optimistic;
  final double mostLikely;
  final double pessimistic;
  final int velocity;
  final double bufferUsed;
  final List<String> assumptions;
  final List<String> risks;

  const EstimationResponse({
    required this.wbs,
    required this.modules,
    required this.roles,
    required this.totals,
    required this.optimistic,
    required this.mostLikely,
    required this.pessimistic,
    required this.velocity,
    required this.bufferUsed,
    required this.assumptions,
    required this.risks,
  });

  factory EstimationResponse.fromJson(Map<String, dynamic> json) =>
      _$EstimationResponseFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationResponseToJson(this);
}

@JsonSerializable()
class EstimationApiResponse {
  final bool success;
  final EstimationResponse data;
  final EstimationMeta meta;

  const EstimationApiResponse({
    required this.success,
    required this.data,
    required this.meta,
  });

  factory EstimationApiResponse.fromJson(Map<String, dynamic> json) =>
      _$EstimationApiResponseFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationApiResponseToJson(this);
}
