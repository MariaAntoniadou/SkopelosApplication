// Responsive Configuration for SkopelosApp
// This file contains device-specific configurations

import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DEVICE_CONFIG = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Device types
  isTablet: width >= 768,
  isSmallPhone: width < 375,
  isLargePhone: width > 414,
  
  // Platform
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // Safe areas (for devices with notches)
  hasNotch: Platform.OS === 'ios' && height >= 812,
  
  // Responsive breakpoints
  breakpoints: {
    small: 375,
    medium: 414,
    large: 768,
    xlarge: 1024,
  }
};


export const RESPONSIVE_THEME = {
  
  fontSizes: {
    tiny: 10,
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
    huge: 24,
  },
  
  spacing: {
    tiny: '0.5%',
    small: '1%',
    medium: '2%',
    large: '3%',
    xlarge: '4%',
    huge: '5%',
  },
  
  
  components: {
    button: {
      height: DEVICE_CONFIG.isTablet ? '6%' : '7%',
      borderRadius: '3%',
      padding: '4%',
    },
    input: {
      height: DEVICE_CONFIG.isTablet ? '6%' : '7%',
      borderRadius: '2%',
      padding: '3%',
    },
    card: {
      borderRadius: '4%',
      padding: '5%',
      margin: '2%',
    },
    bottomNav: {
      height: DEVICE_CONFIG.isTablet ? '12%' : '11%',
    }
  }
};

export default { DEVICE_CONFIG, RESPONSIVE_THEME };
