// component/logs/ListOfComponents.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper'; // Import Card
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config'; // Import your config
import { format } from 'date-fns'; // Import date-fns
import { useNavigation } from '@react-navigation/native';

interface TranscriptItem {
    _id: string;
    transcript_id: string;
    filename: string;
    created_at: string;
    transcript: string;
    user_id: string;
    summary: string;
    insight: string;
}

export default function ListOfComponents() {
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchTranscripts = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('Error', 'User ID not found. Please login again.');
                    return;
                }

                const response = await axios.get(`${config.API_URL}/transcripts/transcripts/`, { // Ensure correct API endpoint
                    headers: {
                        'user-id': userId,
                    },
                });

                if (response.status === 200) {
                    setTranscripts(response.data);
                } else {
                    Alert.alert('Error', 'Failed to fetch transcripts');
                }
            } catch (error) {
                console.error('Error fetching transcripts:', error);
                Alert.alert('Error', 'Failed to fetch transcripts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranscripts();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading transcripts...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: TranscriptItem }) => (
        <TouchableOpacity
            onPress={() => {
                (navigation.navigate as any)('TranscriptDetails', { transcriptId: item.transcript_id });
            }}
            data-transcript-id={item.transcript_id} // Associate transcriptId with the TouchableOpacity
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {format(new Date(item.created_at), 'dd MMM yyyy')}  {/* CHANGED DATE FORMAT */}
                        </Text>
                        <Text style={styles.time}>{format(new Date(item.created_at), 'HH:mm')}</Text>
                    </View>
                    <Text style={styles.summary} numberOfLines={3} ellipsizeMode="tail">{item.summary}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={transcripts}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    listContainer: {
        paddingBottom: 20,  // Add padding to the end of the list
    },
    card: {
        margin: 10,
        elevation: 3,  // Add shadow for a raised effect
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#333',
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
    summary: {
        fontSize: 16,
        lineHeight: 22,
    },
    transcriptId: { // This style is no longer used for display
        display: 'none',
    },
});