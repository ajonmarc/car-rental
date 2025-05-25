import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  SafeAreaView,
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
  ImageBackground,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import PartnerNav from "./components/PartnerNav";
import api from "../src/config/axios";

// Constants
const CITIES = ["Tetouan", "Tanger", "Houceima", "Chefchaouen", "Larache", "Ouazzane"];
const COLORS = ["#f56565", "#231e23", "#58391c", "#eeecda", "#02475e", "#ca8a8b", "#962d2d", "#b2ab8c", "#eae3c8"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Initial form state
const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  car_model: "",
  city: "",
  color: "#f56565",
  price: "",
  premium: false,
  premium_duration: "7",
  availability: DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: { selected: false, from: "", to: "" },
  }), {}),
};

export default function PartnerContent() {
  const [userName] = useState("Jane Partner");
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
    fetchAnnouncements();
  }, []);

  // Request image picker permissions
  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera roll permissions are required to upload images.");
      }
    }
  };

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/auth/partner/list");
      setAnnouncements(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch announcements error:", error);
      Alert.alert("Error", "Failed to fetch announcements. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.car_model.trim()) newErrors.car_model = "Car model is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.price || isNaN(parseFloat(form.price))) newErrors.price = "Valid price is required";

    // Validate availability times
    const hasSelectedDays = Object.values(form.availability).some((day) => day.selected);
    if (!hasSelectedDays) {
      newErrors.availability = "Please select at least one day";
    } else {
      Object.entries(form.availability).forEach(([dayName, day]) => {
        if (day.selected) {
          if (!day.from || !day.to) {
            newErrors[`${dayName}_time`] = "Time is required for selected days";
          } else if (day.from >= day.to) {
            newErrors[`${dayName}_time`] = "End time must be after start time";
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input change
  const handleInputChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Handle availability change
  const handleAvailabilityChange = useCallback((day, field, value) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], [field]: value },
      },
    }));

    if (errors.availability || errors[`${day}_time`]) {
      setErrors((prev) => ({
        ...prev,
        availability: null,
        [`${day}_time`]: null,
      }));
    }
  }, [errors]);

  // Handle image picker
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => ({ uri: asset.uri }));
        setImages(selectedImages);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  // Open modal for creating or editing
  const openModal = useCallback((announcement = null) => {
    if (announcement) {
      setIsEditing(true);
      setCurrentAnnouncement(announcement);
      setForm({
        title: announcement.title || "",
        description: announcement.description || "",
        car_model: announcement.car_model || "",
        city: announcement.city || "",
        color: announcement.color || "#f56565",
        price: announcement.price ? announcement.price.toString() : "",
        premium: announcement.premium || false,
        premium_duration: announcement.premium_duration || "7",
        availability: announcement.availability || INITIAL_FORM_STATE.availability,
      });
      setImages(announcement.images || []);
    } else {
      setIsEditing(false);
      setCurrentAnnouncement(null);
      setForm(INITIAL_FORM_STATE);
      setImages([]);
    }
    setErrors({});
    setModalVisible(true);
  }, []);

  // Submit announcement
  const submitAnnouncement = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please check all required fields");
      return;
    }

    try {
      setLoading(true);
      const endpoint = isEditing ? "/auth/partner/update" : "/auth/partner/save";
      const method = isEditing ? "put" : "post";

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "availability") {
          formData.append(key, value);
        }
      });

      if (isEditing && currentAnnouncement?.id) {
        formData.append("id", currentAnnouncement.id.toString());
      }

      Object.entries(form.availability).forEach(([day, data]) => {
        if (data.selected) {
          formData.append(`availability[${day}][selected]`, "1");
          formData.append(`availability[${day}][from]`, data.from);
          formData.append(`availability[${day}][to]`, data.to);
        }
      });

      images.forEach((image, index) => {
        if (image.uri) {
          formData.append(`images[${index}]`, {
            uri: image.uri,
            name: `image${index}.jpg`,
            type: "image/jpeg",
          });
        }
      });

      const response = await api({
        method,
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        setModalVisible(false);
        await fetchAnnouncements();
      } else {
        throw new Error(response.data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save announcement";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
  const deleteAnnouncement = useCallback(
    (id) => {
      Alert.alert("Confirm Delete", "Are you sure you want to delete this announcement?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete("/auth/partner/delete", {
                data: { id },
              });

              if (response.data.success) {
                Alert.alert("Success", "Announcement deleted successfully");
                await fetchAnnouncements();
              } else {
                throw new Error(response.data.message || "Delete failed");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete announcement");
            }
          },
        },
      ]);
    },
    [fetchAnnouncements]
  );

  // Render announcement item
  const renderAnnouncement = useCallback(
    ({ item }) => (
      <View style={styles.announcementCard}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementText}>Car: {item.car_model}</Text>
        <Text style={styles.announcementText}>City: {item.city}</Text>
        <Text style={styles.announcementText}>Price: ${item.price}</Text>
        <Text style={styles.announcementText}>Premium: {item.premium ? "Yes" : "No"}</Text>

        {item.images && item.images.length > 0 && (
          <ScrollView horizontal style={styles.imageScrollView}>
            {item.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: typeof image === "string" ? image : image.uri }}
                style={styles.announcementImage}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAnnouncement(item.id)}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [openModal, deleteAnnouncement]
  );

  // Render error message
  const renderError = (fieldName) => {
    return errors[fieldName] ? <Text style={styles.errorText}>{errors[fieldName]}</Text> : null;
  };

  return (
    <ImageBackground source={{ uri: "/img/back22.jpg" }} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <PartnerNav userName={userName} />

        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View style={styles.card}>
              <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New Announcement</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={50} color="#fff" />
              <Text style={styles.emptyText}>No announcements found</Text>
              <Text style={styles.emptySubText}>Create your first announcement to get started</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
        />

        {/* Modal for Create/Edit */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Announcement" : "Create Announcement"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="Enter announcement title"
                  placeholderTextColor="#aaa"
                  value={form.title}
                  onChangeText={(text) => handleInputChange("title", text)}
                />
                {renderError("title")}
              </View>

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                  placeholder="Enter detailed description"
                  placeholderTextColor="#aaa"
                  value={form.description}
                  onChangeText={(text) => handleInputChange("description", text)}
                  multiline
                  numberOfLines={4}
                />
                {renderError("description")}
              </View>

              {/* Car Model Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Car Model *</Text>
                <TextInput
                  style={[styles.input, errors.car_model && styles.inputError]}
                  placeholder="e.g., Toyota Camry 2020"
                  placeholderTextColor="#aaa"
                  value={form.car_model}
                  onChangeText={(text) => handleInputChange("car_model", text)}
                />
                {renderError("car_model")}
              </View>

              {/* Price Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Price per Day ($) *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="Enter daily rental price"
                  placeholderTextColor="#aaa"
                  value={form.price}
                  onChangeText={(text) => handleInputChange("price", text)}
                  keyboardType="numeric"
                />
                {renderError("price")}
              </View>

              {/* City Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>City *</Text>
                <View style={styles.picker}>
                  {CITIES.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.pickerItem, form.city === city && styles.pickerItemSelected]}
                      onPress={() => handleInputChange("city", city)}
                    >
                      <Text
                        style={[styles.pickerText, form.city === city && styles.pickerTextSelected]}
                      >
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {renderError("city")}
              </View>

              {/* Color Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Car Color</Text>
                <View style={styles.colorPicker}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        form.color === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => handleInputChange("color", color)}
                    />
                  ))}
                </View>
              </View>

              {/* Premium Toggle */}
              <View style={styles.inputContainer}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Premium Listing</Text>
                  <Switch
                    value={form.premium}
                    onValueChange={(value) => handleInputChange("premium", value)}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={form.premium ? "#f5dd4b" : "#f4f3f4"}
                  />
                </View>
                <Text style={styles.helpText}>
                  Premium listings get better visibility and appear at the top
                </Text>
              </View>

              {/* Premium Duration (if premium is selected) */}
              {form.premium && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Premium Duration</Text>
                  <View style={styles.durationPicker}>
                    <TouchableOpacity
                      style={[
                        styles.durationOption,
                        form.premium_duration === "7" && styles.durationOptionSelected,
                      ]}
                      onPress={() => handleInputChange("premium_duration", "7")}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          form.premium_duration === "7" && styles.durationTextSelected,
                        ]}
                      >
                        7 Days
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.durationOption,
                        form.premium_duration === "15" && styles.durationOptionSelected,
                      ]}
                      onPress={() => handleInputChange("premium_duration", "15")}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          form.premium_duration === "15" && styles.durationTextSelected,
                        ]}
                      >
                        15 Days
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Image Upload */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Images (Optional)</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
                  <Ionicons name="camera-outline" size={24} color="#007AFF" />
                  <Text style={styles.imagePickerText}>
                    {images.length > 0 ? `${images.length} image(s) selected` : "Select Images"}
                  </Text>
                </TouchableOpacity>

                {images.length > 0 && (
                  <ScrollView horizontal style={styles.selectedImagesContainer}>
                    {images.map((image, index) => (
                      <View key={index} style={styles.selectedImageContainer}>
                        <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        >
                          <Ionicons name="close-circle" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Availability Section */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Availability *</Text>
                {renderError("availability")}

                {DAYS.map((day) => (
                  <View key={day} style={styles.availabilityDay}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayLabel}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                      <Switch
                        value={form.availability[day].selected}
                        onValueChange={(value) => handleAvailabilityChange(day, "selected", value)}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={form.availability[day].selected ? "#f5dd4b" : "#f4f3f4"}
                      />
                    </View>

                    {form.availability[day].selected && (
                      <View style={styles.timeContainer}>
                        <View style={styles.timeInput}>
                          <Text style={styles.timeLabel}>From:</Text>
                          <TextInput
                            style={[styles.timeField, errors[`${day}_time`] && styles.inputError]}
                            placeholder="HH:MM"
                            placeholderTextColor="#aaa"
                            value={form.availability[day].from}
                            onChangeText={(text) => handleAvailabilityChange(day, "from", text)}
                          />
                        </View>
                        <View style={styles.timeInput}>
                          <Text style={styles.timeLabel}>To:</Text>
                          <TextInput
                            style={[styles.timeField, errors[`${day}_time`] && styles.inputError]}
                            placeholder="HH:MM"
                            placeholderTextColor="#aaa"
                            value={form.availability[day].to}
                            onChangeText={(text) => handleAvailabilityChange(day, "to", text)}
                          />
                        </View>
                      </View>
                    )}
                    {errors[`${day}_time`] && (
                      <Text style={styles.errorText}>{errors[`${day}_time`]}</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Submit Button */}
              <View style={styles.submitContainer}>
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={submitAnnouncement}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isEditing ? "Update Announcement" : "Create Announcement"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    backdropFilter: "blur(10px)",
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  announcementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  announcementTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  announcementText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  imageScrollView: {
    marginVertical: 10,
  },
  announcementImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  // Picker Styles
  picker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pickerItemSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  pickerText: {
    color: "#ccc",
    fontSize: 14,
  },
  pickerTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  // Color Picker Styles
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#fff",
    borderWidth: 3,
  },
  // Switch Styles
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helpText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  // Duration Picker Styles
  durationPicker: {
    flexDirection: "row",
    gap: 12,
  },
  durationOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flex: 1,
    alignItems: "center",
  },
  durationOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  durationText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "500",
  },
  durationTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderStyle: "dashed",
  },
  imagePickerText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  selectedImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  // Availability Styles
  availabilityDay: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeInput: {
    flex: 0.48,
  },
  timeLabel: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  timeField: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    padding: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  // Submit Button Styles
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  submitButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});