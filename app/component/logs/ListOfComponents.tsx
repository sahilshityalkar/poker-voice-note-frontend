import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Loading transcripts...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: TranscriptItem }) => (
        <TouchableOpacity
            onPress={() => handleCardPress(item.transcript_id)}
            activeOpacity={0.7}
            style={styles.cardWrapper}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
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
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.dateTimeContainer}>
                        <Text style={styles.dateText}>
                            {format(new Date(transcriptDetails.created_at), 'MMM dd, yyyy')}
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

                <ScrollView
                    style={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.contentText}>
                        {activeTab === 'Summary' && (transcriptDetails.summary?.replace('Summary: ', '') || '')}
                        {activeTab === 'Transcript' && (transcriptDetails.transcript || '')}
                        {activeTab === 'Insight' && (transcriptDetails.insight || '')}
                    </Text>
                </ScrollView>
            </View>
        );
    }

    return (
        <FlatList
            data={transcripts}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#475569',
        marginTop: 8,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    date: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    time: {
        fontSize: 14,
        color: '#64748B',
    },
    summaryContainer: {
        flex: 1,
    },
    summary: {
        fontSize: 15,
        lineHeight: 22,
        color: '#334155',
        fontWeight: '400',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    backButtonText: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '500',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
    },
    timeText: {
        fontSize: 14,
        color: '#64748B',
    },
    tabButtonsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabButtonText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#64748B',
        fontWeight: '500',
    },
    activeTabButtonText: {
        color: '#0066CC',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    contentText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#334155',
        letterSpacing: 0.3,
    },
});