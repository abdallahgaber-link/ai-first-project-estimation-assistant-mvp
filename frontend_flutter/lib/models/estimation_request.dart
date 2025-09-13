import 'package:json_annotation/json_annotation.dart';

part 'estimation_request.g.dart';

@JsonSerializable()
class EstimationRequest {
  final String projectTitle;
  final String description;
  final List<String> platforms;
  final List<String> integrations;
  final List<String> nfrs;
  final int languagesCount;
  final String teamExperience;
  final String qualityLevel;
  final String? constraints;
  final String outputLanguage;

  const EstimationRequest({
    required this.projectTitle,
    required this.description,
    required this.platforms,
    this.integrations = const [],
    this.nfrs = const [],
    this.languagesCount = 1,
    this.teamExperience = 'mid',
    this.qualityLevel = 'production',
    this.constraints,
    this.outputLanguage = 'en',
  });

  factory EstimationRequest.fromJson(Map<String, dynamic> json) =>
      _$EstimationRequestFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationRequestToJson(this);
}

@JsonSerializable()
class RoleEffort {
  final String role;
  final double effortWeeks;
  final double percentage;
  final String? description;

  const RoleEffort({
    required this.role,
    required this.effortWeeks,
    required this.percentage,
    this.description,
  });

  factory RoleEffort.fromJson(Map<String, dynamic> json) =>
      _$RoleEffortFromJson(json);

  Map<String, dynamic> toJson() => _$RoleEffortToJson(this);
}

@JsonSerializable()
class EstimationBreakdown {
  final String id;
  final String name;
  final double effortPoints;
  final double effortWeeks;
  final List<RoleEffort> roles;
  final List<EstimationBreakdown> children;

  const EstimationBreakdown({
    required this.id,
    required this.name,
    required this.effortPoints,
    required this.effortWeeks,
    required this.roles,
    this.children = const [],
  });

  factory EstimationBreakdown.fromJson(Map<String, dynamic> json) =>
      _$EstimationBreakdownFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationBreakdownToJson(this);
}

@JsonSerializable()
class Risk {
  final String description;
  final String impact;
  final String? probability;
  final String? mitigation;

  const Risk({
    required this.description,
    required this.impact,
    this.probability,
    this.mitigation,
  });

  factory Risk.fromJson(Map<String, dynamic> json) => _$RiskFromJson(json);

  Map<String, dynamic> toJson() => _$RiskToJson(this);
}

@JsonSerializable()
class Estimation {
  final String projectId;
  final String projectName;
  final String createdAt;
  final String updatedAt;
  final double totalEffortPoints;
  final double teamVelocity;
  final double sprintLengthWeeks;
  final double bufferPercent;
  final double optimisticWeeks;
  final double mostLikelyWeeks;
  final double pessimisticWeeks;
  final List<RoleEffort> roles;
  final EstimationBreakdown breakdown;
  final List<String> assumptions;
  final List<Risk> risks;
  final Map<String, dynamic> configuration;

  const Estimation({
    required this.projectId,
    required this.projectName,
    required this.createdAt,
    required this.updatedAt,
    required this.totalEffortPoints,
    required this.teamVelocity,
    required this.sprintLengthWeeks,
    required this.bufferPercent,
    required this.optimisticWeeks,
    required this.mostLikelyWeeks,
    required this.pessimisticWeeks,
    required this.roles,
    required this.breakdown,
    this.assumptions = const [],
    this.risks = const [],
    this.configuration = const {},
  });

  factory Estimation.fromJson(Map<String, dynamic> json) =>
      _$EstimationFromJson(json);

  Map<String, dynamic> toJson() => _$EstimationToJson(this);
}
