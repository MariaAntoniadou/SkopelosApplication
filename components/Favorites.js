import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AppText from "./AppText";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favCol = collection(db, "users", user.uid, "favorites");
        const favSnap = await getDocs(favCol);
        setFavorites(
        favSnap.docs
          .map(doc => ({ ...doc.data(), docId: doc.id }))
          .filter(fav => fav.id) 
      );
      } catch (e) {
        setFavorites([]);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const removeFavorite = async (favId) => {
    if (!user) return;
    try {
      const favDoc = doc(db, "users", user.uid, "favorites", favId);
      await deleteDoc(favDoc);
      setFavorites(favorites.filter(fav => fav.docId !== favId));
    } catch (e) {
      Alert.alert(t("error"), t("deleteFavoriteError", { defaultValue: "Σφάλμα διαγραφής." }));
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <AppText>{t("loginToSeeFavorites", { defaultValue: "Συνδεθείτε για να δείτε τα αγαπημένα σας." })}</AppText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  console.log("APP favorites:", favorites);

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>{t("noFavorites", { defaultValue: "Δεν υπάρχουν αγαπημένα." })}</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.docId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => navigation.navigate("PointDetails", { id: item.id })}
            >
              <Text style={styles.itemText}>{item.title}</Text>
              <TouchableOpacity onPress={() => removeFavorite(item.docId)}>
                <MaterialIcons name="favorite" size={28} color="#e53935" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7faff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 16 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  itemText: { fontSize: 17, color: "#1a365d" },
  separator: { height: 1, backgroundColor: "#e3f0ff", marginVertical: 4 },
});