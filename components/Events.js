import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';

const UPLOADS_BASE_URL = 'https://skopelos-admin.inculture.app';
const screenWidth = Dimensions.get('window').width;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchEvents() {
      try {
        
        const res = await fetch(`${UPLOADS_BASE_URL}/api/events?populate=thumbnail`);
        const json = await res.json();
        const data = json?.data || [];

       
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = data.filter(event => {
          const eventDate = new Date(event.attributes.date);
          return eventDate >= today;
        });

        setEvents(upcomingEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.noEventsText}>
          {t('noUpcomingEvents')}
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {events.map(event => {
        const imgUrl =
          event.attributes.thumbnail?.data?.attributes?.url
            ? UPLOADS_BASE_URL + event.attributes.thumbnail.data.attributes.url
            : null;

        return (
          <View key={event.id} style={styles.eventCard}>
            <AppText style={styles.eventTitle}>{event.attributes.title}</AppText>

            {imgUrl && (
              <Image
                source={{ uri: imgUrl }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.eventDate}>
              {new Date(event.attributes.date).toLocaleDateString('el-GR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            <AppText
              style={styles.eventDescription}
            >
              {event.attributes.description.replace(/<[^>]+>/g, '')}
            </AppText>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  noEventsText: {
    fontSize: 16, fontStyle: 'italic', color: '#666',
  },
  container: {
    padding: 18,
    backgroundColor: '#f7faff',
    alignItems: 'center',
    paddingBottom: 40,
    top:100
  },
  eventCard: {
    width: screenWidth * 0.9,
    backgroundColor: '#eaf4ff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 24,
    shadowColor: '#04396f',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#04396f',
    marginBottom: 8,
  },
  eventImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 10,
  },
  eventDate: {
    fontWeight: '700',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    color: '#222',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
});
