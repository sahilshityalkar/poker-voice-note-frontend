// app/(tabs)/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AudioRecorder from '../component/audio/AudioRecorder';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <AudioRecorder />
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