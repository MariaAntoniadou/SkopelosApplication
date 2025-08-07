import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base responsive functions using native Dimensions
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

// Get navigation bar height for Android
const getNavigationBarHeight = () => {
  if (Platform.OS === 'android') {
    const screenData = Dimensions.get('screen');
    const windowData = Dimensions.get('window');
    const navBarHeight = screenData.height - windowData.height - (StatusBar.currentHeight || 0);
    return navBarHeight > 0 ? navBarHeight : 0;
  }
  return 0;
};

// Check if device has software navigation bar
const hasSoftwareNavigationBar = () => {
  if (Platform.OS === 'android') {
    return getNavigationBarHeight() > 0;
  }
  return false;
};

// Responsive width
export const responsiveWidth = (percentage) => wp(percentage);

// Responsive height
export const responsiveHeight = (percentage) => hp(percentage);

// Responsive font size
export const responsiveFont = (size) => {
  const scale = SCREEN_WIDTH / 375; // Base width (iPhone X)
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  if (newSize < 12) return 12;
  if (newSize > 30) return 30;
  
  return Math.round(newSize);
};

// Device type detection
export const isTablet = () => SCREEN_WIDTH >= 768;
export const isSmallDevice = () => SCREEN_WIDTH < 375;
export const isLargeDevice = () => SCREEN_WIDTH > 414;

// Platform-specific safe area
export const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    // iPhone X and newer have larger status bar
    return SCREEN_HEIGHT >= 812 ? hp('5.4%') : hp('2.5%');
  }
  return StatusBar.currentHeight || hp('3%');
};

export const getBottomSafeArea = () => {
  if (Platform.OS === 'ios') {
    return SCREEN_HEIGHT >= 812 ? hp('4%') : 0;
  }
  // Android navigation bar handling - more conservative approach
  const navBarHeight = getNavigationBarHeight();
  if (hasSoftwareNavigationBar()) {
    return Math.max(navBarHeight, hp('2%'));
  }
  return hp('1%'); // Minimum padding for Android
};

// Get safe content height (excluding status bar and navigation bar)
export const getSafeContentHeight = () => {
  if (Platform.OS === 'android') {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const navBarHeight = getNavigationBarHeight();
    return SCREEN_HEIGHT - statusBarHeight - navBarHeight;
  }
  return SCREEN_HEIGHT;
};

// Platform-specific shadows
export const shadowStyle = (elevation = 4) => ({
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.1,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
  }),
});

// Responsive spacing
export const spacing = {
  tiny: hp('0.5%'),
  small: hp('1%'),
  medium: hp('2%'),
  large: hp('3%'),
  huge: hp('5%'),
};

// Export all responsive utilities
export { 
  getNavigationBarHeight, 
  hasSoftwareNavigationBar,
  // wp and hp are already exported above
};
