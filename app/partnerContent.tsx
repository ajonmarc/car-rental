import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoutButton from "../components/LogoutButton";


// Types
interface User {
  id: string;
  name: string;
  profile_photo_path: any;
}

interface Availability {
  day: string;
  from: string;
  to: string;
}

interface Announcement {
  id: string;
  image1: any;
  car_model: string;
  color: string;
  title: string;
  price: string;
  city: string;
  disponibility: Availability[];
  stat: number;
  premium: string;
}

interface Demand {
  id: string;
  user: User;
  annoncedispo: {
    annonce: {
      image1: any;
      car_model: string;
      title: string;
    };
  };
  reservation_day: string;
  reservation_date: string;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  carModel: string;
  price: string;
  city: string;
  premium: boolean;
  premiumDuration: string;
  days: {
    [key: string]: boolean;
  };
  times: {
    [key: string]: {
      from: string;
      to: string;
    };
  };
  color: string;
  images: any[];
}

// Mock data
const MOCK_DEMANDS: Demand[] = [
  {
    id: "1",
    user: {
      id: "101",
      name: "John Doe",
      profile_photo_path: require("../assets/profile.png"),
    },
    annoncedispo: {
      annonce: {
        image1: require("../assets/car1.png"),
        car_model: "BMW X5",
        title: "BMW X5 Rental",
      },
    },
    reservation_day: "Monday",
    reservation_date: "2025-04-20",
    created_at: "2 days ago",
  },
  {
    id: "2",
    user: {
      id: "102",
      name: "Jane Smith",
      profile_photo_path: require("../assets/profile.png"),
    },
    annoncedispo: {
      annonce: {
        image1: require("../assets/car2.jpg"),
        car_model: "Audi Q7",
        title: "Audi Q7 Lease",
      },
    },
    reservation_day: "Tuesday",
    reservation_date: "2025-04-18",
    created_at: "3 days ago",
  },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    image1: require("../assets/car1.png"),
    car_model: "BMW X5",
    color: "#000000",
    title: "BMW X5 Rental",
    price: "$100/day",
    city: "Tetouan",
    disponibility: [{ day: "Monday", from: "08:00", to: "18:00" }],
    stat: 1,
    premium: "on",
  },
  {
    id: "2",
    image1: require("../assets/car2.jpg"),
    car_model: "Audi Q7",
    color: "#ff0000",
    title: "Audi Q7 Lease",
    price: "$120/day",
    city: "Tanger",
    disponibility: [{ day: "Tuesday", from: "09:00", to: "17:00" }],
    stat: 0,
    premium: "off",
  },
];

// Colors
const COLORS = {
  primary: "#ff3333",
  black: "#000000",
  white: "#ffffff",
  gray: {
    100: "#f7f7f7",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  success: {
    light: "#d1fae5",
    default: "#16a34a",
  },
  red: {
    200: "#fecaca",
    300: "#f87171",
    400: "#ef4444",
    500: "#dc2626",
    600: "#b91c1c",
    700: "#991b1b",
  },
  green: {
    200: "#bbf7d0",
  },
};

// Available car colors
const CAR_COLORS = [
  "#f56565",
  "#231e23",
  "#58391c",
  "#eeecda",
  "#02475e",
  "#ca8a8b",
  "#962d2d",
  "#b2ab8c",
  "#eae3c8",
];

// Available cities
const CITIES = ["Tetouan", "Tanger", "Houceima", "Chefchaouen", "Larache", "Ouazzane"];

// Days of the week
const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Components
const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      backgroundColor: COLORS.white,
      borderRadius: 10,
      padding: 20,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 20,
    }}
  >
    {children}
  </View>
);

const ActionButton = ({ 
  onPress, 
  label, 
  backgroundColor = COLORS.primary, 
  color = COLORS.white,
  icon,
  style = {}
}: { 
  onPress: () => void; 
  label: string; 
  backgroundColor?: string; 
  color?: string;
  icon?: string;
  style?: any;
}) => (
  <TouchableOpacity
    style={{
      backgroundColor,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
    onPress={onPress}
  >
    {icon && <Ionicons name={icon} size={16} color={color} style={{ marginRight: 4 }} />}
    <Text style={{ color, fontSize: 14, fontWeight: "600" }}>{label}</Text>
  </TouchableOpacity>
);

const FormInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false,
  keyboardType = "default",
  style = {}
}: { 
  label: string; 
  value: string; 
  onChangeText: (text: string) => void; 
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad"; 
  style?: any;
}) => (
  <View style={{ marginBottom: 20, ...style }}>
    <Text style={{ fontSize: 14, color: COLORS.white, fontWeight: "600", marginBottom: 5, textTransform: "uppercase" }}>{label}</Text>
    <TextInput
      style={{
        borderWidth: 2,
        borderColor: COLORS.red[300],
        borderRadius: 8,
        padding: 10,
        backgroundColor: "transparent",
        color: COLORS.white,
        ...(multiline ? { height: 100, textAlignVertical: "top" } : {}),
      }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray[400]}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const DayPicker = ({ 
  day, 
  isSelected, 
  onToggle, 
  times, 
  onTimeChange 
}: { 
  day: string; 
  isSelected: boolean; 
  onToggle: () => void; 
  times: { from: string; to: string }; 
  onTimeChange: (field: "from" | "to", value: string) => void;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
    <TouchableOpacity
      style={{
        width: 45,
        height: 40,
        borderRadius: 6,
        backgroundColor: isSelected ? "#ff7f7f" : "#dddddd",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
      }}
      onPress={onToggle}
    >
      <Text
        style={{
          fontSize: 14,
          color: isSelected ? COLORS.white : COLORS.gray[700],
          fontWeight: "600",
        }}
      >
        {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
      </Text>
    </TouchableOpacity>
    
    <View style={{ flex: 1, marginRight: 5 }}>
      <Text style={{ fontSize: 12, color: COLORS.white, textTransform: "uppercase" }}>From</Text>
      <TextInput
        style={{
          borderWidth: 2,
          borderColor: COLORS.red[300],
          borderRadius: 8,
          padding: 5,
          marginTop: 5,
          backgroundColor: "transparent",
          color: COLORS.white,
        }}
        value={times.from}
        onChangeText={(text) => onTimeChange("from", text)}
        placeholder="HH:MM"
        placeholderTextColor={COLORS.gray[400]}
        editable={isSelected}
      />
    </View>
    
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 12, color: COLORS.white, textTransform: "uppercase" }}>To</Text>
      <TextInput
        style={{
          borderWidth: 2,
          borderColor: COLORS.red[300],
          borderRadius: 8,
          padding: 5,
          marginTop: 5,
          backgroundColor: "transparent",
          color: COLORS.white,
        }}
        value={times.to}
        onChangeText={(text) => onTimeChange("to", text)}
        placeholder="HH:MM"
        placeholderTextColor={COLORS.gray[400]}
        editable={isSelected}
      />
    </View>
  </View>
);

export default function PartnerContent() {
  // Hooks
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName] = useState("Jane Partner");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [demands, setDemands] = useState<Demand[]>(MOCK_DEMANDS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    carModel: "",
    price: "",
    city: "",
    premium: false,
    premiumDuration: "7",
    days: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {}),
    times: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { from: "", to: "" } }), {}),
    color: "#f56565",
    images: [],
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when closing modal
  useEffect(() => {
    if (!modalVisible) {
      setTimeout(() => {
        if (!selectedAnnouncement) {
          setFormData({
            title: "",
            description: "",
            carModel: "",
            price: "",
            city: "",
            premium: false,
            premiumDuration: "7",
            days: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {}),
            times: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { from: "", to: "" } }), {}),
            color: "#f56565",
            images: [],
          });
        }
      }, 300);
    }
  }, [modalVisible]);

  // Handlers
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY >= 700);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would fetch data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    
    // Extract days from disponibility
    const activeDays = DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day.toLowerCase()]: announcement.disponibility.some(d => 
        d.day.toLowerCase() === day.toLowerCase()
      )
    }), {});
    
    // Extract times from disponibility
    const dayTimes = DAYS_OF_WEEK.reduce((acc, day) => {
      const dispo = announcement.disponibility.find(
        d => d.day.toLowerCase() === day.toLowerCase()
      );
      return {
        ...acc,
        [day.toLowerCase()]: dispo ? { from: dispo.from, to: dispo.to } : { from: "", to: "" }
      };
    }, {});
    
    setFormData({
      title: announcement.title,
      description: "Sample description", // Mock data
      carModel: announcement.car_model,
      price: announcement.price.replace("/day", ""),
      city: announcement.city,
      premium: announcement.premium === "on",
      premiumDuration: "7", // Default
      days: activeDays,
      times: dayTimes,
      color: announcement.color,
      images: [],
    });
    
    setModalVisible(true);
  };

  const handleEditSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update the announcement in state
      if (selectedAnnouncement) {
        const updatedAnnouncements = announcements.map(announcement => {
          if (announcement.id === selectedAnnouncement.id) {
            // Convert form data to announcement format
            const disponibility = Object.entries(formData.days)
              .filter(([_, isActive]) => isActive)
              .map(([day]) => ({
                day: day.charAt(0).toUpperCase() + day.slice(1),
                from: formData.times[day].from,
                to: formData.times[day].to
              }));
              
            return {
              ...announcement,
              title: formData.title,
              car_model: formData.carModel,
              price: `${formData.price}/day`,
              city: formData.city,
              premium: formData.premium ? "on" : "off",
              color: formData.color,
              disponibility
            };
          }
          return announcement;
        });
        
        setAnnouncements(updatedAnnouncements);
      }
      
      setLoading(false);
      setModalVisible(false);
      setSuccessMessage("Announcement updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const handleAddSubmit = () => {
    // Basic validation
    const newErrors: string[] = [];
    if (!formData.title) newErrors.push("Title is required");
    if (!formData.description) newErrors.push("Description is required");
    if (!formData.carModel) newErrors.push("Car model is required");
    if (!formData.price || isNaN(parseFloat(formData.price))) newErrors.push("Valid price is required");
    if (!formData.city) newErrors.push("City is required");
    const activeDays = Object.entries(formData.days).filter(([_, isActive]) => isActive);
    if (activeDays.length === 0) newErrors.push("At least one day must be selected");
    for (const [day] of activeDays) {
      if (!formData.times[day].from || !formData.times[day].to) {
        newErrors.push(`Time range for ${day} is incomplete`);
      }
    }
    if (!formData.color) newErrors.push("Color is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new announcement
      const disponibility = Object.entries(formData.days)
        .filter(([_, isActive]) => isActive)
        .map(([day]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          from: formData.times[day].from,
          to: formData.times[day].to
        }));

      const newAnnouncement: Announcement = {
        id: (announcements.length + 1).toString(),
        image1: formData.images[0] || require("../assets/car1.png"), // Fallback image
        car_model: formData.carModel,
        color: formData.color,
        title: formData.title,
        price: `${formData.price}/day`,
        city: formData.city,
        disponibility,
        stat: 1,
        premium: formData.premium ? "on" : "off",
      };

      setAnnouncements([...announcements, newAnnouncement]);
      setLoading(false);
      setModalVisible(false);
      setSuccessMessage("Announcement created successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const handleAcceptDemand = (demandId: string) => {
    Alert.alert(
      "Accept Demand",
      "Are you sure you want to accept this rental demand?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            // In a real app, update the demand status via API
            setDemands(demands.filter(demand => demand.id !== demandId));
            setSuccessMessage("Demand accepted successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          } 
        }
      ]
    );
  };

  const handleRefuseDemand = (demandId: string) => {
    Alert.alert(
      "Refuse Demand",
      "Are you sure you want to refuse this rental demand?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Refuse", 
          onPress: () => {
            // In a real app, update the demand status via API
            setDemands(demands.filter(demand => demand.id !== demandId));
            setSuccessMessage("Demand refused successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          } 
        }
      ]
    );
  };

  const handleToggleStatus = (id: string) => {
    const updatedAnnouncements = announcements.map(announcement => {
      if (announcement.id === id) {
        return {
          ...announcement,
          stat: announcement.stat === 1 ? 0 : 1
        };
      }
      return announcement;
    });
    
    setAnnouncements(updatedAnnouncements);
    setSuccessMessage("Status updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteAnnouncement = (id: string) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            setAnnouncements(announcements.filter(announcement => announcement.id !== id));
            setSuccessMessage("Announcement deleted successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          } 
        }
      ]
    );
  };

  // Form handlers
  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: { ...prev.days, [day]: !prev.days[day] },
    }));
  };

  const handleTimeChange = (day: string, field: "from" | "to", value: string) => {
    setFormData(prev => ({
      ...prev,
      times: {
        ...prev.times,
        [day]: { ...prev.times[day], [field]: value },
      },
    }));
  };

  const handleAddAnnouncement = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: "",
      description: "",
      carModel: "",
      price: "",
      city: "",
      premium: false,
      premiumDuration: "7",
      days: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {}),
      times: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { from: "", to: "" } }), {}),
      color: "#f56565",
      images: [],
    });
    setModalVisible(true);
  };

  // Navigation handlers
  const navigateTo = (route: string) => {
    setMenuOpen(false);
    router.push(route);
  };

  // View profile
  const viewProfile = (userId: string) => {
    Alert.alert("Profile", `Viewing user profile ${userId} (Demo)`);
  };

  // Render Demands section
  const renderDemands = () => (
    <SectionCard>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.gray[800], textAlign: "center", marginBottom: 20 }}>
        Demandes
      </Text>

      {successMessage && (
        <View style={{ backgroundColor: COLORS.success.light, padding: 10, borderRadius: 5, marginBottom: 10 }}>
          <Text style={{ color: COLORS.success.default, fontSize: 14, textAlign: "center" }}>
            {successMessage}
          </Text>
        </View>
      )}

      {demands.length === 0 ? (
        <Text style={{ fontSize: 20, color: COLORS.primary, textAlign: "center", marginVertical: 30 }}>
          No rental demands found
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" }}>
          {demands.map((demand) => (
            <View
              key={demand.id}
              style={{
                width: "100%",
                maxWidth: 450,
                backgroundColor: COLORS.white,
                borderRadius: 8,
                overflow: "hidden",
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3.84,
                elevation: 5,
                marginBottom: 20,
              }}
            >
              <Image
                source={demand.annoncedispo.annonce.image1}
                style={{ width: "100%", height: 200, resizeMode: "cover" }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(243, 244, 246, 0.8)",
                  padding: 8,
                }}
              >
                <Image
                  source={demand.user.profile_photo_path}
                  style={{ width: 48, height: 48, borderRadius: 24, marginRight: 10 }}
                />
                <View>
                  <TouchableOpacity onPress={() => viewProfile(demand.user.id)}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.gray[800] }}>
                      {demand.user.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 12, color: COLORS.gray[500] }}>{demand.created_at}</Text>
                </View>
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.gray[800], marginBottom: 8 }}>
                  {demand.annoncedispo.annonce.car_model}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.gray[600], marginBottom: 6 }}>
                  {demand.annoncedispo.annonce.title}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.gray[600], marginBottom: 12 }}>
                  Requested for: {demand.reservation_day}, {demand.reservation_date}
                </Text>
                
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                  <ActionButton
                    label="Accept"
                    onPress={() => handleAcceptDemand(demand.id)}
                    backgroundColor={COLORS.primary}
                    style={{ marginRight: 10 }}
                  />
                  <ActionButton
                    label="Refuse"
                    onPress={() => handleRefuseDemand(demand.id)}
                    backgroundColor={COLORS.black}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );

  // Render Announcements section
  const renderAnnouncements = () => (
    <SectionCard>
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.gray[800] }}>
          Annonces
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 10,
          }}
          onPress={handleAddAnnouncement}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Announcements table - optimized for both mobile and desktop */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginBottom: 10 }}>
        <View>
          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: COLORS.gray[100],
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.gray[300],
            }}
          >
            <Text style={{ width: 150, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Vehicle</Text>
            <Text style={{ width: 150, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Title</Text>
            <Text style={{ width: 100, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Price</Text>
            <Text style={{ width: 100, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>City</Text>
            <Text style={{ width: 150, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Availability</Text>
            <Text style={{ width: 100, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Status</Text>
            <Text style={{ width: 100, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Premium</Text>
            <Text style={{ width: 120, fontWeight: "bold", paddingHorizontal: 10, color: COLORS.gray[700] }}>Actions</Text>
          </View>

          {/* Table Body */}
          {announcements.map((announcement) => (
            <View
              key={announcement.id}
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: COLORS.gray[300],
                paddingVertical: 12,
              }}
            >
              <View style={{ width: 150, paddingHorizontal: 10, flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={announcement.image1}
                  style={{ width: 40, height: 40, borderRadius: 4, marginRight: 10 }}
                />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.gray[800] }} numberOfLines={1}>
                    {announcement.car_model}
                  </Text>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: announcement.color,
                      marginTop: 5,
                    }}
                  />
                </View>
              </View>
              <Text style={{ width: 150, fontSize: 14, color: COLORS.gray[800], paddingHorizontal: 10 }} numberOfLines={2}>
                {announcement.title}
              </Text>
              <Text style={{ width: 100, fontSize: 14, color: COLORS.gray[800], paddingHorizontal: 10 }}>
                {announcement.price}
              </Text>
              <Text style={{ width: 100, fontSize: 14, color: COLORS.gray[800], paddingHorizontal: 10 }}>
                {announcement.city}
              </Text>
              <View style={{ width: 150, paddingHorizontal: 10 }}>
                {announcement.disponibility.map((dispo, index) => (
                  <View key={index} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.gray[800] }}>
                      {dispo.day}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.gray[500] }}>
                      {dispo.from} - {dispo.to}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ width: 100, paddingHorizontal: 10 }}>
                <Text
                  style={{
                    backgroundColor: announcement.stat === 1 ? COLORS.success.default : COLORS.gray[500],
                    color: COLORS.white,
                    fontSize: 12,
                    fontWeight: "600",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  {announcement.stat === 1 ? "Active" : "Inactive"}
                </Text>
              </View>
              <View style={{ width: 100, paddingHorizontal: 10 }}>
                <Text
                  style={{
                    backgroundColor: announcement.premium === "on" ? COLORS.primary : COLORS.gray[500],
                    color: COLORS.white,
                    fontSize: 12,
                    fontWeight: "600",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  {announcement.premium === "on" ? "Enabled" : "Disabled"}
                </Text>
              </View>
              <View style={{ width: 120, flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                <TouchableOpacity
                  style={{ padding: 6 }}
                  onPress={() => handleToggleStatus(announcement.id)}
                >
                  <Ionicons 
                    name={announcement.stat === 1 ? "eye" : "eye-off"} 
                    size={20} 
                    color={announcement.stat === 1 ? COLORS.success.default : COLORS.gray[500]} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ padding: 6 }}
                  onPress={() => openEditModal(announcement)}
                >
                  <Ionicons name="pencil" size={20} color="#2196f3" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ padding: 6 }}
                  onPress={() => handleDeleteAnnouncement(announcement.id)}
                >
                  <Ionicons name="trash" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SectionCard>
  );

  // Render Edit/Add Modal
  const renderEditModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", paddingTop: insets.top }}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Error and Success Messages */}
          {errors.length > 0 && (
            <View style={{ padding: 10 }}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}
          {successMessage && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/logoW.png")} // Replace with actual logo path
              style={styles.logo}
            />
          </View>

          <ScrollView style={{ padding: 20 }}>
            {selectedAnnouncement ? (
              <>
                {/* Edit Announcement Form */}
                <FormInput
                  label="Title"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter title"
                />
                <FormInput
                  label="Description"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter description"
                  multiline={true}
                />
                <FormInput
                  label="Car Model"
                  value={formData.carModel}
                  onChangeText={(text) => setFormData({ ...formData, carModel: text })}
                  placeholder="Enter car model"
                />
                <FormInput
                  label="Price"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="Enter price"
                  keyboardType="numeric"
                />
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>City</Text>
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      onPress={toggleDropdown}
                      style={styles.dropdownButton}
                    >
                      <Text style={{ color: COLORS.white }}>{formData.city || "Select city"}</Text>
                      <Ionicons
                        name={dropdownOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                    {dropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        {CITIES.map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={[
                              styles.dropdownItem,
                              formData.city === city && { backgroundColor: COLORS.gray[100] },
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, city });
                              setDropdownOpen(false);
                            }}
                          >
                            <Text style={{ color: COLORS.white }}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Car Color</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}>
                    {CAR_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: color,
                          margin: 5,
                          borderWidth: formData.color === color ? 2 : 0,
                          borderColor: COLORS.black,
                        }}
                        onPress={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Availability</Text>
                  {DAYS_OF_WEEK.map((day) => (
                    <DayPicker
                      key={day}
                      day={day}
                      isSelected={formData.days[day]}
                      onToggle={() => toggleDay(day)}
                      times={formData.times[day]}
                      onTimeChange={(field, value) => handleTimeChange(day, field, value)}
                    />
                  ))}
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Premium</Text>
                  <Switch
                    value={formData.premium}
                    onValueChange={(value) => setFormData({ ...formData, premium: value })}
                    trackColor={{ false: COLORS.gray[300], true: COLORS.red[300] }}
                    thumbColor={formData.premium ? COLORS.white : COLORS.gray[100]}
                  />
                </View>
                {formData.premium && (
                  <FormInput
                    label="Premium Duration (days)"
                    value={formData.premiumDuration}
                    onChangeText={(text) => setFormData({ ...formData, premiumDuration: text })}
                    placeholder="Enter duration"
                    keyboardType="numeric"
                  />
                )}
                <ActionButton
                  label="Update Announcement"
                  onPress={handleEditSubmit}
                  style={styles.submitButton}
                  backgroundColor={COLORS.red[400]}
                />
              </>
            ) : (
              <>
                {/* Add Announcement Form */}
                <FormInput
                  label="Title Annonce"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Title"
                />
                <FormInput
                  label="Description"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Type your description.."
                  multiline={true}
                />
                <View style={styles.gridContainer}>
                  <FormInput
                    label="Car Model"
                    value={formData.carModel}
                    onChangeText={(text) => setFormData({ ...formData, carModel: text })}
                    placeholder="Car model"
                    style={{ flex: 1, marginRight: 10 }}
                  />
                  <FormInput
                    label="Price"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    placeholder="Price"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>City</Text>
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      onPress={toggleDropdown}
                      style={styles.dropdownButton}
                    >
                      <Text style={{ color: COLORS.white }}>{formData.city || "Select city"}</Text>
                      <Ionicons
                        name={dropdownOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                    {dropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        {CITIES.map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={[
                              styles.dropdownItem,
                              formData.city === city && { backgroundColor: COLORS.gray[100] },
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, city });
                              setDropdownOpen(false);
                            }}
                          >
                            <Text style={{ color: COLORS.white }}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.gridContainer}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                    <Text style={styles.label}>Premium</Text>
                    <View style={styles.toggleContainer}>
                      <Switch
                        value={formData.premium}
                        onValueChange={(value) => setFormData({ ...formData, premium: value })}
                        trackColor={{ false: COLORS.gray[200], true: COLORS.red[300] }}
                        thumbColor={COLORS.white}
                        style={styles.toggle}
                      />
                    </View>
                  </View>
                  {formData.premium && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                      <TouchableOpacity
                        style={[styles.radioButton, formData.premiumDuration === "7" && styles.radioButtonSelected]}
                        onPress={() => setFormData({ ...formData, premiumDuration: "7" })}
                      >
                        <Text style={styles.radioText}>7 Days</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.radioButton, formData.premiumDuration === "15" && styles.radioButtonSelected]}
                        onPress={() => setFormData({ ...formData, premiumDuration: "15" })}
                      >
                        <Text style={styles.radioText}>15 Days</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Availability</Text>
                  <View style={styles.availabilityGrid}>
                    {DAYS_OF_WEEK.map((day) => (
                      <View key={day} style={styles.availabilityRow}>
                        <DayPicker
                          day={day}
                          isSelected={formData.days[day]}
                          onToggle={() => toggleDay(day)}
                          times={formData.times[day]}
                          onTimeChange={(field, value) => handleTimeChange(day, field, value)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Upload Photo</Text>
                  <View style={styles.uploadContainer}>
                    <Text style={styles.uploadText}>
                      {formData.images.length > 0
                        ? formData.images.map((img) => img.name).join(", ")
                        : "Drag your files here or click in this area."}
                    </Text>
                    {/* Note: File input is not directly supported in React Native. 
                       In a real app, use a library like react-native-document-picker or react-native-image-picker */}
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => Alert.alert("File Upload", "File upload functionality to be implemented")}
                    >
                      <Ionicons name="cloud-upload-outline" size={40} color={COLORS.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Select Color</Text>
                  <View style={styles.colorPickerContainer}>
                    <TextInput
                      style={styles.colorInput}
                      value={formData.color}
                      editable={false}
                      placeholder="Pick a color"
                      placeholderTextColor={COLORS.gray[400]}
                    />
                    <TouchableOpacity
                      style={[styles.colorButton, { backgroundColor: formData.color }]}
                      onPress={() => setColorPickerOpen(!colorPickerOpen)}
                    >
                      <Ionicons name="pencil" size={20} color={COLORS.black} />
                    </TouchableOpacity>
                    {colorPickerOpen && (
                      <View style={styles.colorPicker}>
                        <FlatList
                          data={CAR_COLORS}
                          renderItem={({ item: color }) => (
                            <TouchableOpacity
                              style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                formData.color === color && styles.colorOptionSelected,
                              ]}
                              onPress={() => {
                                setFormData({ ...formData, color });
                                setColorPickerOpen(false);
                              }}
                            />
                          )}
                          keyExtractor={(item) => item}
                          numColumns={3}
                          contentContainerStyle={styles.colorPickerGrid}
                        />
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  <ActionButton
                    label="Cancel"
                    onPress={() => setModalVisible(false)}
                    backgroundColor={COLORS.red[700]}
                    style={styles.cancelButton}
                  />
                  <ActionButton
                    label="Create"
                    onPress={handleAddSubmit}
                    backgroundColor={COLORS.red[400]}
                    style={styles.submitButton}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.red[400]} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Styles for the modal
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 8,
      margin: 20,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.gray[300],
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.white,
    },
    errorText: {
      backgroundColor: COLORS.red[200],
      color: COLORS.black,
      fontSize: 12,
      fontWeight: "bold",
      padding: 8,
      borderRadius: 4,
      marginBottom: 5,
    },
    successMessage: {
      backgroundColor: COLORS.green[200],
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    successText: {
      color: COLORS.black,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "center",
    },
    logoContainer: {
      alignItems: "center",
      paddingVertical: 10,
    },
    logo: {
      width: 48,
      height: 48,
      borderWidth: 2,
      borderColor: COLORS.black,
      borderRadius: 24,
    },
    label: {
      fontSize: 12,
      color: COLORS.white,
      fontWeight: "600",
      marginBottom: 5,
      textTransform: "uppercase",
      fontFamily: "monospace",
    },
    dropdownContainer: {
      borderWidth: 2,
      borderColor: COLORS.red[300],
      borderRadius: 8,
      padding: 10,
    },
    dropdownButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dropdownMenu: {
      marginTop: 10,
    },
    dropdownItem: {
      paddingVertical: 8,
      paddingHorizontal: 5,
    },
    gridContainer: {
      flexDirection: "row",
      marginBottom: 20,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    toggleContainer: {
      marginLeft: 12,
    },
    toggle: {
      transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    radioButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 10,
      borderRadius: 4,
      backgroundColor: COLORS.gray[200],
    },
    radioButtonSelected: {
      backgroundColor: COLORS.red[300],
    },
    radioText: {
      color: COLORS.white,
      fontWeight: "bold",
    },
    availabilityGrid: {
      flexDirection: "column",
    },
    availabilityRow: {
      marginBottom: 10,
    },
    uploadContainer: {
      borderWidth: 4,
      borderColor: COLORS.white,
      borderStyle: "dashed",
      borderRadius: 8,
      height: 128,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    uploadText: {
      color: COLORS.white,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    uploadButton: {
      alignItems: "center",
    },
    colorPickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    colorInput: {
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 10,
      flex: 1,
      marginRight: 10,
      color: COLORS.gray[700],
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    colorPicker: {
      position: "absolute",
      right: 0,
      top: 50,
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 10,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    colorPickerGrid: {
      padding: 5,
    },
    colorOption: {
      width: 32,
      height: 32,
      borderRadius: 16,
      margin: 5,
      borderWidth: 4,
      borderColor: COLORS.white,
    },
    colorOptionSelected: {
      borderWidth: 4,
      borderColor: COLORS.black,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    cancelButton: {
      marginRight: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    submitButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
  });

  // Main Render
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[100] }}>
      <StatusBar />
      
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: COLORS.white,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={24} color={COLORS.gray[800]} />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary }}>
          Partner Dashboard
        </Text>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 10, color: COLORS.gray[600] }}>{userName}</Text>
          <TouchableOpacity>
            <Ionicons name="person-circle" size={24} color={COLORS.gray[800]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu */}
      {menuOpen && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: 200,
            backgroundColor: COLORS.white,
            shadowColor: COLORS.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 9,
            borderBottomRightRadius: 8,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.gray[200],
            }}
            onPress={() => navigateTo("/")}
          >
            <Ionicons name="home" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={{ color: COLORS.gray[800] }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.gray[200],
              backgroundColor: COLORS.gray[100],
            }}
          >
            <Ionicons name="car" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>Partner Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.gray[200],
            }}
            onPress={() => navigateTo("/profile")}
          >
            <Ionicons name="person" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={{ color: COLORS.gray[800] }}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
            }}
            onPress={() => navigateTo("/login")}
          >
            <Ionicons name="log-out" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                          <LogoutButton />
            
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {renderDemands()}
        {renderAnnouncements()}
      </ScrollView>

      {/* Edit/Add Modal */}
      {renderEditModal()}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: COLORS.primary,
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: COLORS.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}