// app/(tabs)/players/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlayersList() {
    return (
        <View style={styles.container}>
            <Text>Players List</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});