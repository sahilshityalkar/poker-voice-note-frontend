// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AudioRecorder from '../component/audio/AudioRecorder';

export default function AudioRecorderScreen() {
  const [username, setUsername] = useState(''); // State for username

  useEffect(() => {
    // Fetch username from AsyncStorage
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        Alert.alert('Error', 'Failed to load username');
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('userId'); // Clear user ID on logout
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      {/* Display Username */}
      <Text style={styles.usernameText}>Welcome, {username}!</Text>

      <AudioRecorder />

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <FontAwesome
          name="sign-out"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20, // Add padding to top for username
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});