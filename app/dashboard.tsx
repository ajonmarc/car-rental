import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClientNav from "./components/ClientNav";
import api from "../src/config/axios";

interface Demande {
  id: number;
  annoncedispo_id: number;
  user_id: number;
  reservation_date: string;
  reservation_day: string;
  state: string;
  feedbackClient: string;
  feedbackArticle: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function Dashboard() {
  const [rents, setRents] = useState<Demande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get<Demande[]>("/auth/client/myRents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRents(response.data);
    } catch (error) {
      console.error("Error fetching rents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRents();
  }, []);

  const cancelRent = async (id: number) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await api.post(
                "/auth/client/cancelRent",
                { id },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const updated = response.data.demande;

              setRents((prev) =>
                prev.map((rent) =>
                  rent.id === updated.id ? { ...rent, state: updated.state } : rent
                )
              );
              Alert.alert("Success", "Reservation cancelled.");
            } catch (error) {
              console.error("Cancel Error:", error);
              Alert.alert("Error", "Failed to cancel reservation.");
            }
          },
        },
      ]
    );
  };

const renderItem = ({ item }: { item: Demande }) => {
  const annonce = item.annoncedispo?.annonce;
  const dispo = item.annoncedispo;

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>Reservation Date: {item.reservation_date}</Text>
      <Text>Day: {dispo?.day}</Text>
      <Text>Time: {dispo?.from} - {dispo?.to}</Text>
      <Text>State: {item.state}</Text>

      {annonce && (
        <>
          <Text style={{ fontWeight: "bold", marginTop: 5 }}>Car Info:</Text>
          <Text>Model: {annonce.car_model}</Text>
          <Text>Color: {annonce.color}</Text>
          <Text>City: {annonce.city}</Text>
          <Text>Price: ₱{annonce.price}</Text>
        </>
      )}

      {item.state !== "cancelled" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelRent(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ClientNav />
      <Text style={styles.header}>Client Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={rents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 10,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
