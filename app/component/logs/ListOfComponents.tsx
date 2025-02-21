import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';
import { format } from 'date-fns';

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
    const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);
    const [transcriptDetails, setTranscriptDetails] = useState<TranscriptItem | null>(null);
    const [activeTab, setActiveTab] = useState<'Summary' | 'Transcript' | 'Insight'>('Summary');

    useEffect(() => {
        const fetchTranscripts = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('Error', 'User ID not found. Please login again.');
                    return;
                }

                const response = await axios.get(`${config.API_URL}/transcripts/transcripts/`, {
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

    const fetchTranscriptDetails = async (transcriptId: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            const response = await axios.get(`${config.API_URL}/transcript/transcript/${transcriptId}`, {
                headers: {
                    'user-id': userId,
                },
            });

            if (response.status === 200) {
                setTranscriptDetails(response.data);
            } else {
                Alert.alert('Error', 'Failed to fetch transcript details');
            }
        } catch (error) {
            console.error('Error fetching transcript details:', error);
            Alert.alert('Error', 'Failed to fetch transcript details');
        }
    };

    const handleCardPress = (transcriptId: string) => {
        setSelectedTranscriptId(transcriptId);
        fetchTranscriptDetails(transcriptId);
        setActiveTab('Summary');
    };

    const handleBackPress = () => {
        setSelectedTranscriptId(null);
        setTranscriptDetails(null);
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading transcripts...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: TranscriptItem }) => (
        <TouchableOpacity onPress={() => handleCardPress(item.transcript_id)}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {format(new Date(item.created_at), 'dd MMM yyyy')}
                        </Text>
                        <Text style={styles.time}>
                            {format(new Date(item.created_at), 'HH:mm')}
                        </Text>
                    </View>
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summary} numberOfLines={3} ellipsizeMode="tail">
                            {typeof item.summary === 'string' ? item.summary : ''}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    if (selectedTranscriptId && transcriptDetails) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.dateTimeContainer}>
                        <Text style={styles.dateText}>
                            {format(new Date(transcriptDetails.created_at), 'dd MMM yyyy')}
                        </Text>
                        <Text style={styles.timeText}>
                            {format(new Date(transcriptDetails.created_at), 'HH:mm')}
                        </Text>
                    </View>
                </View>

                <View style={styles.tabButtonsContainer}>
                    {['Summary', 'Transcript', 'Insight'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                activeTab === tab && styles.activeTabButton
                            ]}
                            onPress={() => setActiveTab(tab as 'Summary' | 'Transcript' | 'Insight')}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                activeTab === tab && styles.activeTabButtonText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.contentContainer}>
                    <ScrollView>
                        <Text style={styles.contentText}>
                            {activeTab === 'Summary' && (transcriptDetails.summary?.replace('Summary: ', '') || '')}
                            {activeTab === 'Transcript' && (transcriptDetails.transcript || '')}
                            {activeTab === 'Insight' && (transcriptDetails.insight || '')}
                        </Text>
                    </ScrollView>
                </View>
            </ScrollView>
        );
    }

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
        padding: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        margin: 10,
        elevation: 3,
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
    summaryContainer: {
        flex: 1,
    },
    summary: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    dateTimeContainer: {
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
    },
    tabButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    tabButton: {
        padding: 10,
        backgroundColor: '#eee',
    },
    activeTabButton: {
        backgroundColor: '#ddd',
    },
    tabButtonText: {
        fontSize: 16,
    },
    activeTabButtonText: {
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 24,
        padding: 10,
    },
});