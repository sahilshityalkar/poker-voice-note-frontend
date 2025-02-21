// app/(tabs)/_layout.tsx
import React, { useState, useRef } from 'react'; // Import useRef
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import Header from '../component/ui/Header';
import TabButton from '../component/ui/TabButton';
import ProfileScreen from './profile/index';
import PlayersList from './players/index';
import LogsList from './logs/index';
import AudioRecorder from './index';

export default function TabLayout() {
    const [activeTab, setActiveTab] = useState('Recorder');
    const [showProfile, setShowProfile] = useState(false);
    const previousTab = useRef<string>('Recorder'); // Store the previous tab

    const handleTabPress = (tabName: string) => {
        previousTab.current = tabName; // Store the current tab
        setActiveTab(tabName);
        setShowProfile(false); // Hide profile when tab changes
    };

    const handleGoToProfile = () => {
        previousTab.current = activeTab; // Store the current tab
        setShowProfile(true); // Show profile when profile button is pressed
    };

    const handleCloseProfile = () => {
        setShowProfile(false); // Hide profile from within profile screen
        setActiveTab(previousTab.current); // Reset the tab
    };

    const renderComponent = () => {
        if (showProfile) {
            return <ProfileScreen onCloseProfile={handleCloseProfile} />;
        }

        switch (activeTab) {
            case 'Players':
                return <PlayersList />;
            case 'Recorder':
                return <AudioRecorder />;
            case 'Logs':
                return <LogsList />;
            default:
                return <AudioRecorder />;
        }
    };

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <Header onGoToProfile={handleGoToProfile} />
            <View style={{ flex: 1 }}>{renderComponent()}</View>
            <View style={styles.tabContainer}>
                <TabButton
                    title="Players"
                    isActive={activeTab === 'Players'}
                    onPress={() => handleTabPress('Players')}
                />
                <TabButton
                    title="Recorder"
                    isActive={activeTab === 'Recorder'}
                    onPress={() => handleTabPress('Recorder')}
                />
                <TabButton
                    title="Logs"
                    isActive={activeTab === 'Logs'}
                    onPress={() => handleTabPress('Logs')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
});