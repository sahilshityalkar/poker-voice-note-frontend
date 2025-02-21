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

interface UserProfile {
    username: string;
    phone_number: string;
    created_at: string;
}

export default function ProfileComponent() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

            const response = await axios.get(`${config.API_URL}/profile/profile/`, {
                headers: {
                    'user-id': userId,
                },
            });

            if (response.status === 200) {
                setProfile(response.data);
                setEditedUsername(response.data.username);
                setEditedPhoneNumber(response.data.phone_number);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile data');
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsSaving(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            const response = await axios.put(
                `${config.API_URL}/profile/profile/`,
                {
                    username: editedUsername,
                    phone_number: editedPhoneNumber,
                },
                {
                    headers: {
                        'user-id': userId,
                    },
                }
            );

            if (response.status === 200) {
                setProfile(response.data);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
            console.error('Error updating profile:', error);
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

                            const response = await axios.delete(`${config.API_URL}/profile/profile/`, {
                                headers: {
                                    'user-id': userId,
                                },
                            });

                            if (response.status === 200) {
                                await AsyncStorage.clear();
                                Alert.alert('Success', 'Account deleted successfully');
                                // Here you would typically navigate to the login screen
                                // navigation.replace('Login');
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
                    {!isEditing && (
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.profileSection}>
                        <Text style={styles.label}>USERNAME</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={editedUsername}
                                onChangeText={setEditedUsername}
                                placeholder="Enter username"
                                placeholderTextColor="#94A3B8"
                            />
                        ) : (
                            <Text style={styles.value}>{profile?.username}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.profileSection}>
                        <Text style={styles.label}>PHONE NUMBER</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={editedPhoneNumber}
                                onChangeText={setEditedPhoneNumber}
                                placeholder="Enter phone number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.value}>{profile?.phone_number}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.profileSection}>
                        <Text style={styles.label}>MEMBER SINCE</Text>
                        <Text style={styles.value}>
                            {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                {isEditing && (
                    <View style={styles.editActionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={handleUpdate}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.actionButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => setIsEditing(false)}
                            disabled={isSaving}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
        justifyContent: 'space-between',
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
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#E1F0FF',
        borderRadius: 8,
    },
    editButtonText: {
        color: '#0066CC',
        fontSize: 14,
        fontWeight: '600',
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
    input: {
        fontSize: 16,
        color: '#334155',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 16,
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
});