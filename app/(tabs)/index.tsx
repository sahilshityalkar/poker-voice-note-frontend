import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native'; // Import Text
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function AudioRecorderScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [username, setUsername] = useState(''); // State for username

  useEffect(() => {
    // Request permissions when component mounts
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please grant audio recording permissions');
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Failed to get recording permissions');
      }
    };

    getPermissions();

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

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (!recording) {
      console.log('No recording to stop');
      setIsRecording(false);
      return;
    }

    try {
      // Stop recording
      await recording.stopAndUnloadAsync();
      console.log('Recording stopped');

      const uri = recording.getURI();
      console.log('Recording URI:', uri);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/x-m4a',
        name: 'recording.m4a',
      } as any);

      console.log('Uploading to:', `${config.API_URL}audio/upload`);

      // Use stored user ID here as well
      const userId = await AsyncStorage.getItem('userId'); // Get userId from AsyncStorage
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        router.replace('/login'); // Redirect to login if userId is missing
        return;
      }

      const roomId = '2470cd0e-6576-4fc8-bc6a-bb9745b3d0ee'; // Hardcoded room_id
      const description = 'demo'; // Hardcoded description

      // Upload file
      const response = await axios.post(`${config.API_URL}audio/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'room-id': roomId, // Add room-id to headers
          'user-id': userId, // Add user-id to headers
        },
        params: { description: description },  //Adding description as query parameter
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Recording uploaded successfully');
      }
    } catch (err: any) {
      console.log(err.response?.data);
      console.log(err.response?.status);
      console.log(err.response?.headers);
      console.log(err.response?.message);
      console.error('Error in stopRecording:', err);
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setIsRecording(false);
      setRecording(null);
    }
  };

  const resetRecording = () => {
    try {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    } catch (err) {
      console.error('Error in resetRecording:', err);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome
            name={isRecording ? 'stop-circle' : 'microphone'}
            size={50}
            color={isRecording ? '#ff4444' : '#007AFF'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={resetRecording}
          disabled={isRecording}
        >
          <FontAwesome
            name="refresh"
            size={50}
            color={isRecording ? '#cccccc' : '#007AFF'}
          />
        </TouchableOpacity>
      </View>

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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: '#ffe0e0',
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