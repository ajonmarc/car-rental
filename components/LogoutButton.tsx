import React, { useState } from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../src/config/axios";

// TypeScript interface for API response
interface LogoutResponse {
  success: boolean;
  message?: string;
}

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // Call the logout endpoint
      const response = await api.post<LogoutResponse>("/auth/logout");

      if (response.data.success) {
        // Clear AsyncStorage
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");

        // Show success message
        Alert.alert("Success", response.data.message || "Logged out successfully", [
          {
            text: "OK",
            onPress: () => {
              // Redirect to login screen
              router.replace("/login");
            },
          },
        ]);
      } else {
        throw new Error(response.data.message || "Logout failed");
      }
    } catch (error: any) {
      console.error("Logout error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to log out. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isLoading ? "#ccc" : "#ff3333",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        minWidth: 120,
      }}
      onPress={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            LOGGING OUT...
          </Text>
        </>
      ) : (
        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
          LOG OUT
        </Text>
      )}
    </TouchableOpacity>
  );
}