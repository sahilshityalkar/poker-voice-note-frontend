import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../app/config';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [stage, setStage] = useState<'phone' | 'otp' | 'register'>('phone'); // phone -> otp -> register
    const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null); // Display welcome message if existing user
    const router = useRouter();

    const handleAuth = async () => {
        if (!phoneNumber.match(/^[0-9]{10,15}$/)) {
            Alert.alert('Error', 'Please enter a valid phone number (10-15 digits)');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}/auth/auth`,  // Corrected endpoint
                { phone_number: phoneNumber.trim() },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                // Check if the user exists
                if (response.data.status === 'success') {
                    // User exists, show welcome message and OTP input
                    setWelcomeMessage(`Welcome back, ${response.data.username}!`);
                    setStage('otp');
                } else if (response.data.status === 'user_not_found') {
                    // User not found, show username and OTP inputs
                    setStage('register');
                    setWelcomeMessage(null); // Clear any previous message
                }
            } else {
                Alert.alert('Error', `Request failed with status code ${response.status}`);
            }
        } catch (error: any) {
            console.error('Authentication error:', error);
            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            Alert.alert('Error', errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }

        if (stage === 'register' && !username) {
            Alert.alert('Error', 'Please enter a username to register.');
            return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                phone_number: phoneNumber.trim(),
                otp: otp.trim(),
                ...(stage === 'register' ? { username: username.trim() } : {}), // Conditionally add username
            };

            const response = await axios.post(
                `${config.API_URL}/auth/verifyotp`, // call this endpoint
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            // Store authentication data after successful registration
            await Promise.all([
                AsyncStorage.setItem('token', response.data.access_token),
                AsyncStorage.setItem('username', response.data.username),
                AsyncStorage.setItem('userId', response.data.user_id),
            ]);
            router.replace('/(tabs)'); // Direct to main app

        } catch (error: any) {
            console.error('Verify OTP error:', error);
            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.form}>
                {welcomeMessage && (
                    <Text style={styles.welcomeMessage}>{welcomeMessage}</Text>
                )}

                {stage === 'phone' && (
                    <>
                        <Text style={styles.label}>Enter your phone number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (10-15 digits)"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={15}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {(stage === 'otp' || stage === 'register') && (
                    <>
                        {stage === 'register' && (
                            <>
                                <Text style={styles.label}>Enter Username</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    value={username}
                                    onChangeText={setUsername}
                                    editable={!isLoading}
                                />
                            </>
                        )}

                        <Text style={styles.label}>Enter OTP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="OTP"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleVerifyOtp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {stage === 'otp' ? 'Login' : 'Register'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}


            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    form: {
        gap: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    welcomeMessage: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#2e78b7',
    },
});