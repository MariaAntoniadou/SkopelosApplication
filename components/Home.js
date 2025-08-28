import { View, Text, ImageBackground, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, Alert } from 'react-native';
import { getIntroductionChaptersDeep, getAllMainChapters } from '../api/apiService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useWeather } from '../context/WeatherContext.js';
import Chatbot from './Chatbot.js';
import AppText from './AppText';
import CameraComponent from './Camera.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { DEVICE_CONFIG, RESPONSIVE_THEME } from '../config/responsive'; 

const iconMap = {
  'Προορισμοί': 'map-marked-alt',
  'Διαδρομές - Εκδρομές': 'hiking',
};

function getWeatherIconName(condition) {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('βροχή')) return 'cloud-rain';
  if (c.includes('cloud') || c.includes('συννεφιά')) return 'cloud';
  if (c.includes('sun') || c.includes('clear') || c.includes('ήλιος') || c.includes('καθαρός')) return 'sun';
  if (c.includes('snow') || c.includes('χιόνι')) return 'cloud-snow';
  if (c.includes('storm') || c.includes('καταιγίδα')) return 'cloud-lightning';
  return 'sun';
}

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function Home() {
  const [introSlides, setIntroSlides] = useState([]);
  const [mainChapters, setMainChapters] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(null);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const weather = useWeather();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getIntroductionChaptersDeep(i18n.language || 'el');
        setIntroSlides(data || []);
        const mainData = await getAllMainChapters(i18n.language || 'el');
        setMainChapters(mainData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }

    fetchData();
    checkCameraPermissionStatus();
  }, [i18n.language]);

  const checkCameraPermissionStatus = async () => {
    try {
      const permission = await AsyncStorage.getItem('cameraPermissionGranted');
      setCameraPermissionGranted(permission === 'true');
    } catch (error) {
      console.error('Error checking camera permission status:', error);
      setCameraPermissionGranted(false);
    }
  };

  const savePhotoToFirestore = async (photoUri) => {
    if (!user) {
      console.log('No user logged in, cannot save photo');
      return;
    }
    
    try {
      console.log('Saving photo for user:', user.uid);
      console.log('Photo URI:', photoUri);
      
      const photoData = {
        uri: photoUri,
        timestamp: new Date(),
        userId: user.uid
      };
      
      const photosCollection = collection(db, 'users', user.uid, 'photos');
      const docRef = await addDoc(photosCollection, photoData);
      
      console.log('Photo saved successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error saving photo to Firestore:', error);
    }
  };

  const handlePhotoTaken = async (photo) => {
    console.log('Photo taken:', photo.uri);
    setShowCamera(false);
    
    if (user) {
      console.log('User is logged in, saving photo...');
      await savePhotoToFirestore(photo.uri);
    } else {
      console.log('User not logged in, photo not saved');
    }
  };

  const openCamera = async () => {
    try {
      const storedPermission = await AsyncStorage.getItem('cameraPermissionGranted');
      
      if (storedPermission === 'true') {
        setShowCamera(true);
      } else {
        Alert.alert(
          t('cameraPermissionRequired'),
          t('cameraPermissionMessage'),
          [
            {
              text: t('cancel'),
              style: 'cancel'
            },
            {
              text: t('ok'),
              onPress: async () => {
                await AsyncStorage.setItem('cameraPermissionGranted','true');
                setCameraPermissionGranted(true);
                setShowCamera(true);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      Alert.alert(
        t('error'),
        t('cameraError')
      );
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraComponent
        onPhotoTaken={handlePhotoTaken}
        onClose={closeCamera}
      />
    );
  }

  return (
    <ImageBackground
      source={require('../assets/skopelos5.jpg')}
      style={styles.imageBackground}
      imageStyle={{ opacity: 0.6 }}
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.content}>
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={openCamera}
        >
          <FontAwesome5Icon
            name="camera"
            size={DEVICE_CONFIG.isTablet ? 28 : DEVICE_CONFIG.isSmallPhone ? 20 : 24}
            color="white"
          />
        </TouchableOpacity>

        <View style={styles.weatherTextContainer}>
          {weather?.current ? (
            <View style={styles.weatherContent}>
              <View style={styles.weatherIconContainer}>
                <FeatherIcon
                  name={getWeatherIconName(weather.current.condition.text)}
                  size={DEVICE_CONFIG.isTablet ? 28 : DEVICE_CONFIG.isSmallPhone ? 20 : 24}
                  color="#FFD700"
                />
              </View>
              <Text style={styles.temperatureText}>
                {Math.round(weather.current.temp_c)}°C
              </Text>
            </View>
          ) : (
            <Text style={styles.loadingText}>Φόρτωση καιρού...</Text>
          )}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {introSlides.map((slide, index) => {
            let imageUrl = slide.attributes?.thumbnail?.data?.attributes?.formats?.small?.url;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = 'https://skopelos-admin.inculture.app' + imageUrl;
            }

            return (
              <TouchableOpacity
                key={index}
                style={styles.slideButton}
                onPress={() => navigation.navigate('IntroChapters', { chapterId: slide.id })}
              >
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                )}
                <AppText style={styles.slideText}>
                  {removeAccents((slide.attributes?.title || t('noTitle', 'No title')))}
                </AppText>
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity
            style={styles.eventsButton}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.eventsButtonText}>
              {t('events')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomNav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomNavContent}
        >
          {mainChapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              style={styles.navButton}
              onPress={() => navigation.navigate('MainChapters', { id: chapter.id })}
            >
              <View style={styles.navButtonInner}>
                <FontAwesome5Icon
                  name={iconMap[chapter.attributes.title]}
                  size={DEVICE_CONFIG.isTablet ? 24 : DEVICE_CONFIG.isSmallPhone ? 16 : 20}
                  color='rgba(4, 57, 111, 0.81)'
                  solid
                  style={styles.navIcon}
                />
                <AppText style={styles.navButtonText}>
                  {chapter.attributes.title}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Chatbot />
    </ImageBackground>
  );
}

// 📱 RESPONSIVE STYLES
const styles = StyleSheet.create({
  imageBackground: { 
    flex: 1 
  },
  overlay: { 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    ...StyleSheet.absoluteFill 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: DEVICE_CONFIG.isTablet ? 30 : DEVICE_CONFIG.isSmallPhone ? 16 : 20,
    paddingTop: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 20 : 15) : 
      (DEVICE_CONFIG.isTablet ? 25 : 20),
    paddingBottom: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 90 : 80) : 
      (DEVICE_CONFIG.isTablet ? 140 : 130),
  },
  cameraButton: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 130 : 120) : 
      (DEVICE_CONFIG.isTablet ? 130 : 120),
    left: DEVICE_CONFIG.isTablet ? 30 : DEVICE_CONFIG.isSmallPhone ? 16 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: DEVICE_CONFIG.isTablet ? 30 : DEVICE_CONFIG.isSmallPhone ? 22 : 25,
    width: DEVICE_CONFIG.isTablet ? 60 : DEVICE_CONFIG.isSmallPhone ? 44 : 50,
    height: DEVICE_CONFIG.isTablet ? 60 : DEVICE_CONFIG.isSmallPhone ? 44 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  
  weatherTextContainer: {
    marginTop: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 15 : 10) : 
      (DEVICE_CONFIG.isTablet ? 20 : 15),
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 10 : 12,
    paddingVertical: DEVICE_CONFIG.isTablet ? 12 : DEVICE_CONFIG.isSmallPhone ? 6 : 8,
    paddingHorizontal: DEVICE_CONFIG.isTablet ? 20 : DEVICE_CONFIG.isSmallPhone ? 12 : 15,
    alignSelf: 'flex-start',
    elevation: Platform.OS === 'android' ? 80 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 3 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 6 : undefined,
    marginLeft: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 8 : 12,
    marginBottom: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 110 : 100) : 0,
    top: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 100 : 90) : 0,
  },
  weatherContent: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  weatherIconContainer: {
    marginRight: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 8 : 12,
  },
  temperatureText: {
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.xxlarge : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.medium : 
        RESPONSIVE_THEME.fontSizes.xlarge,
    fontWeight: '500',
    color: 'white',
    fontFamily: 'Inter-Variable'
  },
  loadingText: {
    color: 'white',
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.large : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.small : 
        RESPONSIVE_THEME.fontSizes.medium,
    fontStyle: 'italic',
    fontFamily: 'Inter-Variable'
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 8 : 5) : 
      (DEVICE_CONFIG.isTablet ? 15 : 10),
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 25 : 20) : 
      (DEVICE_CONFIG.isTablet ? 20 : 15),
  },
  slideButton: {
    marginVertical: DEVICE_CONFIG.isTablet ? 15 : DEVICE_CONFIG.isSmallPhone ? 8 : 10,
    padding: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 10 : 12,
    borderRadius: DEVICE_CONFIG.isTablet ? 28 : DEVICE_CONFIG.isSmallPhone ? 18 : 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginHorizontal: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 8 : 12,
    marginBottom: DEVICE_CONFIG.isTablet ? 30 : DEVICE_CONFIG.isSmallPhone ? 20 : 25,
  },
  slideImage: {
    width: '100%',
    height: DEVICE_CONFIG.isTablet ? 200 : DEVICE_CONFIG.isSmallPhone ? 120 : 150,
    borderRadius: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 10 : 12,
    marginBottom: DEVICE_CONFIG.isTablet ? 20 : DEVICE_CONFIG.isSmallPhone ? 12 : 15,
  },
  slideText: {
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.large : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.small : 
        RESPONSIVE_THEME.fontSizes.medium,
    fontFamily: 'Inter-Variable',
    textAlign: 'center',
    paddingHorizontal: DEVICE_CONFIG.isTablet ? 12 : DEVICE_CONFIG.isSmallPhone ? 6 : 8,
  },
  eventsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: DEVICE_CONFIG.isTablet ? 15 : DEVICE_CONFIG.isSmallPhone ? 8 : 10,
    borderRadius: DEVICE_CONFIG.isTablet ? 25 : DEVICE_CONFIG.isSmallPhone ? 16 : 20,
    marginVertical: DEVICE_CONFIG.isTablet ? 30 : DEVICE_CONFIG.isSmallPhone ? 20 : 25,
    alignSelf: 'center',
    minWidth: DEVICE_CONFIG.isTablet ? 200 : DEVICE_CONFIG.isSmallPhone ? 120 : 150,
  },
  eventsButtonText: {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.xlarge : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.medium : 
        RESPONSIVE_THEME.fontSizes.large,
    fontFamily: 'Inter-Variable',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 120 : 110) : 
      (DEVICE_CONFIG.isTablet ? 120 : 110),
    backgroundColor: 'rgba(81, 157, 233, 0.73)',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(4, 57, 111, 0.81)',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 8 : undefined,
    paddingHorizontal: DEVICE_CONFIG.isTablet ? 12 : DEVICE_CONFIG.isSmallPhone ? 6 : 8,
    paddingBottom: Platform.OS === 'android' ? 
      (DEVICE_CONFIG.isTablet ? 12 : 8) : 
      (DEVICE_CONFIG.isTablet ? 38 : 34),
  },
  bottomNavContent: {
    justifyContent: 'center', 
    alignItems: 'center', 
    flexGrow: 1,
    paddingHorizontal: DEVICE_CONFIG.isTablet ? 12 : DEVICE_CONFIG.isSmallPhone ? 6 : 8,
  },
  navButton: {
    marginHorizontal: DEVICE_CONFIG.isTablet ? 20 : DEVICE_CONFIG.isSmallPhone ? 10 : 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: DEVICE_CONFIG.isTablet ? 90 : DEVICE_CONFIG.isSmallPhone ? 60 : 70,
  },
  navButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    marginBottom: DEVICE_CONFIG.isTablet ? 6 : DEVICE_CONFIG.isSmallPhone ? 3 : 4,
  },
  navButtonText: {
    color: 'rgba(4, 57, 111, 0.81)',
    fontWeight: '600',
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.medium : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.tiny : 
        RESPONSIVE_THEME.fontSizes.small,
    textAlign: 'center',
    maxWidth: DEVICE_CONFIG.isTablet ? 100 : DEVICE_CONFIG.isSmallPhone ? 70 : 80,
    fontFamily: 'Inter-Variable',
    lineHeight: DEVICE_CONFIG.isTablet ? 16 : DEVICE_CONFIG.isSmallPhone ? 12 : 13,
  },
  titleText: { 
    color: 'white', 
    fontSize: DEVICE_CONFIG.isTablet ? 
      RESPONSIVE_THEME.fontSizes.huge : 
      DEVICE_CONFIG.isSmallPhone ? 
        RESPONSIVE_THEME.fontSizes.xlarge : 
        RESPONSIVE_THEME.fontSizes.xxlarge,
    textAlign: 'center', 
    marginBottom: DEVICE_CONFIG.isTablet ? 20 : DEVICE_CONFIG.isSmallPhone ? 12 : 15,
    fontFamily: 'Inter-Variable'
  },
  iconCircle: {
    backgroundColor: '#e3f0ff',
    borderRadius: DEVICE_CONFIG.isTablet ? 32 : DEVICE_CONFIG.isSmallPhone ? 24 : 28,
    width: DEVICE_CONFIG.isTablet ? 64 : DEVICE_CONFIG.isSmallPhone ? 48 : 56,
    height: DEVICE_CONFIG.isTablet ? 64 : DEVICE_CONFIG.isSmallPhone ? 48 : 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DEVICE_CONFIG.isTablet ? 6 : DEVICE_CONFIG.isSmallPhone ? 3 : 4,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(4, 57, 111, 0.81)',
  },
});