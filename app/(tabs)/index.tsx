import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import config from '../config';

export default function AudioRecorderScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      console.log('Uploading to:', `${config.API_URL}/audio/upload`);
      
      // Upload file
      const response = await axios.post(`${config.API_URL}/audio/upload/?description=demo`, formData,);

      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        Alert.alert('Success', 'Recording uploaded successfully');
      }
    } catch (err: any) {
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
      console.log(err.response.message);
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

  return (
    <View style={styles.container}>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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