// Example: Responsive Login Component
// This shows how to apply responsive design to other components

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppText from "./AppText";
import { 
  wp, 
  hp, 
  responsiveFont, 
  isTablet, 
  shadowStyle,
  spacing 
} from '../utils/responsive';

export default function ResponsiveLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Profile");
    } catch (err) {
      setError(t("loginError", { defaultValue: "Λάθος email ή κωδικός." }));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        {user ? (
          <View style={styles.loggedInContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <AppText style={styles.buttonText}>
                {t("logout", { defaultValue: "Αποσύνδεση" })}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <AppText style={styles.title}>
              {t("login", { defaultValue: "Σύνδεση" })}
            </AppText>
            
            <TextInput
              style={styles.input}
              placeholder={t("email", { defaultValue: "Email" })}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t("password", { defaultValue: "Κωδικός" })}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {error ? <AppText style={styles.error}>{error}</AppText> : null}
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <AppText style={styles.buttonText}>
                {t("login", { defaultValue: "Σύνδεση" })}
              </AppText>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <AppText style={styles.link}>
                {t("noAccount", { defaultValue: "Δεν έχετε λογαριασμό; Εγγραφείτε" })}
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7faff",
    paddingHorizontal: wp('5%'),
  },
  box: {
    backgroundColor: "white",
    padding: wp(isTablet() ? '8%' : '10%'),
    borderRadius: wp('4%'),
    width: wp(isTablet() ? '60%' : '90%'),
    maxWidth: isTablet() ? 400 : undefined,
    ...shadowStyle(8),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7faff",
  },
  loggedInContainer: {
    alignItems: "center"
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: "bold",
    color: "#1a365d",
    textAlign: "center",
    marginBottom: spacing.large,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: wp('4%'),
    marginBottom: spacing.medium,
    borderRadius: wp('2%'),
    fontSize: responsiveFont(16),
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#1a365d",
    padding: wp('4%'),
    borderRadius: wp('2%'),
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  buttonText: {
    color: "white",
    fontSize: responsiveFont(16),
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: responsiveFont(14),
    textAlign: "center",
    marginBottom: spacing.medium,
  },
  link: {
    color: "#1a365d",
    fontSize: responsiveFont(14),
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

// Export original Login for compatibility
export { default as Login } from './Login';
