import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAllMainChapters } from '../api/apiService';
import { UPLOADS_BASE_URL } from '../api/api';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';

const screenWidth = Dimensions.get('window').width;

export default function MainChapters() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  useEffect(() => {
    async function fetchChapter() {
      try {
        const allChapters = await getAllMainChapters(locale);
        const found = allChapters.find((ch) => ch.id === Number(id));
        setChapter(found || null);

        // Set the top bar title if chapter is found
        if (found) {
          navigation.setOptions({ title: found.attributes.title });
        }
      } catch (error) {
        console.error('Error fetching main chapters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapter();
  }, [id, locale, navigation]);

  const storyboards = chapter?.attributes?.mainStoryboards?.data || [];

  const renderStoryboardRows = () => {
    const rows = [];
    for (let i = 0; i < storyboards.length; i += 2) {
      rows.push(storyboards.slice(i, i + 2));
    }

    return rows.map((row, index) => (
      <View key={index} style={styles.storyboardRow}>
        {row.map((storyboard) => {
          const imageFormats = storyboard.attributes.thumbnail?.data?.attributes?.formats;
          const highResUrl =
            imageFormats?.large?.url ||
            imageFormats?.medium?.url ||
            imageFormats?.small?.url ||
            storyboard.attributes.thumbnail?.data?.attributes?.url;
          const fullImageUrl = highResUrl ? `${UPLOADS_BASE_URL}${highResUrl}` : '';

          return (
            <TouchableOpacity
              key={storyboard.id}
              onPress={() => navigation.navigate('StoryboardDetails', {
                id: storyboard.id,
                chapterId: chapter.id,
              })}
              style={styles.storyboardCard}
              activeOpacity={0.85}
            >
              <View style={styles.imageWrapper}>
                {fullImageUrl ? (
                  <Image source={{ uri: fullImageUrl }} style={styles.image} />
                ) : (
                  <View style={styles.noImage}>
                    <AppText style={styles.noImageText}>
                      {t('noImage', { defaultValue: 'Δεν υπάρχει εικόνα' })}
                    </AppText>
                  </View>
                )}
              </View>
              <AppText style={styles.storyboardTitle} numberOfLines={2}>
                {storyboard.attributes.title}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#04396f" />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.container}>
        <AppText style={styles.errorText}>{t('chapterNotFound')}</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <AppText style={styles.backButtonText}>{t('backToHome')}</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {!!chapter.attributes.description && (
        <AppText style={styles.description}>
          {chapter.attributes.description.replace(/<[^>]+>/g, '')}
        </AppText>
      )}

     
      {storyboards.length > 0 && <View style={styles.divider} />}

     
      {storyboards.length > 0 && (
        <View style={styles.gallery}>{renderStoryboardRows()}</View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#f7faff',
    minHeight: '100%',
    top:80
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7faff',
  },
  description: {
    fontSize: 16,
    marginVertical: 18,
    color: '#04396f',
    paddingHorizontal: 24,
    textAlign: 'flex',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#dbeafe',
    alignSelf: 'center',
    marginVertical: 18,
    borderRadius: 1,
  },
  gallery: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  storyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    width: screenWidth,
  },
  storyboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#04396f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 10,
    alignItems: 'center',
    width: screenWidth * 0.42,
    padding: 5,
  },
  imageWrapper: {
    width: 150,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#e3eaf7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 150,
    height: 110,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  noImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#cfd8dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#555',
    textAlign: 'center',
    fontSize: 13,
  },
  storyboardTitle: {
    marginTop: 0,
    textAlign: 'center',
    fontSize: 16,
    color: '#04396f',
    fontWeight: '600',
    minHeight: 16,
    fontFamily:'Inter-Variable'
  },
  
});