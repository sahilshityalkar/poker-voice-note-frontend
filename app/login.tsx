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
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../app/config'; // Import config from the correct path

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [storedPhoneNumber, setStoredPhoneNumber] = useState('');
    const router = useRouter();

    //const API_URL = "http://192.168.11.229:8000"; // Remove the temporary hardcoded IP

    const handleSendOtp = async () => {
        if (!phoneNumber.match(/^[0-9]{10,15}$/)) {
            Alert.alert('Error', 'Please enter a valid phone number (10-15 digits)');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}auth/sendotp`, // Use the value from the app/config
                {
                    phone_number: phoneNumber.trim(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'OTP sent successfully');
                setShowOtpInput(true);
                setStoredPhoneNumber(phoneNumber.trim());
            } else {
                Alert.alert('Error', `Request failed with status code ${response.status}`);
            }
        } catch (error: any) {
            console.error('Send OTP error:', error);

            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);

                if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            } else if (error.request) {
                errorMessage = 'No response received from the server. Please check your internet connection.';
                console.error('No response received:', error.request);
            } else {
                errorMessage = error.message;
                console.error('Error during request setup:', error.message);
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

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}auth/verifyotp`, // Use the value from the app/config
                {
                    phone_number: storedPhoneNumber,
                    otp: otp.trim(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            await Promise.all([
                AsyncStorage.setItem('token', response.data.access_token),
                AsyncStorage.setItem('username', response.data.username),
                AsyncStorage.setItem('userId', response.data.user_id),
            ]);

            router.replace('/(tabs)');

        } catch (error: any) {
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
            <View style={styles.form}>
                {!showOtpInput ? (
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
                            onPress={handleSendOtp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Enter OTP sent to {storedPhoneNumber}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="numeric"
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
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                setShowOtpInput(false);
                                setOtp('');
                                setPhoneNumber('');
                                setStoredPhoneNumber('');
                            }}
                        >
                            <Text style={styles.backButtonText}>Change Phone Number</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.registerContainer}>
                    <Text>Don't have an account? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.registerLink}>Register</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
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
    backButton: {
        padding: 10,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerLink: {
        color: '#007AFF',
        fontWeight: '600',
    },
});