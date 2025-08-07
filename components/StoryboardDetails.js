import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AppText from './AppText';

const UPLOADS_BASE_URL = 'https://skopelos-admin.inculture.app';
const screenWidth = Dimensions.get('window').width;

export default function StoryboardDetails() {
  const [storyboard, setStoryboard] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();
  const { id, chapterId } = route.params || {};
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLoading(true);

    async function fetchData() {
      try {
        // Fetch storyboard with deep populate
        const sbRes = await fetch(
          `${UPLOADS_BASE_URL}/api/main-storyboards/${id}?populate[0]=thumbnail,tags,points,trails&populate[1]=tags.icon,points.thumbnail,points.medias,points.tags,trails.tags&populate[2]=points.medias.thumbnail,points.medias.files,points.tags.icon&locale=${i18n.language || 'el'}`
        );
        const sbJson = await sbRes.json();
        setStoryboard(sbJson?.data);

        // Set top bar title
        if (sbJson?.data?.attributes?.title) {
          navigation.setOptions({ title: sbJson.data.attributes.title });
        }

        // Fetch chapter title if chapterId exists
        if (chapterId) {
          const chRes = await fetch(
            `${UPLOADS_BASE_URL}/api/main-chapters/${chapterId}?locale=${i18n.language || 'el'}`
          );
          const chJson = await chRes.json();
          setChapterTitle(chJson?.data?.attributes?.title || '');
        }
      } catch (error) {
        console.error('Error fetching storyboard or chapter:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, chapterId, i18n.language, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (!storyboard) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>{t('storyboardNotFound', 'Δεν βρέθηκε το storyboard')}</AppText>
      </View>
    );
  }

  const points = storyboard.attributes.points?.data || [];
  const trails = storyboard.attributes.trails?.data || [];
  const tags = storyboard.attributes.tags?.data || [];
  const topbarTitle = storyboard.attributes.topbarTitle;
  const description = storyboard.attributes.description;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.divider} />

        {/* Subtitle */}
        {topbarTitle ? <AppText style={styles.subtitle}>{topbarTitle}</AppText> : null}

        {/* Description */}
        {description ? (
          <AppText style={styles.description}>
            {description.replace(/<[^>]+>/g, '')}
          </AppText>
        ) : null}

        {/* === Points === */}
        {points.length > 0 && (
          <View style={styles.pointsSection}>
            <View style={styles.pointsContainer}>
              {points.map((point) => {
                const formats = point.attributes.thumbnail?.data?.attributes?.formats;
                const imageUrl =
                  (formats?.large?.url && UPLOADS_BASE_URL + formats.large.url) ||
                  (formats?.medium?.url && UPLOADS_BASE_URL + formats.medium.url) ||
                  (formats?.small?.url && UPLOADS_BASE_URL + formats.small.url) ||
                  (point.attributes.thumbnail?.data?.attributes?.url &&
                    UPLOADS_BASE_URL + point.attributes.thumbnail.data.attributes.url);

                return (
                  <TouchableOpacity
                    key={point.id}
                    style={styles.pointCard}
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate('PointDetails', { id: point.id })}
                  >
                    {imageUrl && <Image source={{ uri: imageUrl }} style={styles.pointImage} />}
                    <AppText style={styles.pointTitle}>{point.attributes.title}</AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* === Trails === */}
        {trails.length > 0 && (
          <View style={styles.trailsSection}>
            <AppText style={styles.sectionTitle}>{t('trails', 'Διαδρομές')}</AppText>
            <View style={styles.trailsContainer}>
              {trails.map((trail) => (
                <TouchableOpacity
                  key={trail.id}
                  style={styles.trailButton}
                  onPress={() => navigation.navigate('TrailDetails', { id: trail.id })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      name={'hiking'}
                      size={30}
                      color='rgba(4, 57, 111, 0.81)'
                      solid
                      style={{ marginRight: 10 }}
                    />
                    <AppText style={styles.trailText}>{trail.attributes.title}</AppText>
                  </View>
                  
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* === Tags === */}
        {tags.length > 0 && (
          <View style={styles.tagsSection}>
            <AppText style={styles.sectionTitle}>{t('tags', 'Ετικέτες')}</AppText>
            <View style={styles.tagList}>
              {tags.map((tag) => {
                const iconUrl =
                  tag.attributes.icon?.data?.attributes?.url &&
                  UPLOADS_BASE_URL + tag.attributes.icon.data.attributes.url;

                return (
                  <View key={tag.id} style={styles.tagChip}>
                    {iconUrl && <Image source={{ uri: iconUrl }} style={styles.tagIcon} />}
                    <AppText style={styles.tagText}>{tag.attributes.title}</AppText>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7faff' },
  scrollContent: { padding: 18, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red',fontFamily:'Inter-Variable' },

  divider: {
    width: '30%',
    height: 3,
    backgroundColor: '#cfe8ff',
    borderRadius: 2,
    marginBottom: 18,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#3b3b3b',
    marginBottom: 10,
    fontWeight: '600',
    fontFamily:'Inter-Variable'
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily:'Inter-Variable'
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily:'Inter-Variable'

  },

  pointsSection: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#eaf4ff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: '#04396f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  pointsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  paddingHorizontal: 4,
},
pointCard: {
  backgroundColor: '#fff',
  marginBottom: 16,
  borderRadius: 14,
  overflow: 'hidden',
  elevation: 4,
  width: (screenWidth - 56) / 2, 
  marginHorizontal: 0,
  alignItems: 'center',
  shadowColor: '#04396f',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.13,
  shadowRadius: 8,
},
  pointImage: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    resizeMode: 'cover',
  },
  pointTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#232323',
    padding: 10,
    textAlign: 'center',
    minHeight: 40,
    fontFamily:'Inter-Variable'
  },

  trailsSection: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#f3f8ff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: '#04396f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  trailsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  trailButton: {
    backgroundColor: '#cfe8ff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    width: screenWidth *0.9,
    elevation: 2,
  },
  trailText: { fontWeight: '600', color: '#1a365d', fontSize: 16, fontFamily:'Inter-Variable' },

  tagsSection: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#f7faff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: '#04396f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6,
  },
  tagChip: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    margin: 4,
    elevation: 2,
  },
  tagIcon: { width: 18, height: 18, marginRight: 6 },
  tagText: { color: 'white', fontWeight: '600', fontSize: 15 ,fontFamily:'Inter-Variable'},

  backButton: {
    marginVertical: 24,
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 200,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily:'Inter-Variable'
  },
});