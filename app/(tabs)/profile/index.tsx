// app/(tabs)/profile/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProfileComponent from '../../component/profile/ProfileComponent';

// Remove the interface since onCloseProfile isn't being used
const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <ProfileComponent />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF', // Match the ProfileComponent background
    },
});

export default ProfileScreen;