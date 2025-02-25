// app/(tabs)/players/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PlayersComponent from '../../component/players/PlayersComponent';

export default function PlayersList() {
    return (
        <View style={styles.container}>
            <PlayersComponent />
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