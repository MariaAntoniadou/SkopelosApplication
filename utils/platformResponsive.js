import { Platform, StatusBar, Dimensions } from 'react-native';
import { wp, hp, getSafeContentHeight, getBottomSafeArea } from './responsive';

const { width, height } = Dimensions.get('window');
const screenData = Dimensions.get('screen');

// Get Android navigation bar height
const getAndroidNavBarHeight = () => {
  if (Platform.OS === 'android') {
    return screenData.height - height - (StatusBar.currentHeight || 0);
  }
  return 0;
};

// Platform-specific responsive adjustments
export const platformResponsive = {
  // Weather widget positioning
  weatherContainer: {
    marginTop: Platform.OS === 'android' 
      ? (StatusBar.currentHeight || 0) + hp('1%')
      : hp('2%'),
    marginLeft: Platform.OS === 'android' ? wp('5%') : wp('3%'),
  },
  
  // Content padding with navigation bar consideration
  contentPadding: {
    paddingTop: Platform.OS === 'android' ? wp('1%') : hp('2%'),
    paddingBottom: Platform.OS === 'android' 
      ? getAndroidNavBarHeight() + hp('2%')  // Add space for Android nav bar
      : getBottomSafeArea(),
  },
  
  // Bottom navigation with proper spacing
  bottomNav: {
    height: Platform.OS === 'android' 
      ? hp('11%') 
      : hp('13%'), // iOS needs more space
    paddingBottom: Platform.OS === 'android' 
      ? Math.max(getAndroidNavBarHeight(), hp('1%'))  // Ensure minimum padding
      : getBottomSafeArea(),
    marginBottom: Platform.OS === 'android' 
      ? getAndroidNavBarHeight() 
      : 0,
  },
  
  // Safe area adjustments
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: Platform.OS === 'android' ? getAndroidNavBarHeight() : 0,
  },
  
  // Status bar handling
  statusBarSpace: Platform.OS === 'android' 
    ? (StatusBar.currentHeight || 0) 
    : 0,
    
  // Navigation bar space
  navBarSpace: getAndroidNavBarHeight(),
    
  // Font adjustments
  fontSize: {
    title: Platform.OS === 'android' ? wp('6%') : wp('5.5%'),
    body: Platform.OS === 'android' ? wp('4%') : wp('3.8%'),
    small: Platform.OS === 'android' ? wp('3.2%') : wp('3%'),
  },
  
  // Spacing adjustments
  spacing: {
    small: Platform.OS === 'android' ? wp('2%') : wp('1.5%'),
    medium: Platform.OS === 'android' ? wp('4%') : wp('3%'),
    large: Platform.OS === 'android' ? wp('6%') : wp('5%'),
  },
  
  // Shadow adjustments
  shadow: Platform.OS === 'android' 
    ? { elevation: 6 }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
};

// Device type detection with platform consideration
export const deviceType = {
  isAndroidTablet: Platform.OS === 'android' && width >= 768,
  isIOSTablet: Platform.OS === 'ios' && width >= 768,
  isAndroidPhone: Platform.OS === 'android' && width < 768,
  isIOSPhone: Platform.OS === 'ios' && width < 768,
  
  // Screen size categories
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 414,
  isLargeScreen: width >= 414,
  
  // Navigation bar detection
  hasAndroidNavBar: getAndroidNavBarHeight() > 0,
};

// Layout helpers
export const layoutHelpers = {
  // Get appropriate margin for weather widget
  getWeatherMargin: () => ({
    marginTop: platformResponsive.weatherContainer.marginTop,
    marginLeft: platformResponsive.weatherContainer.marginLeft,
  }),
  
  // Get content container style with proper bottom spacing
  getContentStyle: () => ({
    flex: 1,
    paddingHorizontal: wp('5%'),
    ...platformResponsive.contentPadding,
  }),
  
  // Get safe area style for Android
  getSafeAreaStyle: () => ({
    ...platformResponsive.safeArea,
  }),
  
  // Get bottom nav style with navigation bar consideration
  getBottomNavStyle: () => ({
    ...platformResponsive.bottomNav,
    backgroundColor: 'rgba(81, 157, 233, 0.73)',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(4, 57, 111, 0.81)',
    ...platformResponsive.shadow,
    paddingHorizontal: wp('2%'),
    position: Platform.OS === 'android' ? 'absolute' : 'relative',
    bottom: Platform.OS === 'android' ? getAndroidNavBarHeight() : 0,
    left: 0,
    right: 0,
  }),
  
  // Get scroll view style with proper content inset
  getScrollViewStyle: () => ({
    flex: 1,
    marginTop: Platform.OS === 'android' ? wp('3%') : hp('3%'),
    paddingBottom: Platform.OS === 'android' 
      ? hp('15%') + getAndroidNavBarHeight()  // Extra space for bottom nav + Android nav bar
      : hp('13%'),  // Space for bottom nav on iOS
  }),
};

export default platformResponsive;
