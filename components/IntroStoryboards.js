import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useRoute } from '@react-navigation/native';
import { getIntroductionChaptersDeep } from '../api/apiService';
import { UPLOADS_BASE_URL } from '../api/api.js';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { ScrollView } from 'react-native-gesture-handler';


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const cleanDescription = (text) => {
  if (!text) return '';
  return text
    .replace(/<\/?[^>]+(>|$)/g, '') 
    .replace(/[*_]/g, '')           
    .trim();
};


export default function IntroStoryboards() {
  const route = useRoute();
  const { storyboardId } = route.params;
  const navigation = useNavigation();
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { i18n } = useTranslation();
  

  useEffect(() => {
    async function fetchStoryboard() {
      try {
        const data = await getIntroductionChaptersDeep(i18n.language);
        let found = null;

        for (const chapter of data) {
          const storyboards = chapter.attributes?.storyboards?.data ?? [];
          const match = storyboards.find(sb => String(sb.id) === String(storyboardId));
          if (match) {
            found = match;
            navigation.setOptions({ title: match.attributes?.title || 'Storyboard' });
            break;
          }

        }

        setStoryboard(found);
      } catch (error) {
        console.error('Failed to fetch storyboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStoryboard();
  }, [storyboardId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#999" />
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (!storyboard) {
    return (
      <View style={styles.center}>
        <AppText>Storyboard not found.</AppText>
      </View>
    );
  }

  const slides = storyboard.attributes.slides?.data ?? [];
  
  const renderItem = ({ item }) => {
    const media = item.attributes.medias?.data?.[0];
    const thumbData = media?.attributes?.thumbnail?.data?.attributes;

    const smallUrl = thumbData?.formats?.small?.url || thumbData?.url || null;

    const imageUrl = smallUrl
      ? `${UPLOADS_BASE_URL}${smallUrl}`
      : media?.attributes?.url
      ? `${UPLOADS_BASE_URL}${media.attributes.url}`
      : null;

    return (
      <View style={styles.slideContainer}>
        <Text style={styles.slideTitle}>{item.attributes.title}</Text>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.slideImage}
            resizeMode="cover"
          />
        )}

        <ScrollView
          style={styles.descriptionScroll}
          contentContainerStyle={styles.descriptionScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Text style={styles.slideDescription}>
            {cleanDescription(item.attributes.description)}
          </Text>
        </ScrollView>
      </View>

    );
  };

  const Dots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            currentIndex === i ? styles.activeDot : null,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {slides.length > 0 ? (
        <>
          <Carousel
            width={screenWidth}
            height={650}
            data={slides}
            renderItem={renderItem}
            loop={false}
            onSnapToItem={setCurrentIndex}
          />
          <Dots />
          {slides.length > 1 
          }
        </>
      ) : (
        <Text style={{ marginTop: 20, fontStyle: 'italic' }}>No slides available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 100 : 100,
    
  },
  descriptionScroll: {
    maxHeight: 400, 
    marginTop: 10,
  },

descriptionScrollContent: {
  paddingBottom: 20,
},

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  slideContainer: {
    backgroundColor: '#EAF6FF',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    height: 650, 
  },

  slideTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  slideImage: {
    width: '100%',
    height: Platform.OS === 'android' ? 160 : 180,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  slideDescription: {
    fontSize: 14,
    color: '#444',
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingBottom: Platform.OS === 'android' ? 20 : 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#555',
  },
  swipeHint: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
