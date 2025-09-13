import 'package:flutter/material.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ResponsiveUtils {
  static bool isMobile(BuildContext context) {
    return ResponsiveBreakpoints.of(context).isMobile;
  }

  static bool isTablet(BuildContext context) {
    return ResponsiveBreakpoints.of(context).isTablet;
  }

  static bool isDesktop(BuildContext context) {
    return ResponsiveBreakpoints.of(context).isDesktop;
  }

  static bool isSmallScreen(BuildContext context) {
    return ResponsiveBreakpoints.of(context).smallerThan(TABLET);
  }

  static double getScreenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double getScreenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  // Responsive padding
  static EdgeInsets getResponsivePadding(BuildContext context) {
    if (isMobile(context)) {
      return EdgeInsets.all(16.w);
    } else if (isTablet(context)) {
      return EdgeInsets.all(24.w);
    } else {
      return EdgeInsets.all(32.w);
    }
  }

  // Responsive spacing
  static double getResponsiveSpacing(BuildContext context) {
    if (isMobile(context)) {
      return 12.h;
    } else if (isTablet(context)) {
      return 16.h;
    } else {
      return 20.h;
    }
  }

  // Responsive font sizes
  static double getResponsiveFontSize(BuildContext context, double baseSize) {
    if (isMobile(context)) {
      return baseSize.sp;
    } else if (isTablet(context)) {
      return (baseSize * 1.1).sp;
    } else {
      return (baseSize * 1.2).sp;
    }
  }

  // Grid columns based on screen size
  static int getGridColumns(BuildContext context) {
    if (isMobile(context)) {
      return 1;
    } else if (isTablet(context)) {
      return 2;
    } else {
      return 3;
    }
  }

  // Card width for forms
  static double getCardWidth(BuildContext context) {
    final screenWidth = getScreenWidth(context);
    if (isMobile(context)) {
      return screenWidth - 32.w;
    } else if (isTablet(context)) {
      return screenWidth * 0.8;
    } else {
      return 600.w;
    }
  }

  // Maximum content width
  static double getMaxContentWidth(BuildContext context) {
    if (isDesktop(context)) {
      return 1200.w;
    }
    return double.infinity;
  }
}
