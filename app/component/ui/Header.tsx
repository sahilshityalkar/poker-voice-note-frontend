// component/ui/Header.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface HeaderProps {
    onGoToProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoToProfile }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
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
            await AsyncStorage.removeItem('userId');
            router.replace('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout');
        }
    };

    //const goToProfile = () => {   remove this because it's defined in the tabs layout file
    //    router.replace('/(tabs)/profile'); // Navigate to the profile page
    //};

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.profileButton} onPress={onGoToProfile}>
                <FontAwesome name="user" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.usernameText}>Welcome, {username}!</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <FontAwesome name="sign-out" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3498db',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    profileButton: {
        // ... styles for profile button
    },
    usernameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    logoutButton: {
        // ... styles for logout button
    },
});

export default Header;