// app/(tabs)/profile/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileScreenProps {
    onCloseProfile: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onCloseProfile }) => {
    return (
        <View style={styles.container}>
            <Text>Profile Page</Text>
            <TouchableOpacity onPress={onCloseProfile}>
                <Text>Close Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProfileScreen;