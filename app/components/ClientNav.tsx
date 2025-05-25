import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import api from "../../src/config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ClientNavProps {
  userName?: string; // Make it optional since we'll fetch it from API
}

const ClientNav: React.FC<ClientNavProps> = ({ userName: propUserName }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState(propUserName || 'Loading...');

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found');
        setUserName('Guest');
        return;
      }

      console.log('Making API call to /me endpoint...');
      
      // The authorization header is now set automatically by the interceptor
      const response = await api.get('/auth/me');

      console.log('API Response:', response.data);

      if (response.data.success) {
        setUserName(response.data.data.name);
      } else {
        console.error('Failed to fetch user data:', response.data.message);
        setUserName('Unknown User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      
      // Handle different error cases
      if (error.response?.status === 404) {
        console.error('API endpoint not found. Check your Laravel routes and base URL.');
        setUserName('API Error');
      } else if (error.response?.status === 401) {
        // Token is invalid, redirect to login
        console.log('Unauthorized - redirecting to login');
        await AsyncStorage.removeItem('authToken');
        router.push('/login');
      } else {
        setUserName('Error Loading');
      }
    }
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/dashboard')} // Fixed to go to client dashboard
        >
          <Image
            source={require('../../assets/logoW.png')}
            style={styles.logo}
          />
          <Text style={styles.logoText}>CARS Rent</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name={menuOpen ? 'close' : 'menu'} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <View style={styles.navMenu}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/dashboard');
            }}
          >
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/rents');
            }}
          >
            <Text style={styles.navText}>Rents</Text>
          </TouchableOpacity>
          <View style={styles.navFooter}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Image
                source={require('../../assets/user.jpg')}
                style={styles.profileImage}
              />
              <Text style={styles.profileText}>{userName}</Text>
              <Ionicons name="chevron-down" size={16} color="white" style={styles.chevron} />
            </TouchableOpacity>
          </View>
          {dropdownOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => alert('Profile page (Demo Placeholder)')}
              >
                <Text style={styles.dropdownText}>Profile</Text>
              </TouchableOpacity>
              <LogoutButton />
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navMenu: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: 20,
  },
  navItem: {
    paddingVertical: 10,
  },
  navText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  feedbackButton: {
    marginHorizontal: 10,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  profileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 5,
  },
  dropdown: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ClientNav;