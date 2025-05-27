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
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ClientNav from './components/ClientNav';
import api from "../src/config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Rents() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    car_model: '',
    color: '',
    min_price: '',
    max_price: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    car_models: [],
    colors: [],
    price_range: { min: 0, max: 1000 }
  });

  // Booking states
  const [bookingData, setBookingData] = useState({
    reservation_date: '',
    reservation_day: '',
    selected_time_slot: null
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCars();
    loadFilterOptions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, searchQuery, filters]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/client/list');
      if (response.data.success) {
        setCars(response.data.data);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      Alert.alert('Error', 'Failed to load rental cars');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await api.get('/auth/client/filter-options');
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const filterCars = () => {
    let filtered = cars.filter(car => {
      const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           car.car_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           car.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = !filters.city || car.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchesModel = !filters.car_model || car.car_model.toLowerCase().includes(filters.car_model.toLowerCase());
      const matchesColor = !filters.color || car.color.toLowerCase() === filters.color.toLowerCase();
      const matchesMinPrice = !filters.min_price || car.price >= parseInt(filters.min_price);
      const matchesMaxPrice = !filters.max_price || car.price <= parseInt(filters.max_price);

      return matchesSearch && matchesCity && matchesModel && matchesColor && matchesMinPrice && matchesMaxPrice;
    });

    setFilteredCars(filtered);
  };

  const handleBookCar = async () => {
    if (!bookingData.selected_time_slot || !bookingData.reservation_date) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    try {
      const response = await api.post('/auth/client/book', {
        annoncedispo_id: bookingData.selected_time_slot.id,
        reservation_date: bookingData.reservation_date,
        reservation_day: bookingData.reservation_day || new Date(bookingData.reservation_date).toLocaleDateString('en-US', { weekday: 'long' })
      });

      if (response.data.success) {
        Alert.alert('Success', 'Booking request submitted successfully!');
        setBookingModal(false);
        setSelectedCar(null);
        setBookingData({
          reservation_date: '',
          reservation_day: '',
          selected_time_slot: null
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to book car');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCars();
  };

  const renderCarCard = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={() => {
          setSelectedCar(item);
          setModalVisible(true);
        }}
      >
        {item.premium === '1' && (
          <View style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: '#FFD700',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            zIndex: 1
          }}>
            <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>Premium</Text>
          </View>
        )}
        
        <Image
          source={{ uri: item.images[0] || 'https://via.placeholder.com/300x200' }}
          style={{
            width: '100%',
            height: 180,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          resizeMode="cover"
        />
        
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {item.car_model} • {item.color}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>
              {item.city}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#007AFF' }}>
              ${item.price}/day
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={() => {
                setSelectedCar(item);
                setBookingModal(true);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading cars...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />
      <ClientNav />

      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
          Rent a Car
        </Text>
        
        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          marginBottom: 12
        }}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search cars, models, cities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 16 }}
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#007AFF',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            alignSelf: 'flex-start'
          }}
          onPress={() => setFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Cars List */}
      <FlatList
        data={filteredCars}
        renderItem={renderCarCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={{ fontSize: 18, color: '#666', marginTop: 16 }}>No cars found</Text>
          </View>
        }
      />

      {/* Car Details Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Car Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedCar && (
            <ScrollView>
              <Image
                source={{ uri: selectedCar.images[0] || 'https://via.placeholder.com/400x300' }}
                style={{ width: '100%', height: 250 }}
                resizeMode="cover"
              />
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{selectedCar.title}</Text>
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>{selectedCar.description}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Model: {selectedCar.car_model}</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Color: {selectedCar.color}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <Text style={{ fontSize: 16, marginLeft: 8 }}>{selectedCar.city}</Text>
                </View>
                
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 }}>
                  ${selectedCar.price}/day
                </Text>

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Availability:</Text>
                {selectedCar.availability.map((slot, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: slot.available ? '#e8f5e8' : '#ffe8e8',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8
                  }}>
                    <Text style={{ fontWeight: 'bold' }}>{slot.day}</Text>
                    <Text>{slot.from} - {slot.to}</Text>
                    <Text style={{ color: slot.available ? 'green' : 'red' }}>
                      {slot.available ? 'Available' : 'Booked'}
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#007AFF',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 16
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    setBookingModal(true);
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Book This Car</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Booking Modal */}
      <Modal visible={bookingModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Book Car</Text>
            <TouchableOpacity onPress={() => setBookingModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedCar && (
            <ScrollView style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                Booking: {selectedCar.title}
              </Text>
              
              <Text style={{ fontSize: 16, marginBottom: 8 }}>Select Date:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16
                }}
                placeholder="YYYY-MM-DD"
                value={bookingData.reservation_date}
                onChangeText={(text) => setBookingData({...bookingData, reservation_date: text})}
              />

              <Text style={{ fontSize: 16, marginBottom: 8 }}>Available Time Slots:</Text>
              {selectedCar.availability.filter(slot => slot.available).map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: bookingData.selected_time_slot?.id === slot.id ? '#007AFF' : '#f0f0f0',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}
                  onPress={() => setBookingData({
                    ...bookingData,
                    selected_time_slot: slot,
                    reservation_day: slot.day
                  })}
                >
                  <Text style={{
                    color: bookingData.selected_time_slot?.id === slot.id ? '#fff' : '#333',
                    fontWeight: 'bold'
                  }}>
                    {slot.day}
                  </Text>
                  <Text style={{
                    color: bookingData.selected_time_slot?.id === slot.id ? '#fff' : '#333'
                  }}>
                    {slot.from} - {slot.to}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={{
                  backgroundColor: '#28a745',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 24
                }}
                onPress={handleBookCar}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Confirm Booking</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>City:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16
              }}
              placeholder="Enter city"
              value={filters.city}
              onChangeText={(text) => setFilters({...filters, city: text})}
            />

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Car Model:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16
              }}
              placeholder="Enter car model"
              value={filters.car_model}
              onChangeText={(text) => setFilters({...filters, car_model: text})}
            />

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Color:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16
              }}
              placeholder="Enter color"
              value={filters.color}
              onChangeText={(text) => setFilters({...filters, color: text})}
            />

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Price Range:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  flex: 0.45
                }}
                placeholder="Min price"
                value={filters.min_price}
                onChangeText={(text) => setFilters({...filters, min_price: text})}
                keyboardType="numeric"
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  flex: 0.45
                }}
                placeholder="Max price"
                value={filters.max_price}
                onChangeText={(text) => setFilters({...filters, max_price: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#6c757d',
                  padding: 16,
                  borderRadius: 12,
                  flex: 0.45,
                  alignItems: 'center'
                }}
                onPress={() => {
                  setFilters({
                    city: '',
                    car_model: '',
                    color: '',
                    min_price: '',
                    max_price: ''
                  });
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  padding: 16,
                  borderRadius: 12,
                  flex: 0.45,
                  alignItems: 'center'
                }}
                onPress={() => {
                  setFilterModal(false);
                  filterCars();
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}