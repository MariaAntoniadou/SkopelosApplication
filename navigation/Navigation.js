import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/Home';
import IntroChapters from '../components/IntroChapters';
import IntroStoryboards from '../components/IntroStoryboards';
import { BlurView } from 'expo-blur';
import { TouchableOpacity, View } from 'react-native';
import MainChapters from '../components/MainChapters.js'; 
import AppTabs from '../components/AppTabs';
import StoryboardDetails from '../components/StoryboardDetails.js';
import StoryboardPoint from '../components/StoryboardPoint.js';
import TrailDetails from '../components/TrailDetails';
import Profile from '../components/Profile';
import Login from '../components/Login.js';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Register from '../components/Register.js';
import { useAuth } from '../context/AuthContext'; 
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher.js';
import Events from '../components/Events.js';
import { DEVICE_CONFIG } from '../config/responsive';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user } = useAuth(); 
  const { t } = useTranslation(); 

  const getResponsiveConfig = () => {
    const { screenWidth,  isAndroid, isIOS } = DEVICE_CONFIG;
    
    // Κατηγορίες συσκευών (iOS & Android)
    const isVerySmall = screenWidth < 350;     // iPhone SE, Android Go phones
    const isSmall = screenWidth < 375;         // iPhone SE 2020, Samsung A series small
    const isMedium = screenWidth < 414;        // iPhone 11, Pixel 4, Samsung S series
    const isLarge = screenWidth < 500;         // iPhone Pro Max, Pixel XL, Samsung Note
    const isTablet = screenWidth >= 500;       // iPad, Android tablets
    const isExtraLarge = screenWidth >= 768;   // iPad Pro, large Android tablets
    
    // Platform-specific adjustments
    const platformMultiplier = isAndroid ? 0.95 : 1; // Android fonts render slightly larger
    const androidOffset = isAndroid ? -1 : 0;
    
    return {
      // Header title sizes με platform correction
      headerTitleSize: Math.round((
        isVerySmall ? 16 : 
        isSmall ? 18 : 
        isMedium ? 20 : 
        isLarge ? 18 : 
        isExtraLarge ? 26 : 24
      ) * platformMultiplier) + androidOffset,
      
      // Main title (home screen) sizes
      mainTitleSize: Math.round((
        isVerySmall ? 18 : 
        isSmall ? 20 : 
        isMedium ? 22 : 
        isLarge ? 24 : 
        isExtraLarge ? 28 : 26
      ) * platformMultiplier) + androidOffset,
      
      // Icon sizes
      iconSize: isVerySmall ? 20 : 
                isSmall ? 22 : 
                isMedium ? 24 : 
                isLarge ? 26 : 
                isExtraLarge ? 32 : 28,
      
      // Container dimensions με Android padding compensation
      containerSize: (isVerySmall ? 24 : 
                     isSmall ? 26 : 
                     isMedium ? 28 : 
                     isLarge ? 30 : 
                     isExtraLarge ? 36 : 32) + (isAndroid ? 2 : 0),
      
      // Margins - Android needs more space
      marginRight: (isVerySmall ? 8 : 
                   isSmall ? 10 : 
                   isMedium ? 12 : 
                   isLarge ? 14 : 
                   isExtraLarge ? 20 : 16) + (isAndroid ? 2 : 0),
      
      // Border radius
      borderRadius: isVerySmall ? 12 : 
                   isSmall ? 13 : 
                   isMedium ? 14 : 
                   isLarge ? 15 : 
                   isExtraLarge ? 18 : 16,
      
      // Hit slop areas - Android needs larger touch targets
      hitSlop: (isVerySmall ? 8 : 
               isSmall ? 10 : 
               isMedium ? 12 : 
               isLarge ? 14 : 
               isExtraLarge ? 18 : 16) + (isAndroid ? 2 : 0),
      
      // Blur intensity - platform specific
      blurIntensity: isAndroid ? 
                    (isTablet ? 85 : 80) : 
                    (isTablet ? 70 : 60),
      
      // Platform specific blur tint
      blurTint: isAndroid ? 'dark' : 'light',
      
      // Screen info
      screenInfo: {
        isVerySmall,
        isSmall,
        isMedium,
        isLarge,
        isTablet,
        isExtraLarge,
        isAndroid,
        isIOS
      }
    };
  };

  const config = getResponsiveConfig();

  const getIconContainerStyle = () => ({
    marginRight: config.marginRight,
    height: config.containerSize,
    width: config.containerSize,
    borderRadius: config.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    // Android elevation για shadow effect
    ...(config.screenInfo.isAndroid && {
      elevation: 2,
      backgroundColor: 'rgba(255,255,255,0.1)'
    })
  });

  const getHitSlop = () => ({
    top: config.hitSlop,
    bottom: config.hitSlop,
    left: config.hitSlop,
    right: config.hitSlop,
  });

  // Platform-specific header styles
  const getHeaderTitleStyle = (fontSize) => ({
    fontWeight: 'bold',
    fontSize: fontSize,
    fontFamily: 'Inter-Variable',
    // Android specific text adjustments
    ...(config.screenInfo.isAndroid && {
      textAlignVertical: 'center',
      includeFontPadding: false,
    })
  });

  return (
    <>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ΣΚΟΠΕΛΟΣ"
        screenOptions={{
          headerTransparent: true, 
          headerTintColor: 'rgba(4, 57, 111, 1)',
          headerTitleAlign: 'center',
          headerTitleStyle: getHeaderTitleStyle(config.headerTitleSize),
          
        }}
      >
        <Stack.Screen
          name="ΣΚΟΠΕΛΟΣ"
          component={Home}
          options={({ navigation }) => ({
            headerTintColor: '#ffffffff',
            headerTitleStyle: {
              color: '#ffffffff',
              ...getHeaderTitleStyle(config.mainTitleSize)
            },
            headerTitle: t('skopelosTitle'),
            headerLeft: () => <LanguageSwitcher />,
            headerRight: () => (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                // Android specific container adjustments
                ...(config.screenInfo.isAndroid && {
                  paddingHorizontal: 4
                })
              }}>
                {user ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={getIconContainerStyle()}
                    hitSlop={getHitSlop()}
                    disabled={!user}
                    activeOpacity={0.7}
                  >
                    <FeatherIcon 
                      name="user" 
                      size={config.iconSize}
                      color="white" 
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={getIconContainerStyle()}
                    hitSlop={getHitSlop()}
                    activeOpacity={0.7}
                  >
                    <FeatherIcon 
                      name="log-in" 
                      size={config.iconSize}
                      color="white" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            ),
          })}
        />
        <Stack.Screen name="Tabs" component={AppTabs} />
        <Stack.Screen name="IntroChapters" component={IntroChapters} />
        <Stack.Screen name="IntroStoryboards" component={IntroStoryboards} />
        <Stack.Screen name="MainChapters" component={MainChapters} />
        <Stack.Screen name="StoryboardDetails" component={StoryboardDetails} />
        <Stack.Screen name="PointDetails" component={StoryboardPoint} />
        <Stack.Screen name="TrailDetails" component={TrailDetails} />
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{ 
            title: t('profile'),
            headerTitleStyle: getHeaderTitleStyle(config.headerTitleSize)
          }} 
        />
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ 
            title: t('login'),
            headerTitleStyle: getHeaderTitleStyle(config.headerTitleSize)
          }} 
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ 
            title: t('register'),
            headerTitleStyle: getHeaderTitleStyle(config.headerTitleSize)
          }} 
        />
        <Stack.Screen 
          name="Events" 
          component={Events} 
          options={{ 
            title: t('events'),
            headerTitleStyle: getHeaderTitleStyle(config.headerTitleSize)
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}