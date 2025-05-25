import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import api from "../../src/config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PartnerNavProps {
  userName?: string; // Make it optional since we'll fetch it from API
}

const PartnerNav: React.FC<PartnerNavProps> = ({ userName: propUserName }) => {
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
        return;
      }

      // Set the authorization header
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUserName(response.data.data.name);
      } else {
        console.error('Failed to fetch user data:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error - maybe redirect to login if token is invalid
      if (error.response?.status === 401) {
        // Token is invalid, redirect to login
        await AsyncStorage.removeItem('authToken');
        router.push('/login');
      }
    }
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/partnerDashboard')}
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
              router.push('/partnerDashboard');
            }}
          >
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/partnerContent');
            }}
          >
            <Text style={styles.navText}>Demandes</Text>
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

// Styles remain the same...
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

export default PartnerNav;