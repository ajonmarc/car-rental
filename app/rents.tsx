// app/Rents
import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ClientNav from './components/ClientNav';




export default function Rents() {



  const [userName] = useState("John Doe"); // Mock






  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />

 
      <ClientNav userName={userName} />

        <Text>rents</Text>
    </SafeAreaView>
  );
}