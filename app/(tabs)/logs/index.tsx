// app/(tabs)/logs/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ListOflogs from '../../component/logs/ListOfComponents';

export default function LogsList() {
    return (
        <View style={styles.container}>
            <ListOflogs />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5', // Optional: Add a background color
    },
});