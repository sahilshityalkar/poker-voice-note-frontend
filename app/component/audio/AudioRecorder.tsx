// components/AudioRecorder.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'Please grant audio recording permissions'
          );
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

      console.log('Uploading to:', `${config.API_URL}/audio/upload/`);

      const userId = await AsyncStorage.getItem('userId'); // Get userId from AsyncStorage
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        //router.replace('/login'); // Redirect to login if userId is missing   // router is not defines here
        return;
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'user-id': userId, // Pass the userId in the header
      };

      const response = await axios.post(
        `${config.API_URL}/audio/upload/`,
        formData,
        {
          headers: headers,
        }
      );

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

  // const resetRecording = async () => {    remove this resetRecording function
  //     try {
  //         if (recording) {
  //             await recording.stopAndUnloadAsync();
  //             await FileSystem.deleteAsync(recording.getURI() || '', {
  //                 idempotent: true,
  //             });
  //         }
  //     } catch (err) {
  //         console.error('Error in resetRecording:', err);
  //         Alert.alert('Error', 'Failed to reset Recording,');
  //     } finally {
  //         setRecording(null);
  //         setIsRecording(false);
  //     }
  // };

  return (
    <View style={styles.container}>
      {isUploading && (
        <ActivityIndicator size="large" color="#007AFF" />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome
            name={isRecording ? 'stop-circle' : 'microphone'}
            size={80} // Make the icon larger
            color={isRecording ? '#ff4444' : '#007AFF'}
          />
        </TouchableOpacity>

        {/* Remove the refresh button */}
        {/*  <TouchableOpacity
                    style={styles.button}
                    onPress={resetRecording}
                    disabled={isRecording}
                >
                    <FontAwesome
                        name="refresh"
                        size={50}
                        color={isRecording ? '#cccccc' : '#007AFF'}
                    />
                </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    justifyContent: 'center', 
    alignItems: 'center',  
  },
  buttonContainer: {
    alignItems: 'center',   // Center horizontally
    justifyContent: 'center', // Add this line
    padding: 20,               // Optional: Add padding around the button
    borderRadius: 100,  // Make the button fully rounded
    backgroundColor: '#ddd',   // Add a button background color
    elevation: 5,              // Add a shadow for a raised effect
  },
  recordButton: {
    width: 120,   // Adjust as needed
    height: 120,  // Adjust as needed
    borderRadius: 60, // Make it a circle
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
  recordButtonActive: {
    backgroundColor: '#ffe0e0',
  },
});