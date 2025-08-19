import React, { useEffect, useState, useRef } from 'react';
import {
  View,StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { ENDPOINTS, SERVER_IP, UPLOADS_BASE_URL } from '../api/api.js';
import { XMLParser } from 'fast-xml-parser';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText.js';

const screenWidth = Dimensions.get('window').width;

function parseGpxPoints(gpxString) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const gpx = parser.parse(gpxString);
    let trkpts = [];
    if (
      gpx &&
      gpx.gpx &&
      gpx.gpx.trk &&
      gpx.gpx.trk.trkseg &&
      gpx.gpx.trk.trkseg.trkpt
    ) {
      trkpts = gpx.gpx.trk.trkseg.trkpt;
      // If only one point, wrap in array
      if (!Array.isArray(trkpts)) trkpts = [trkpts];
      return trkpts.map(pt => ({
        latitude: parseFloat(pt.lat),
        longitude: parseFloat(pt.lon),
      }));
    }
    return [];
  } catch (e) {
    console.warn('GPX parse error:', e);
    return [];
  }
}

export default function TrailDetails() {
  const route = useRoute();
  const { id } = route.params || {};
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpxPath, setGpxPath] = useState([]);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [mapReady, setMapReady] = useState(false);
  const { t,i18n } = useTranslation();
  const [selectedPoint, setSelectedPoint] = useState(null); 

  useEffect(() => {
    if (trail?.attributes?.title) {
      navigation.setOptions({ title: trail.attributes.title });
    }
  }, [trail]);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
     fetch(SERVER_IP + ENDPOINTS.getTrailById(id, i18n.language))
      .then(res => res.json())
      .then(async json => {
        setTrail(json?.data);

        const gpxUrl = json?.data?.attributes?.gpx?.data?.attributes?.url
          ? UPLOADS_BASE_URL + json.data.attributes.gpx.data.attributes.url
          : null;

        if (gpxUrl) {
          try {
            const gpxRes = await fetch(gpxUrl);
            const gpxAppText = await gpxRes.text();
            const path = parseGpxPoints(gpxAppText);
            setGpxPath(path);
            
          } catch (e) {
            setGpxPath([]);
          }
        } else {
          setGpxPath([]);
          
        }
      })
      .catch(err => {
        console.error('Trail fetch error:', err);
        setTrail(null);
        setGpxPath([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!trail) {
    return (
      <View style={styles.centered}>
        <AppText style={{ color: 'red' }}>Η διαδρομή δεν βρέθηκε.</AppText>
      </View>
    );
  }

  const attr = trail.attributes;
  const thumbUrl = attr.thumbnail?.data?.attributes?.url
    ? UPLOADS_BASE_URL + attr.thumbnail.data.attributes.url
    : null;

  const points = attr.points?.data?.map(p => ({
    id: p.id,
    title: p.attributes?.title,
    latitude: p.attributes?.latitude,
    longitude: p.attributes?.longitude,
    description: p.attributes?.description, 
  })) || [];

 
  const path = gpxPath.length > 0
    ? gpxPath
    : points.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));

  

  const initialRegion = {
    latitude: path[0]?.latitude || 39.12,
    longitude: path[0]?.longitude || 23.72,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };


  if (mapReady && path.length > 0 && mapRef.current) {
  mapRef.current.fitToCoordinates(path, {
    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    animated: true,
  });
  setMapReady(false); 
}

  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText style={styles.title}>{attr.title}</AppText>

      {thumbUrl && (
        <Image source={{ uri: thumbUrl }} style={styles.image} />
      )}

      <View style={styles.infoRow}>
        <AppText style={styles.chip}>🕒 {attr.duration} λεπτά</AppText>
        <AppText style={styles.chip}>📏 {attr.distance} χλμ</AppText>
        <AppText style={styles.chip}>{t('difficulty')}:{attr.difficulty}</AppText>
      </View>

      <MapView  ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}>
        <Polyline
          coordinates={path}
          strokeColor="#1a365d"
          strokeWidth={4}
        />
        {points.map((pt) => (
          <Marker
            key={pt.id}
            coordinate={{ latitude: pt.latitude, longitude: pt.longitude }}
            title={pt.title}
            onPress={() => setSelectedPoint(pt)} 
          />
        ))}
      </MapView>

        {selectedPoint && selectedPoint.description && (
          <View style={{ marginBottom: 12 }}>
            <AppText style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
              {selectedPoint.title}
            </AppText>
            <AppText style={styles.description}>
              {selectedPoint.description.replace(/<\/?p>/g, '').replace(/<\/p><p>/g, ' ')}
            </AppText>
          </View>
        )}

      <AppText style={styles.description}>
        {attr.description?.replace(/<\/?p>/g, '').replace(/<\/p><p>/g, ' ') || ''}
      </AppText>
    </ScrollView>
  );
}

// ...existing code...

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f7faff',
    top:100
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    AppTextAlign: 'center',
    fontFamily:'Inter-Variable'
  },
  image: {
    width: screenWidth - 36,
    height: 180,
    borderRadius: 16,
    marginBottom: 18,
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  chip: {
    backgroundColor: '#e3f0ff',
    color: '#1a365d',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
    fontWeight: 'bold',
    fontSize: 14,
  },
  map: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    marginBottom: 18,
    alignSelf: 'center',
  },
  description: {
    fontSize: 16,
    color: '#232323',
    lineHeight: 22,
    marginBottom: 18,
    AppTextAlign: 'justify',
  },
});