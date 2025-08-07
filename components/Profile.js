import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from "@expo/vector-icons";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import AppText from './AppText';

const { width } = Dimensions.get('window');
const photoSize = (width - 60) / 3; // 3 φωτό ανά σειρά με spacing

export default function Profile() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [favorites, setFavorites] = React.useState([]);
  const [photos, setPhotos] = React.useState([]);
  const [favLoading, setFavLoading] = React.useState(true);
  const [photosLoading, setPhotosLoading] = React.useState(true);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigation.navigate('ΣΚΟΠΕΛΟΣ');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const favCol = collection(db, "users", user.uid, "favorites");
      const favSnap = await getDocs(favCol);
      setFavorites(
        favSnap.docs
          .map(doc => ({ ...doc.data(), docId: doc.id }))
          .filter(fav => fav.id)
      );
    } catch (e) {
      console.error('Error fetching favorites:', e);
      setFavorites([]);
    }
    setFavLoading(false);
  };

  const fetchPhotos = async () => {
    if (!user) return;
    setPhotosLoading(true);
    try {
      const photosCol = collection(db, "users", user.uid, "photos");
      const photosQuery = query(photosCol, orderBy("timestamp", "desc"));
      const photosSnap = await getDocs(photosQuery);
      console.log('Photos fetched:', photosSnap.docs.length); // 👈 Debug
      setPhotos(
        photosSnap.docs.map(doc => ({ ...doc.data(), docId: doc.id }))
      );
    } catch (e) {
      console.error('Error fetching photos:', e);
      setPhotos([]);
    }
    setPhotosLoading(false);
  };

  // Refresh data όταν το screen γίνεται focused (χρήστης επιστρέφει από κάμερα)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchFavorites();
        fetchPhotos();
      }
    }, [user])
  );

  const removeFavorite = async (favId) => {
    if (!user) return;
    try {
      const favDoc = doc(db, "users", user.uid, "favorites", favId);
      await deleteDoc(favDoc);
      setFavorites(favorites.filter(fav => fav.docId !== favId));
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const removePhoto = async (photoId) => {
    if (!user) return;
    try {
      const photoDoc = doc(db, "users", user.uid, "photos", photoId);
      await deleteDoc(photoDoc);
      setPhotos(photos.filter(photo => photo.docId !== photoId));
    } catch (e) {
      console.error('Error removing photo:', e);
    }
  };

  if (!user) return null;

  const renderHeader = () => (
    <View style={styles.profileBox}>
      <View style={styles.avatar}>
        <AppText style={styles.avatarText}>{(user.email?.[0] || 'U').toUpperCase()}</AppText>
      </View>
      <AppText style={styles.profileTitle}>{t('profile')}</AppText>
      <AppText style={styles.profileEmail}>{user.email}</AppText>
      <TouchableOpacity onPress={handleLogout} disabled={loading} style={styles.logoutBtn}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.logoutText}>{t('logout')}</AppText>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPhotosSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>{t('myPhotos', 'Οι φωτογραφίες μου')}</AppText>
        <AppText style={styles.photoCount}>({photos.length})</AppText>
      </View>
      {photosLoading ? (
        <ActivityIndicator size="large" color="#1a365d" style={styles.loader} />
      ) : photos.length === 0 ? (
        <View style={styles.emptyPhotoContainer}>
          <MaterialIcons name="photo-camera" size={48} color="#ccc" />
          <AppText style={styles.emptyText}>{t('noPhotos', 'Δεν έχετε βγάλει φωτογραφίες ακόμα.')}</AppText>
          <AppText style={styles.emptySubText}>Βγάλτε φωτογραφίες από την αρχική σελίδα!</AppText>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={photo.docId || index} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
              <TouchableOpacity
                style={styles.deletePhotoBtn}
                onPress={() => removePhoto(photo.docId)}
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderFavoritesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>{t('favorites')}</AppText>
        <AppText style={styles.photoCount}>({favorites.length})</AppText>
      </View>
      {favLoading ? (
        <ActivityIndicator size="large" color="#1a365d" style={styles.loader} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyPhotoContainer}>
          <MaterialIcons name="favorite-border" size={48} color="#ccc" />
          <AppText style={styles.emptyText}>{t("noFavorites", "Δεν υπάρχουν αγαπημένα.")}</AppText>
        </View>
      ) : (
        <View>
          {favorites.map((item, index) => (
            <View key={item.id || index} style={styles.favRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate("PointDetails", { id: item.id })}
                activeOpacity={0.7}
              >
                <AppText style={styles.favText}>{item.title}</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeFavorite(item.docId)}
                activeOpacity={0.7}
                style={{ marginLeft: 12 }}
              >
                <MaterialIcons name="favorite" size={28} color="#e53935" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      {renderPhotosSection()}
      {renderFavoritesSection()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 100,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#e3ecf7',
    borderRadius: 12,
    padding: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { 
    color: '#fff', 
    fontSize: 36, 
    fontWeight: '700', 
    letterSpacing: 2 
  },
  profileTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1a365d', 
    marginBottom: 6, 
    letterSpacing: 2 
  },
  profileEmail: { 
    color: '#555', 
    fontSize: 17, 
    opacity: 0.85, 
    textAlign: 'center', 
    marginBottom: 16 
  },
  logoutBtn: {
    backgroundColor: '#1a365d',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 17, 
    letterSpacing: 1, 
    textAlign: 'center' 
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { 
    fontWeight: '700', 
    fontSize: 18, 
    color: '#1a365d', 
    letterSpacing: 1 
  },
  photoCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Variable'
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  photoThumbnail: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    backgroundColor: '#e3f0ff',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPhotoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySubText: {
    textAlign: "center", 
    color: "#999", 
    marginTop: 8, 
    fontSize: 14,
    fontFamily: 'Inter-Variable'
  },
  favRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  favText: { 
    fontSize: 17, 
    color: "#1a365d" 
  },
  emptyText: { 
    textAlign: "center", 
    color: "#888", 
    marginTop: 20, 
    fontSize: 16,
    fontFamily: 'Inter-Variable'
  },
  loader: {
    marginTop: 20,
  },
});