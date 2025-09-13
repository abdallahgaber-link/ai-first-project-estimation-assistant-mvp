import '../models/estimation_request.dart';

class SampleProjects {
  static const bool enableAutoLoad = false; // Feature flag for testing
  
  static final List<EstimationRequest> samples = [
    // Example 1 – E-Commerce App
    const EstimationRequest(
      projectTitle: 'Online Store App',
      description: 'Build a cross-platform mobile/web app for selling clothes with product catalog, shopping cart, checkout, and payment integration. Includes search, filters, push notifications for offers, and order tracking.',
      constraints: 'Frontend in Flutter.',
      platforms: ['web', 'mobile'],
      integrations: ['REST API', 'Authentication', 'Payment Gateway', 'Push Notifications'],
      nfrs: ['Scalability', 'Security', 'Accessibility', 'Offline Support', 'Multi-language Support'],
      languagesCount: 2,
      teamExperience: 'mid',
      qualityLevel: 'production',
      outputLanguage: 'en',
    ),
    
    // Example 2 – University Portal
    const EstimationRequest(
      projectTitle: 'Student Portal',
      description: 'University portal for students to view grades, register for courses, pay tuition online, and get announcements. Admins can manage users and course catalogs.',
      constraints: 'Must integrate with legacy student DB.',
      platforms: ['web'],
      integrations: ['REST API', 'Database', 'Authentication', 'Payment Gateway', 'Email Service'],
      nfrs: ['High Performance', 'Security', 'Accessibility'],
      languagesCount: 1,
      teamExperience: 'senior',
      qualityLevel: 'production',
      outputLanguage: 'en',
    ),
    
    // Example 3 – Healthcare Booking App
    const EstimationRequest(
      projectTitle: 'Clinic Booking App',
      description: 'App for patients to book appointments, view doctors\' profiles, and pay consultation fees online. Doctors can manage schedules and view patient history. Includes notifications and multi-language support.',
      constraints: 'Patient data must be encrypted (HIPAA compliance).',
      platforms: ['mobile'],
      integrations: ['REST API', 'Authentication', 'Payment Gateway', 'Push Notifications'],
      nfrs: ['Security', 'Accessibility', 'Multi-language Support'],
      languagesCount: 3,
      teamExperience: 'senior',
      qualityLevel: 'production',
      outputLanguage: 'en',
    ),
    
    // Example 4 – Logistics Tracking Platform
    const EstimationRequest(
      projectTitle: 'Shipment Tracker',
      description: 'Web + mobile app for shipment agents and customers to track packages, see live status, and receive notifications. Agents update shipment milestones, and customers view ETA.',
      constraints: 'Must support offline mode for field agents.',
      platforms: ['web', 'mobile'],
      integrations: ['REST API', 'Authentication', 'File Storage', 'Push Notifications'],
      nfrs: ['Real-time Updates', 'Offline Support', 'Security'],
      languagesCount: 2,
      teamExperience: 'mid',
      qualityLevel: 'production',
      outputLanguage: 'en',
    ),
    
    // Example 5 – Government Services App
    const EstimationRequest(
      projectTitle: 'City Services App',
      description: 'Citizen app to report issues (roads, lighting), pay utility bills, and request services. Includes map for service locations and notifications for request updates.',
      constraints: 'Backend microservices must be mocked.',
      platforms: ['mobile'],
      integrations: ['REST API', 'Authentication', 'Payment Gateway', 'File Storage', 'Push Notifications'],
      nfrs: ['Scalability', 'Accessibility', 'Security', 'Multi-language Support'],
      languagesCount: 2,
      teamExperience: 'mid',
      qualityLevel: 'production',
      outputLanguage: 'en',
    ),
  ];
  
  static EstimationRequest getRandomSample() {
    samples.shuffle();
    return samples.first;
  }
}
