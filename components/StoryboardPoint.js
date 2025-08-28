import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { db } from "../firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import AppText from './AppText';
import RenderHtml from 'react-native-render-html';
import { Linking } from 'react-native';

const UPLOADS_BASE_URL = 'https://skopelos-admin.inculture.app';
const screenWidth = Dimensions.get('window').width;

function autoLinkHtml(html) {
  // Μετατρέπει σκέτα URLs και www. σε <a href="...">...</a>
  return html
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1">$1</a>'
    )
    .replace(
      /www\.([a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,})(?![^<]*>)/g,
      '<a href="https://www.$1">www.$1</a>'
    );
}

export default function StoryboardPoint() {
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const route = useRoute();
  const { id } = route.params || {};
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();


  useEffect(() => {
    if (point?.attributes?.title) {
      navigation.setOptions({ title: point.attributes.title });
    }
  }, [point, navigation]);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${UPLOADS_BASE_URL}/api/points/${id}?populate=thumbnail,trail.gpx,trail.points&locale=el`
    )
      .then((res) => res.json())
      .then(async (json) => {
        setPoint(json?.data);

        // Check if favorite
        if (user && json?.data?.id) {
          const favRef = doc(db, "users", user.uid, "favorites", json.data.id.toString());
          const favSnap = await getDoc(favRef);
          setIsFavorite(favSnap.exists());
        } else {
          setIsFavorite(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user || !point?.id) return;
    const favRef = doc(db, "users", user.uid, "favorites", point.id.toString());
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
    } else {
      await setDoc(favRef, {
        id: point.id,
        title: point.attributes?.title || "",
      });
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (!point) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>{t('notFound', 'Δεν βρέθηκε το σημείο')}</AppText>
      </View>
    );
  }

  const attr = point.attributes;
  const thumbUrl = attr.thumbnail?.data?.attributes?.url
    ? UPLOADS_BASE_URL + attr.thumbnail.data.attributes.url
    : null;

  const pointCoords = {
    latitude: attr.latitude,
    longitude: attr.longitude,
  };

  const trail = attr.trail;
  let trailPath = [];
  let trailPoints = [];

  if (trail?.gpx?.data?.attributes?.points) {
    trailPath = trail.gpx.data.attributes.points.map(p => ({
      latitude: p.lat,
      longitude: p.lng,
    }));
  }

  if (trail?.points?.data) {
    trailPoints = trail.points.data.map(p => ({
      id: p.id,
      title: p.attributes.title,
      latitude: p.attributes.latitude,
      longitude: p.attributes.longitude,
    }));
  }

  const initialRegion = {
    latitude: trailPath.length > 0 ? trailPath[0].latitude : pointCoords.latitude,
    longitude: trailPath.length > 0 ? trailPath[0].longitude : pointCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText style={styles.title}>{attr.title}</AppText>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={handleToggleFavorite} disabled={!user}>
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={32}
              color={isFavorite ? "#e53935" : "#aaa"}
            />
          </TouchableOpacity>
          {!user && (
            <AppText style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
              {t("loginToAddFavorites", { defaultValue: "Συνδεθείτε για να προσθέσετε στα αγαπημένα." })}
            </AppText>
          )}
        </View>
        {thumbUrl && (
          <Image
            source={{ uri: thumbUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.divider} />
        {attr.description ? (
          <RenderHtml
            contentWidth={screenWidth * 0.9}
            source={{ html: autoLinkHtml(attr.description) }}
            tagsStyles={{
              p: { fontSize: 16, color: '#232323', lineHeight: 24, fontFamily: 'Inter-Variable' ,textAlign:'center'},
              a: { color: '#1565c0', textDecorationLine: 'underline', fontWeight: 'bold' },
            }}
            defaultProps={{
              a: {
                onPress: (_, href) => Linking.openURL(href),
              },
            }}
          />
        ) : (
          <AppText style={styles.description}>
            {t('noDescription', 'Δεν υπάρχει περιγραφή')}
          </AppText>
        )}
        <MapView style={styles.map} initialRegion={initialRegion}>
          {trailPath.length > 0 ? (
            <>
              <Polyline
                coordinates={trailPath}
                strokeColor="#1a365d"
                strokeWidth={4}
              />
              {trailPoints.map((pt) => (
                <Marker
                  key={pt.id}
                  coordinate={{ latitude: pt.latitude, longitude: pt.longitude }}
                  title={pt.title}
                />
              ))}
            </>
          ) : (
            <Marker coordinate={pointCoords} title={attr.title} />
          )}
        </MapView>
        <View style={styles.divider} />
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7faff' },
  scrollContent: { alignItems: 'center', padding: 18 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: 1,
    fontFamily:'Inter-Variable'
  },
  image: {
    width: screenWidth * 0.9,
    height: 220,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#e3eaf7',
    alignSelf: 'center',
    shadowColor: '#04396f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    width: 180,
    height: 2,
    backgroundColor: '#1a365d',
    borderRadius: 2,
    marginVertical: 18,
    alignSelf: 'center',
  },
  description: {
    fontSize: 16,
    color: '#232323',
    textAlign: 'flex',
    lineHeight: 24,
    marginBottom: 10,
    paddingHorizontal: 8,
    fontFamily:'Inter-Variable'
  },
  map: {
    width: screenWidth * 0.9,
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
});