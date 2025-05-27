import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PartnerNav from './components/PartnerNav';
import api from "../src/config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManageRents() {
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRents = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await api.get("/auth/partner/incomingRents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRents(response.data);
    } catch (error) {
      console.error("Error fetching rents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await api.post(`/auth/partner/demandes/${id}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRents(); // refresh list after action
    } catch (error) {
      console.error("Action error", error);
    }
  };

  useEffect(() => {
    fetchRents();
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ padding: 15, marginVertical: 5, backgroundColor: "#f2f2f2", borderRadius: 10 }}>
      <Text style={{ fontWeight: "bold" }}>{item.annoncedispo.annonce.title}</Text>
      <Text>Renter: {item.user.name}</Text>
      <Text>Date: {item.reservation_date}</Text>
      <Text>Day: {item.reservation_day}</Text>
      <Text>Status: {item.state}</Text>
      {item.state === 'pending' && (
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity
            style={{ marginRight: 10, padding: 10, backgroundColor: "green", borderRadius: 5 }}
            onPress={() => handleAction(item.id, 'accept')}
          >
            <Text style={{ color: "#fff" }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "red", borderRadius: 5 }}
            onPress={() => handleAction(item.id, 'reject')}
          >
            <Text style={{ color: "#fff" }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <PartnerNav />
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Incoming Rent Requests
        </Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={rents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
