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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/config/axios';

// TypeScript interfaces
interface RegisterData {
  name: string;
  email: string;
  country: string;
  city: string;
  job: string;
  description: string;
  role: number; // Changed to number
  password: string;
  password_confirmation: string;
}

interface ApiResponse {
  success: boolean;
  data?: { user?: any; token?: string };
  message?: string;
  errors?: { [key: string]: string[] };
}

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [job, setJob] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [role, setRole] = useState<string>("1"); // Still string in UI for simplicity
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Client-side validation
  const validateForm = (): boolean => {
    setErrors([]);
    const newErrors: string[] = [];

    if (!name.trim()) newErrors.push("Name is required.");
    if (!email.trim() || !email.includes("@")) newErrors.push("Valid email is required.");
    if (!country.trim()) newErrors.push("Country is required.");
    if (!city.trim()) newErrors.push("City is required.");
    if (!job.trim()) newErrors.push("Job is required.");
    if (!password || password.length < 8) {
      newErrors.push("Password must be at least 8 characters.");
    }
    if (password !== passwordConfirmation) {
      newErrors.push("Passwords do not match.");
    }
    if (!termsAccepted) {
      newErrors.push("You must agree to the terms and privacy policy.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  // API call to register user
  const registerUser = async (userData: RegisterData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register', userData); 
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Registration successful!',
      };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      
      if (error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          return {
            success: false,
            errors: error.response.data.errors,
            message: 'Validation failed',
          };
        }
        
        return {
          success: false,
          message: error.response.data.message || 'Registration failed. Please try again.',
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  };

const handleRegister = async () => {
  setErrors([]);
  setStatus(null);

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  const userData: RegisterData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    country: country.trim(),
    city: city.trim(),
    job: job.trim(),
    description: description.trim(),
    role: parseInt(role),
    password,
    password_confirmation: passwordConfirmation,
  };

  try {
    const result = await registerUser(userData);

    if (result.success) {
      setStatus("Registration successful! Redirecting to login...");

      // Clear session just in case
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");

      // Delay then redirect to login
      setTimeout(() => {
        // Navigate to login and force it to re-render by appending a query
        router.replace({
          pathname: "/login",
          params: { fromRegister: "1", ts: Date.now().toString() }, // forces reload
        });
      }, 1500);
    } else {
      if (result.errors) {
        const fieldErrors: string[] = [];
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            fieldErrors.push(
              ...messages.map(
                (msg) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`
              )
            );
          }
        });
        setErrors(fieldErrors);
      } else if (result.message) {
        setErrors([result.message]);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    setErrors(["An unexpected error occurred. Please try again."]);
  } finally {
    setIsLoading(false);
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

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
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
                • {error}
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
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Name *
            </Text>
            <TextInput
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
              autoCapitalize="words"
              autoFocus
              editable={!isLoading}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Email *
            </Text>
            <TextInput
              placeholder="Enter your email address"
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
              editable={!isLoading}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                Country *
              </Text>
              <TextInput
                placeholder="Enter your country"
                value={country}
                onChangeText={setCountry}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 12,
                  fontSize: 16,
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                City *
              </Text>
              <TextInput
                placeholder="Enter your city"
                value={city}
                onChangeText={setCity}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 12,
                  fontSize: 16,
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Job *
            </Text>
            <TextInput
              placeholder="Enter your occupation"
              value={job}
              onChangeText={setJob}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Description
            </Text>
            <TextInput
              placeholder="Tell us about yourself (optional)"
              value={description}
              onChangeText={setDescription}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
                height: 120,
                textAlignVertical: "top",
              }}
              multiline
              numberOfLines={5}
              editable={!isLoading}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Register as *
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
                onPress={() => !isLoading && setRole("1")}
                disabled={isLoading}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ff3333",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  {role === "1" && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#ff3333",
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 16, color: "#333" }}>Partner (Car Owner)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => !isLoading && setRole("2")}
                disabled={isLoading}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ff3333",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  {role === "2" && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#ff3333",
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 16, color: "#333" }}>Client (Car Renter)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                Password *
              </Text>
              <TextInput
                placeholder="Enter password (min. 8 chars)"
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
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                Confirm Password *
              </Text>
              <TextInput
                placeholder="Confirm your password"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 12,
                  fontSize: 16,
                }}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => !isLoading && setTermsAccepted(!termsAccepted)}
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
                disabled={isLoading}
              >
                {termsAccepted && (
                  <Ionicons name="checkmark" size={18} color="#ff3333" />
                )}
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                I agree to the{" "}
                <Text
                  style={{ color: "#ff3333", textDecorationLine: "underline" }}
                  onPress={() => Alert.alert("Terms of Service", "Terms of Service content will be displayed here.")}
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={{ color: "#ff3333", textDecorationLine: "underline" }}
                  onPress={() => Alert.alert("Privacy Policy", "Privacy Policy content will be displayed here.")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <TouchableOpacity 
              onPress={() => router.push("/login")}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 14, color: "#ff3333", marginRight: 16 }}>
                Already registered?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: isLoading ? "#ccc" : "#ff3333",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignItems: "center",
                flexDirection: "row",
                minWidth: 120,
                justifyContent: "center",
              }}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                    REGISTERING...
                  </Text>
                </>
              ) : (
                <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                  REGISTER
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}