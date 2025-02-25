import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';
import { format } from 'date-fns';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

interface UserProfile {
    user_id: string;
    mobileNumber: string;
    username: string;
    profilePic: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ProfileComponent() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // New state variables for phone number change
    const [isChangingPhoneNumber, setIsChangingPhoneNumber] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isSubmittingPhoneNumber, setIsSubmittingPhoneNumber] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            const response = await axios.get(`${config.API_URL}/profile/profile/?user_id=${userId}`);

            if (response.status === 200) {
                setProfile(response.data);
                setEditedUsername(response.data.username);

            } else {
                Alert.alert('Error', 'Failed to fetch profile data');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile data');
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUsername = async () => {
        try {
            setIsSaving(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            const response = await axios.put(
                `${config.API_URL}/profile/profile/?user_id=${userId}`,
                {
                    username: editedUsername,
                    profilePic: null  // Setting profilePic to null
                },
                {}
            );

            if (response.status === 200) {
                setProfile(response.data);
                setIsEditingUsername(false);
                Alert.alert('Success', 'Username updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update username');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update username');
            console.error('Error updating username:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const userId = await AsyncStorage.getItem('userId');
                            if (!userId) {
                                Alert.alert('Error', 'User ID not found. Please login again.');
                                return;
                            }

                            const response = await axios.delete(`${config.API_URL}/profile/profile/?user_id=${userId}`);

                            if (response.status === 200) {
                                await AsyncStorage.clear();
                                Alert.alert('Success', 'Account deleted successfully');
                                // Here you would typically navigate to the login screen
                                // navigation.replace('Login');
                            } else {
                                Alert.alert('Error', 'Failed to delete account');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account');
                            console.error('Error deleting account:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleChangePhoneNumber = async () => {

        try {
            setIsSubmittingPhoneNumber(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            const response = await axios.post(
                `${config.API_URL}/profile/profile/change-phone-number/?user_id=${userId}`,
                {
                    new_mobileNumber: newPhoneNumber,
                    otp: otp,
                }
            );

            if (response.status === 200) {
                setProfile(response.data);
                Alert.alert('Success', 'Phone number changed successfully.');
                setIsChangingPhoneNumber(false);  // Go back to profile view

                // Clear the input fields
                setNewPhoneNumber('');
                setOtp('');

                // Refresh the profile data
                fetchProfile();
            } else {
                Alert.alert('Error', 'Failed to change phone number.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to change phone number.');
            console.error('Error changing phone number:', error);
        } finally {
            setIsSubmittingPhoneNumber(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.profileSection}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>USERNAME</Text>
                            <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
                                <FontAwesome name="edit" size={16} color="#0066CC" style={styles.editIcon} />
                            </TouchableOpacity>
                        </View>

                        {isEditingUsername ? (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={editedUsername}
                                    onChangeText={setEditedUsername}
                                    placeholder="Enter username"
                                    placeholderTextColor="#94A3B8"
                                />
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={handleUpdateUsername}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.actionButtonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => setIsEditingUsername(false)}
                                    disabled={isSaving}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.value}>{profile?.username}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.profileSection}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>PHONE NUMBER</Text>
                            <TouchableOpacity onPress={() => setIsChangingPhoneNumber(true)}>
                                <FontAwesome name="edit" size={16} color="#0066CC" style={styles.editIcon} />
                            </TouchableOpacity>
                        </View>
                        {isChangingPhoneNumber ? (
                            <View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Phone Number"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={newPhoneNumber}
                                    onChangeText={setNewPhoneNumber}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="OTP"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="number-pad"
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                                <TouchableOpacity
                                    style={styles.changePhoneNumberButton}
                                    onPress={handleChangePhoneNumber}
                                    disabled={isSubmittingPhoneNumber}
                                >
                                    {isSubmittingPhoneNumber ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.changePhoneNumberButtonText}>Submit</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => setIsChangingPhoneNumber(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.value}>{profile?.mobileNumber}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.profileSection}>
                        <Text style={styles.label}>MEMBER SINCE</Text>
                        <Text style={styles.value}>
                            {format(new Date(profile?.createdAt || ''), 'MMMM dd, yyyy')}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.profileSection}>
                        <Text style={styles.label}>LAST UPDATED</Text>
                        <Text style={styles.value}>
                            {format(new Date(profile?.updatedAt || ''), 'MMMM dd, yyyy, HH:mm')}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.deleteAccount}
                    onPress={handleDeleteAccount}
                >
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the title
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1E3A8A',
    },
    profileCard: {
        margin: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    profileSection: {
        padding: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    editIcon: {
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#334155',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    editActionsContainer: {
        padding: 16,
        gap: 12,
    },
    actionButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#0066CC',
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteAccount: {
        padding: 16,
        margin: 16,
        alignItems: 'center',
    },
    deleteAccountText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    otpInfo: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        textAlign: 'center',
    },
    changePhoneNumberButton: {
        paddingVertical: 14,
        backgroundColor: '#0066CC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    changePhoneNumberButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});