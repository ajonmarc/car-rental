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

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [job, setJob] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("1");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const handleRegister = () => {
    setErrors([]);
    setStatus(null);

    const newErrors: string[] = [];
    if (!name) newErrors.push("Name is required.");
    if (!email || !email.includes("@")) newErrors.push("Valid email is required.");
    if (!country) newErrors.push("Country is required.");
    if (!city) newErrors.push("City is required.");
    if (!job) newErrors.push("Job is required.");
    if (!password || password.length < 6) newErrors.push("Password must be at least 6 characters.");
    if (password !== passwordConfirmation) newErrors.push("Passwords do not match.");
    if (!termsAccepted) newErrors.push("You must agree to the terms and privacy policy.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock validation for demo
    setTimeout(() => {
      setStatus("Registration successful! Redirecting...");
      setTimeout(() => {
        router.push(role === "1" ? "/partnerDashboard" : "/dashboard");
      }, 1000);
    }, 500);
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
        <TouchableOpacity onPress={() => router.back()}>
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
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Name
            </Text>
            <TextInput
              placeholder="Enter your name"
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
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
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
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                Country
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
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                City
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
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Job
            </Text>
            <TextInput
              placeholder="Enter your job"
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
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Description
            </Text>
            <TextInput
              placeholder="Enter a description"
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
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
              Register as
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
                onPress={() => setRole("1")}
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
                <Text style={{ fontSize: 16, color: "#333" }}>Partner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setRole("2")}
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
                <Text style={{ fontSize: 16, color: "#333" }}>Client</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
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
                autoComplete="new-password"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 5 }}>
                Confirm Password
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
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
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
                {termsAccepted && (
                  <Ionicons name="checkmark" size={18} color="#ff3333" />
                )}
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                I agree to the{" "}
                <Text
                  style={{ color: "#ff3333", textDecorationLine: "underline" }}
                  onPress={() => alert("Terms of Service (Demo Placeholder)")}
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={{ color: "#ff3333", textDecorationLine: "underline" }}
                  onPress={() => alert("Privacy Policy (Demo Placeholder)")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={{ fontSize: 14, color: "#ff3333", marginRight: 16 }}>
                Already registered?
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
              onPress={handleRegister}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                REGISTER
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}