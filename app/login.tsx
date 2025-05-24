import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../src/config/axios"; // Import the axios instance
import AsyncStorage from "@react-native-async-storage/async-storage"; // For persistent token storage

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

// In Login.tsx, update handleLogin
const handleLogin = async () => {
  setErrors([]);
  setStatus(null);

  if (!email || !password) {
    setErrors(["Email and password are required."]);
    return;
  }

  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data.success) {
      const { token, user } = response.data.data;

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setStatus("Login successful! Redirecting...");

    setTimeout(() => {
  router.replace(user.role === 1 ? "/partnerDashboard" : "/dashboard");
}, 1000);
    }
  } catch (error: any) {
    let errorMessages: string[] = [];
    if (error.response) {
      if (error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        errorMessages = Object.values(validationErrors).flat() as string[];
      } else if (error.response.status === 401) {
        errorMessages = [error.response.data.message || "Invalid email or password"];
      } else {
        errorMessages = [error.response.data.message || "Login failed. Please try again."];
      }
    } else {
      errorMessages = ["Network error. Please check your connection and try again."];
    }
    setErrors(errorMessages);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />
      
      <View
        style={{
          backgroundColor: "#000",
          padding: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../assets/logoW.png")}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
            CARS Rent
          </Text>
        </View>
   <TouchableOpacity onPress={() => router.replace("/")}>
  <Ionicons name="arrow-back" size={30} color="white" />
</TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 100, height: 100 }}
          />
        </View>

        {status && (
          <View style={{ marginBottom: 15, padding: 10, backgroundColor: "#d1fae5", borderRadius: 5 }}>
            <Text style={{ color: "#16a34a", fontSize: 14, textAlign: "center" }}>
              {status}
            </Text>
          </View>
        )}

        {errors.length > 0 && (
          <View style={{ marginBottom: 15, padding: 10, backgroundColor: "#fee2e2", borderRadius: 5 }}>
            {errors.map((error, index) => (
              <Text key={index} style={{ color: "#dc2626", fontSize: 14, textAlign: "center" }}>
                {error}
              </Text>
            ))}
          </View>
        )}

        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, color: "#333", marginBottom: 5 }}>
              Email
            </Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, color: "#333", marginBottom: 5 }}>
              Password
            </Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={{
                width: 24,
                height: 24,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={18} color="#ff3333" />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 14, color: "#666" }}>Remember me</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <TouchableOpacity onPress={() => alert("Forgot Password feature coming soon!")}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  textDecorationLine: "underline",
                  marginRight: 16,
                }}
              >
                Forgot your password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#ff3333",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignItems: "center",
              }}
              onPress={handleLogin}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                LOG IN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => router.push("/register")}
        >
          <Text style={{ color: "#ff3333", textAlign: "center", fontSize: 16 }}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}