// app/dashboard
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



interface Announcement {
  id: string;
  title: string;
  description: string;
  image1: any;
  feedbackCount: number;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error";
  timestamp: string;
}

// Mock data for demo
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Luxury Mercedes Sedan",
    description: "Experience luxury with this premium Mercedes sedan, equipped with leather seats and advanced navigation.",
    image1: require("../assets/car1.png"),
    feedbackCount: 8,
  },
  {
    id: "2",
    title: "Porsche 911 Sports Car",
    description: "Feel the thrill of the Porsche 911, perfect for speed enthusiasts and weekend getaways.",
    image1: require("../assets/car2.jpg"),
    feedbackCount: 5,
  },
  {
    id: "3",
    title: "Range Rover SUV",
    description: "Ideal for family adventures, this Range Rover offers spacious interiors and off-road capabilities.",
    image1: require("../assets/car3.png"),
    feedbackCount: 12,
  },
  {
    id: "4",
    title: "Tesla Model S",
    description: "Go electric with the Tesla Model S, featuring cutting-edge technology and zero emissions.",
    image1: require("../assets/car1.png"),
    feedbackCount: 3,
  },
];

const mockCities = ["New York", "Los Angeles", "Chicago", "Miami", "Seattle"];
const mockCarModels = ["Sedan", "SUV", "Sports Car", "Electric", "Convertible"];
const mockColors = ["#000000", "#FFFFFF", "#FF3333", "#00FF00", "#0000FF", "#FFFF00"];



export default function Dashboard() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    car_model: "",
    color: "",
    price: "",
    date: "",
    from: "",
    to: "",
  });
  const [userRole] = useState("2"); // Mock: 1 for Partner, 2 for Client
  const [userName] = useState("John Doe"); // Mock
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState(mockAnnouncements);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotification, setVisibleNotification] = useState<Notification | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      fadeAnim.setValue(0);
    };
  }, []);

  // Function to add a notification
  const addNotification = (message: string, type: "success" | "error") => {
    const newNotification: Notification = {
      id: Math.random().toString(),
      message,
      type,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setVisibleNotification(newNotification);

    // Animate notification in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide notification after 3 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisibleNotification(null));
    }, 3000);
  };

  const handleSearch = () => {
    const filtered = mockAnnouncements.filter((announcement) => {
      const matchesCity = searchFilters.city
        ? announcement.title.toLowerCase().includes(searchFilters.city.toLowerCase())
        : true;
      const matchesModel = searchFilters.car_model
        ? announcement.title.toLowerCase().includes(searchFilters.car_model.toLowerCase())
        : true;
      const matchesPrice = searchFilters.price
        ? announcement.title.includes(searchFilters.price)
        : true;
      return matchesCity && matchesModel && matchesPrice;
    });
    setFilteredAnnouncements(filtered.length > 0 ? filtered : mockAnnouncements);
    addNotification("Search applied successfully!", "success");
  };

  const handleReset = () => {
    setSearchFilters({
      city: "",
      car_model: "",
      color: "",
      price: "",
      date: "",
      from: "",
      to: "",
    });
    setFilteredAnnouncements(mockAnnouncements);
    addNotification("Filters reset successfully!", "success");
  };

  const handleBookCar = (title: string) => {
    // Simulate a booking transaction
    const success = Math.random() > 0.2; // 80% chance of success for demo
    if (success) {
      addNotification(`Successfully booked ${title}!`, "success");
    } else {
      addNotification(`Failed to book ${title}. Please try again.`, "error");
    }
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 10,
        width: "90%",
        alignSelf: "center",
        height: 450,
      }}
    >
      <Image
        source={item.image1}
        style={{ width: "100%", height: 256, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      />
      <View style={{ padding: 10, flex: 1, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
            {item.title.length > 50 ? item.title.substring(0, 50) + "..." : item.title}
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 5 }}>
            {item.description.length > 100 ? item.description.substring(0, 100) + "..." : item.description}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => handleBookCar(item.title)}>
            <Text style={{ fontSize: 12, color: "#991b1b", fontWeight: "600" }}>Book Now</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="chatbubbles" size={16} color="#ff3333" style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 12, color: "#666" }}>{item.feedbackCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotification = () => {
    if (!visibleNotification) return null;
    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 80,
          left: 20,
          right: 20,
          backgroundColor: visibleNotification.type === "success" ? "#16a34a" : "#dc2626",
          padding: 15,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          opacity: fadeAnim,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
          {visibleNotification.message}
        </Text>
      </Animated.View>
    );
  };

  const renderNotificationHistory = () => (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.9)",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        padding: 20,
        paddingTop: 60,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Notification History</Text>
        <TouchableOpacity onPress={() => setShowNotificationHistory(false)}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.type === "success" ? "#16a34a" : "#dc2626",
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>{item.message}</Text>
            <Text style={{ color: "white", fontSize: 12, marginTop: 5 }}>{item.timestamp}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "white", fontSize: 16, textAlign: "center", marginTop: 20 }}>
            No notifications yet
          </Text>
        }
      />
    </View>
  );

  const renderFilterSection = () => (
    <View style={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderWidth: 1,
          borderColor: "#ddd",
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
        <View
          style={{
            backgroundColor: "#ff3333",
            padding: 8,
            borderRadius: 5,
            alignSelf: "flex-start",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
            <Ionicons name="filter" size={14} color="white" /> Choose your filter
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <View style={{ width: "48%", marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
              City
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
              }}
            >
              {mockCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={{ paddingVertical: 5 }}
                  onPress={() => setSearchFilters({ ...searchFilters, city })}
                >
                  <Text style={{ fontSize: 16, color: searchFilters.city === city ? "#ff3333" : "#333" }}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ width: "48%", marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
              Car Model
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
              }}
            >
              {mockCarModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={{ paddingVertical: 5 }}
                  onPress={() => setSearchFilters({ ...searchFilters, car_model: model })}
                >
                  <Text style={{ fontSize: 16, color: searchFilters.car_model === model ? "#ff3333" : "#333" }}>
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ width: "48%", marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
              Colors
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={searchFilters.color}
                placeholder="Pick a color"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  padding: 12,
                  fontSize: 16,
                }}
                editable={false}
              />
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: searchFilters.color || "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 10,
                  borderWidth: 1,
                  borderColor: "#ddd",
                }}
                onPress={() => setColorPickerOpen(!colorPickerOpen)}
              >
                <Ionicons name="color-palette" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            {colorPickerOpen && (
              <View
                style={{
                  position: "absolute",
                  top: 100,
                  right: 20,
                  backgroundColor: "white",
                  borderRadius: 5,
                  padding: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  zIndex: 100,
                }}
              >
                <View style={{ flexDirection: "row", flexWrap: "wrap", width: 120 }}>
                  {mockColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: color,
                        margin: 5,
                        borderWidth: searchFilters.color === color ? 2 : 1,
                        borderColor: searchFilters.color === color ? "#000" : "#ddd",
                      }}
                      onPress={() => {
                        setSearchFilters({ ...searchFilters, color });
                        setColorPickerOpen(false);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={{ width: "48%", marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
              Price
            </Text>
            <TextInput
              placeholder="Enter price (e.g., 100)"
              value={searchFilters.price}
              onChangeText={(text) => setSearchFilters({ ...searchFilters, price: text })}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
              keyboardType="numeric"
            />
          </View>

          <View style={{ width: "48%", marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
              Day
            </Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={searchFilters.date}
              onChangeText={(text) => setSearchFilters({ ...searchFilters, date: text })}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ width: "48%", marginBottom: 15 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "48%" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
                  From
                </Text>
                <TextInput
                  placeholder="HH:MM"
                  value={searchFilters.from}
                  onChangeText={(text) => setSearchFilters({ ...searchFilters, from: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 5,
                    padding: 12,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ width: "48%" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 }}>
                  To
                </Text>
                <TextInput
                  placeholder="HH:MM"
                  value={searchFilters.to}
                  onChangeText={(text) => setSearchFilters({ ...searchFilters, to: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 5,
                    padding: 12,
                    fontSize: 16,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#f87171",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 5,
              marginRight: 10,
            }}
            onPress={handleReset}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#ff3333",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 5,
            }}
            onPress={handleSearch}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 20 }}>
      <TouchableOpacity
        style={{ padding: 10 }}
        onPress={() => addNotification("Previous page accessed (Demo)", "success")}
      >
        <Text style={{ color: "#ff3333", fontSize: 16 }}>Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ padding: 10 }}
        onPress={() => addNotification("Next page accessed (Demo)", "success")}
      >
        <Text style={{ color: "#ff3333", fontSize: 16 }}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />

 
      <ClientNav userName={userName} />


      {showNotificationHistory && renderNotificationHistory()}

      <FlatList
        data={filteredAnnouncements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderFilterSection}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ flex: 1, backgroundColor: "#f7f7f7" }}
      />

      {renderNotification()}
    </SafeAreaView>
  );
}