import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppText from "./AppText";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t,i18n } = useTranslation();

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
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <AppText style={styles.buttonText}>{t("logout", { defaultValue: "Αποσύνδεση" })}</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <AppText style={styles.title}>{t("login")}</AppText>
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
              placeholder={t("password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
            {error ? <AppText style={styles.error}>{error}</AppText> : null}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <AppText style={styles.buttonText}>{t("login", { defaultValue: "Σύνδεση" })}</AppText>
            </TouchableOpacity>
          </>
        )}
        {!user && (
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <AppText style={styles.link}>
              {t("noAccountRegister")}
            </AppText>
          </TouchableOpacity>
        )}
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
});