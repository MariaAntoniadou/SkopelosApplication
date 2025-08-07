import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getIntroductionChaptersDeep } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';

const screenWidth = Dimensions.get('window').width;

function cleanDescription(html) {
  if (!html) return '';

  return html
    .replace(/[_*]/g, '') 
    .replace(/<\/?[^>]+(>|$)/g, '') 
    .trim();
}

export default function IntroChapters({ route }) {
  const { chapterId } = route.params;
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getIntroductionChaptersDeep(i18n.language);
        const found = data.find(ch => ch.id === chapterId);
        setChapter(found);
      } catch (err) {
        console.error('Failed to load chapter', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [chapterId]);

  useLayoutEffect(() => {
    if (chapter?.attributes?.title) {
      navigation.setOptions({ title: chapter.attributes.title });
    }
  }, [chapter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <AppText>{t('loadingIntro', { defaultValue: 'Loading...' })}</AppText>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.center}>
        <AppText>{t('chapterNotFound', { defaultValue: 'Not found' })}</AppText>
      </View>
    );
  }

  const storyboards = chapter.attributes.storyboards?.data || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      
      {chapter.attributes.description && (
        <AppText style={styles.descriptionText}>
          {cleanDescription(chapter.attributes.description)}
        </AppText>
      )}

      {storyboards.length > 0 && (
        <View style={styles.storyboardGrid}>
          {storyboards.map(storyboard => {
            const thumbUrl = storyboard.attributes.thumbnail?.data?.attributes?.url;
            const fullImageUrl = thumbUrl
              ? `https://skopelos-admin.inculture.app${thumbUrl}`
              : null;

            return (
              <TouchableOpacity
                key={storyboard.id}
                style={styles.storyboardItem}
                onPress={() => navigation.navigate('IntroStoryboards', { storyboardId: storyboard.id })}
              >
                {fullImageUrl && (
                  <Image source={{ uri: fullImageUrl }} style={styles.storyboardImage} />
                )}
                <AppText style={styles.storyboardTitle}>{storyboard.attributes.title}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 90,
    backgroundColor: '#EAF6FF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 24,
    fontFamily:'Inter-Variable'
  },
  storyboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storyboardItem: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  storyboardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  storyboardTitle: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily:'Inter-Variable'
  },
});
