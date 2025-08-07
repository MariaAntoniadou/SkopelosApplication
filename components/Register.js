import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import AppText from "./AppText";
import { useTranslation } from "react-i18next";
import { Camera } from "expo-camera"; 

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { t} = useTranslation();

 const requestCameraPermission = async () => {
  Alert.alert(
    t('cameraPermissionTitle'),
    t('cameraPermissionQuestion'),
    [
      {
        text: t('notNow'),
        onPress: () => {
          navigation.navigate("Profile");
        },
        style: 'cancel'
      },
      {
        text: t('allowCamera'),
        onPress: async () => {
          try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            
            if (status === 'granted') {
              Alert.alert(
                t('success'), 
                t('cameraPermissionGranted'),
                [{ 
                  text: 'OK', 
                  onPress: () => navigation.navigate("Profile") 
                }]
              );
            } else {
              Alert.alert(
                t('cameraPermissionDenied' ), 
                t('cameraPermissionLater'),
                [{ 
                  text: 'OK', 
                  onPress: () => navigation.navigate("Profile") 
                }]
              );
            }
            
          } catch (error) {
            console.error('Error requesting camera permission:', error);
            Alert.alert(
              t('error'), 
              t('cameraPermissionError'),
              [{ 
                text: 'OK', 
                onPress: () => navigation.navigate("Profile") 
              }]
            );
          }
        }
      }
    ],
    { cancelable: false }
  );
};

const handleRegister = async () => {
  setError("");
  setLoading(true);
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    
    // Μετά την επιτυχή εγγραφή, ρώτησε αν θέλει camera permission
    setLoading(false);
    
    // Δείξε πρώτα επιτυχία εγγραφής, μετά ρώτησε για κάμερα
    Alert.alert(
      t('registrationSuccess'), 
      t('accountCreated'),
      [{ 
        text: 'OK', 
        onPress: () => requestCameraPermission() // Μετά ρώτησε για κάμερα
      }]
    );
    
  } catch (err) {
    setError(t('errorRegister'));
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
        <AppText style={styles.loadingText}>
          {t('creatingAccount')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <AppText style={styles.title}>{t('register')}</AppText>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder={t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <AppText style={styles.buttonText}>{t('register')}</AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <AppText style={styles.link}>{t("alreadyAccount")}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f7faff" },
  box: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#1a365d", marginBottom: 18, textAlign: "center" },
  input: {
    backgroundColor: "#f0f4fa",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e3f0ff",
  },
  button: {
    backgroundColor: "#1a365d",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  error: { color: "red", textAlign: "center", marginBottom: 8 },
  link: { color: "#122235", textAlign: "center", marginTop: 10, fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#1a365d", fontSize: 16 }, // Νέο style
});