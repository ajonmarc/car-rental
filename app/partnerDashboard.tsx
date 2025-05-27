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
import PartnerNav from '../app/components/PartnerNav';


export default function PartnerDashboard() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />

      <PartnerNav  />
    

      {/* Main Content */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        <View style={{ padding: 20 }}>
     

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
                Manage announcement
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
              onPress={() => router.push("/manageRents")}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Manage Rents
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
              Your Clients
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
                View All Clients
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}