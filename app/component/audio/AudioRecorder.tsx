// components/AudioRecorder.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // Import router


export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State for uploading
  //const [username, setUsername] = useState('');  //No needs to store username on this component

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please grant audio recording permissions');
          return;
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
       return () => {
      // Cleanup function to stop and unload recording on unmount
      if (recording) {
        stopRecording();
      }
    };
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
      await recording.stopAndUnloadAsync();
      console.log('Recording stopped');

      const uri = recording.getURI();
      console.log('Recording URI:', uri);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      setIsUploading(true); // Start loading indicator
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/x-m4a',
        name: 'recording.m4a',
      } as any);

      console.log('Uploading to:', `${config.API_URL}audio/upload`);

      const userId = await AsyncStorage.getItem('userId'); // Get userId from AsyncStorage
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        router.replace('/login'); // Redirect to login if userId is missing
        return;
      }

      const roomId = '2470cd0e-6576-4fc8-bc6a-bb9745b3d0ee'; // Hardcoded room_id
      const description = 'demo'; // Hardcoded description

      const response = await axios.post(`${config.API_URL}audio/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'room-id': roomId,
          'user-id': userId,
        },
        params: { description: description },
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
      setIsUploading(false); // Stop loading indicator
    }
  };

  const resetRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        await FileSystem.deleteAsync(recording.getURI() || '', { idempotent: true });
      }
    } catch (err) {
      console.error('Error in resetRecording:', err);
      Alert.alert('Error', 'Failed to reset Recording,');
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      {isUploading && (
        <ActivityIndicator size="large" color="#007AFF" />
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Add margin to separate from other elements
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
});