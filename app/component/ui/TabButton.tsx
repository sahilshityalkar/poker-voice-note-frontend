// component/ui/TabButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TabButtonProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={onPress}
        >
            <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tabButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    tabButtonActive: {
        backgroundColor: '#007AFF',
    },
    tabButtonText: {
        fontSize: 16,
        color: '#333',
    },
    tabButtonTextActive: {
        color: '#fff',
    },
});

export default TabButton;