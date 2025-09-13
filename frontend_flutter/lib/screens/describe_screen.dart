import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../models/estimation_request.dart';
import '../services/api_service.dart';
import '../widgets/loading_overlay.dart';
import '../utils/responsive_utils.dart';
import '../data/sample_projects.dart';
import 'results_screen.dart';

class DescribeScreen extends HookConsumerWidget {
  const DescribeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Always log for debugging
    print('🚀 DescribeScreen build called');
    print('🎯 SampleProjects.enableAutoLoad: ${SampleProjects.enableAutoLoad}');
    
    final titleController = useTextEditingController();
    final descriptionController = useTextEditingController();
    final constraintsController = useTextEditingController();
    final isLoading = useState(false);
    final selectedPlatforms = useState<Set<String>>({'web'});
    final selectedIntegrations = useState<Set<String>>({});
    final selectedNfrs = useState<Set<String>>({});
    final languagesCount = useState(1);
    final teamExperience = useState('mid');
    final qualityLevel = useState('production');
    final outputLanguage = useState('en');

    // Function to load sample data manually
    void loadSampleData() {
      final sample = SampleProjects.getRandomSample();
      titleController.text = sample.projectTitle;
      descriptionController.text = sample.description;
      constraintsController.text = sample.constraints ?? '';
      selectedPlatforms.value = sample.platforms.toSet();
      selectedIntegrations.value = sample.integrations.toSet();
      selectedNfrs.value = sample.nfrs.toSet();
      languagesCount.value = sample.languagesCount;
      teamExperience.value = sample.teamExperience;
      qualityLevel.value = sample.qualityLevel;
      outputLanguage.value = sample.outputLanguage;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loaded sample: ${sample.projectTitle}')),
      );
    }

    final platforms = ['web', 'mobile', 'desktop'];
    final integrations = [
      'REST API',
      'GraphQL',
      'Database',
      'Authentication',
      'Payment Gateway',
      'File Storage',
      'Email Service',
      'Push Notifications'
    ];
    final nfrs = [
      'High Performance',
      'Scalability',
      'Security',
      'Accessibility',
      'SEO Optimization',
      'Offline Support',
      'Real-time Updates',
      'Multi-language Support'
    ];

    Future<void> generateEstimation() async {
      if (titleController.text.isEmpty || descriptionController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill in all required fields')),
        );
        return;
      }

      isLoading.value = true;
      try {
        final request = EstimationRequest(
          projectTitle: titleController.text,
          description: descriptionController.text,
          platforms: selectedPlatforms.value.toList(),
          integrations: selectedIntegrations.value.toList(),
          nfrs: selectedNfrs.value.toList(),
          languagesCount: languagesCount.value,
          teamExperience: teamExperience.value,
          qualityLevel: qualityLevel.value,
          constraints: constraintsController.text.isNotEmpty
              ? constraintsController.text
              : null,
          outputLanguage: outputLanguage.value,
        );

        final apiResponse = await ApiService.generateEstimation(request);

        if (context.mounted) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => ResultsScreen(
                estimation: apiResponse.data,
                meta: apiResponse.meta,
                projectTitle: titleController.text,
              ),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${e.toString()}')),
          );
        }
      } finally {
        isLoading.value = false;
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Project Estimation Assistant'),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.orange.shade400, Colors.orange.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.orange.withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: loadSampleData,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.science, color: Colors.white, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        'Sample',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        message: 'Analyzing your project requirements...',
        provider: 'AI Assistant',
        model: 'Multi-Provider LLM',
        child: SingleChildScrollView(
          padding: ResponsiveUtils.getResponsivePadding(context),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: ResponsiveUtils.getMaxContentWidth(context),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Project Description',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                          TextField(
                            controller: titleController,
                            textCapitalization: TextCapitalization.words,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Project Title *',
                              hintText: 'Enter your project title',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.title),
                            ),
                          ),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                          TextField(
                            controller: descriptionController,
                            maxLines: ResponsiveUtils.isMobile(context) ? 3 : 4,
                            textCapitalization: TextCapitalization.sentences,
                            textInputAction: TextInputAction.newline,
                            decoration: const InputDecoration(
                              labelText: 'Project Description *',
                              hintText: 'Describe your project requirements, features, and goals...',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.description),
                              alignLabelWithHint: true,
                            ),
                          ),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                          TextField(
                            controller: constraintsController,
                            maxLines: ResponsiveUtils.isMobile(context) ? 2 : 3,
                            textCapitalization: TextCapitalization.sentences,
                            textInputAction: TextInputAction.done,
                            decoration: const InputDecoration(
                              labelText: 'Constraints & Requirements',
                              hintText: 'Any specific constraints, deadlines, or technical requirements...',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.rule),
                              alignLabelWithHint: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                  Card(
                    child: Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Technical Requirements',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                          Text('Target Platforms',
                              style: Theme.of(context).textTheme.titleMedium),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context) / 2),
                          Wrap(
                            spacing: ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            runSpacing: ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            children: platforms.map((platform) {
                              return FilterChip(
                                label: Text(platform.toUpperCase()),
                                selected: selectedPlatforms.value.contains(platform),
                                onSelected: (selected) {
                                  final newSet = Set<String>.from(selectedPlatforms.value);
                                  if (selected) {
                                    newSet.add(platform);
                                  } else {
                                    newSet.remove(platform);
                                  }
                                  selectedPlatforms.value = newSet;
                                },
                              );
                            }).toList(),
                          ),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
                          Text('Integrations',
                              style: Theme.of(context).textTheme.titleMedium),
                          SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context) / 2),
                          Wrap(
                            spacing: ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            runSpacing: ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            children: integrations.map((integration) {
                              return FilterChip(
                                label: Text(integration, 
                                  style: TextStyle(
                                    fontSize: ResponsiveUtils.isMobile(context) ? 12 : 14
                                  )
                                ),
                                selected: selectedIntegrations.value.contains(integration),
                                onSelected: (selected) {
                                  final newSet = Set<String>.from(selectedIntegrations.value);
                                  if (selected) {
                                    newSet.add(integration);
                                  } else {
                                    newSet.remove(integration);
                                  }
                                  selectedIntegrations.value = newSet;
                                },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                      Text('Non-Functional Requirements',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: nfrs.map((nfr) {
                          return FilterChip(
                            label: Text(nfr),
                            selected: selectedNfrs.value.contains(nfr),
                            onSelected: (selected) {
                              final newSet =
                                  Set<String>.from(selectedNfrs.value);
                              if (selected) {
                                newSet.add(nfr);
                              } else {
                                newSet.remove(nfr);
                              }
                              selectedNfrs.value = newSet;
                            },
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Project Parameters',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                    'Languages/Technologies: ${languagesCount.value}'),
                                Slider(
                                  value: languagesCount.value.toDouble(),
                                  min: 1,
                                  max: 5,
                                  divisions: 4,
                                  onChanged: (value) {
                                    languagesCount.value = value.round();
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: teamExperience.value,
                        decoration:
                            const InputDecoration(labelText: 'Team Experience'),
                        items: const [
                          DropdownMenuItem(
                              value: 'junior', child: Text('Junior')),
                          DropdownMenuItem(
                              value: 'mid', child: Text('Mid-level')),
                          DropdownMenuItem(
                              value: 'senior', child: Text('Senior')),
                        ],
                        onChanged: (value) {
                          if (value != null) teamExperience.value = value;
                        },
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: qualityLevel.value,
                        decoration:
                            const InputDecoration(labelText: 'Quality Level'),
                        items: const [
                          DropdownMenuItem(value: 'mvp', child: Text('MVP')),
                          DropdownMenuItem(
                              value: 'production', child: Text('Production')),
                          DropdownMenuItem(
                              value: 'enterprise', child: Text('Enterprise')),
                        ],
                        onChanged: (value) {
                          if (value != null) qualityLevel.value = value;
                        },
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: outputLanguage.value,
                        decoration:
                            const InputDecoration(labelText: 'Output Language'),
                        items: const [
                          DropdownMenuItem(value: 'en', child: Text('English')),
                          DropdownMenuItem(value: 'ar', child: Text('العربية')),
                        ],
                        onChanged: (value) {
                          if (value != null) outputLanguage.value = value;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: ResponsiveUtils.getResponsiveSpacing(context)),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading.value ? null : generateEstimation,
                  child: const Text('Generate Estimation'),
                ),
              ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
