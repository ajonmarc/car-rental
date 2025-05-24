// app/partnerDashboard
import React, { useState, useRef } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LogoutButton from "../components/LogoutButton";


export default function PartnerDashboard() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName] = useState("Jane Partner"); // Mock for demo
  const userRole = "1"; // Partner role

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#000",
          padding: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/partnerDashboard")}
        >
          <Image
            source={require("../assets/logoW.png")}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>CARS Rent</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name={menuOpen ? "close" : "menu"} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.9)",
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: 20,
          }}
        >
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => {
              setMenuOpen(false);
              router.push("/partnerDashboard");
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => {
              setMenuOpen(false);
              alert("Articles page (Demo Placeholder)");
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => {
              setMenuOpen(false);
              router.push("/partnerContent");
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Partner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => {
              setMenuOpen(false);
              router.push("/partnerContent");
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Demandes</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() => alert("Feedback (Demo)")}
            >
              <Ionicons name="chatbox" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Image
                source={require("../assets/car2.jpg")}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
              />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>{userName}</Text>
              <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
          {dropdownOpen && (
            <View style={{ backgroundColor: "#333", borderRadius: 5, padding: 10, marginTop: 5 }}>
              <TouchableOpacity
                style={{ paddingVertical: 8 }}
                onPress={() => alert("Profile page (Demo Placeholder)")}
              >
                <Text style={{ color: "white", fontSize: 14 }}>Profile</Text>
              </TouchableOpacity>
              <LogoutButton />
           
            </View>
          )}
        </View>
      )}

      {/* Main Content */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        <View style={{ padding: 20 }}>
          {/* Welcome Section */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 }}>
              Welcome, {userName}!
            </Text>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Manage your car rental listings and demands as a Partner.
            </Text>
          </View>

          {/* Partner Actions */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 15 }}>
              Partner Actions
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#ff3333",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 5,
                marginBottom: 10,
                alignItems: "center",
              }}
              onPress={() => router.push("/partnerContent")}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Manage Articles
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
              onPress={() => router.push("/partnerContent")}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Manage Demandes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mock Partner Listings */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 15 }}>
              Your Listings
            </Text>
            {[
              { id: "1", title: "BMW X5 Rental", status: "Active" },
              { id: "2", title: "Audi Q7 Lease", status: "Pending" },
            ].map((listing) => (
              <View
                key={listing.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ddd",
                }}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>{listing.title}</Text>
                <Text style={{ fontSize: 16, color: listing.status === "Active" ? "#16a34a" : "#d97706" }}>
                  {listing.status}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={{
                marginTop: 15,
                alignItems: "center",
              }}
              onPress={() => alert("View All Listings (Demo Placeholder)")}
            >
              <Text style={{ color: "#ff3333", fontSize: 16, fontWeight: "600" }}>
                View All Listings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}