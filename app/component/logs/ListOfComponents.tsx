import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';
import { format } from 'date-fns';
import { Card } from 'react-native-paper';

// Color Palette
const PRIMARY_COLOR = '#007BFF'; // Blue
const SECONDARY_COLOR = '#6C757D'; // Gray
const BACKGROUND_COLOR = '#F8F9FA'; // Light Gray
const CARD_BACKGROUND_COLOR = '#FFFFFF'; // White
const TEXT_COLOR = '#212529'; // Dark Gray
const SHADOW_COLOR = '#000';

interface NoteItem {
    _id: string;
    date: string;
    summaryFromGPT: string;
}

interface NoteDetails {
    _id: string;
    date: string;
    transcriptFromDeepgram: string;
    summaryFromGPT: string;
    insightFromGPT: string;
}

export default function ListOflogs() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [noteDetails, setNoteDetails] = useState<NoteDetails | null>(null);
    const [activeTab, setActiveTab] = useState<'Summary' | 'Transcript' | 'Insight'>('Summary');

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const response = await axios.get(`${config.API_URL}/transcripts/notes`, {
                    headers: { 'user-id': userId },
                });
                setNotes(response.data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const fetchNoteDetails = async (noteId: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await axios.get(`${config.API_URL}/transcripts/note/${noteId}`, {
                headers: { 'user-id': userId },
            });
            setNoteDetails(response.data);
        } catch (error) {
            console.error("Error fetching note details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardPress = (noteId: string) => {
        setSelectedNoteId(noteId);
        fetchNoteDetails(noteId);
        setActiveTab('Summary');
    };

    const handleBackPress = () => {
        setSelectedNoteId(null);
        setNoteDetails(null);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: NoteItem }) => (
        <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => handleCardPress(item._id)}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {format(new Date(item.date), 'dd MMM yyyy')}
                        </Text>
                        <Text style={styles.time}>
                            {format(new Date(item.date), 'HH:mm')}
                        </Text>
                    </View>

                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryLabel}>Summary: </Text>
                        <Text
                            style={styles.summary}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                        >
                            {item.summaryFromGPT}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    // Detail View
    if (selectedNoteId && noteDetails) {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>Note Details</Text>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.dateText}>
                        {format(new Date(noteDetails.date), 'dd MMM yyyy')}
                    </Text>
                    <Text style={styles.timeText}>
                        {format(new Date(noteDetails.date), 'HH:mm')}
                    </Text>
                </View>

                <View style={styles.tabButtonsContainer}>
                    {['Summary', 'Transcript', 'Insight'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                activeTab === tab && styles.activeTabButton,
                            ]}
                            onPress={() => setActiveTab(tab as 'Summary' | 'Transcript' | 'Insight')}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === tab && styles.activeTabButtonText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.contentContainer}>
                    {activeTab === 'Insight' ? (
                        <ScrollView
                            style={styles.insightScrollView}
                            contentContainerStyle={styles.insightScrollViewContent}
                            showsVerticalScrollIndicator={true}
                            {...(Platform.OS === 'ios' ? { indicatorStyle: 'black' } : {})}
                        >
                            <Text style={styles.contentText}>
                                {noteDetails.insightFromGPT}
                            </Text>
                        </ScrollView>
                    ) : (
                        <Text style={styles.contentText}>
                            {activeTab === 'Summary' && noteDetails.summaryFromGPT}
                            {activeTab === 'Transcript' && noteDetails.transcriptFromDeepgram}
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    // List View
    return (
        <FlatList
            data={notes}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
    },
    loadingText: {
        fontSize: 18,
        color: SECONDARY_COLOR,
        marginTop: 10,
    },
    listContainer: {
        padding: 20,
    },
    cardWrapper: {
        marginBottom: 15,
    },
    card: {
        backgroundColor: CARD_BACKGROUND_COLOR,
        borderRadius: 12,
        elevation: 5, // Increased elevation for a more pronounced shadow
        shadowColor: SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // Slightly increased shadow opacity
        shadowRadius: 4,
        padding: 18, // Slightly increased padding inside the card
        borderWidth: 1, // Added a subtle border
        borderColor: BACKGROUND_COLOR, // Border color matches the background
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8, // Reduced marginBottom
    },
    date: {
        fontSize: 13, // Slightly smaller date text
        color: SECONDARY_COLOR,
    },
    time: {
        fontSize: 11, // Even smaller time text
        color: SECONDARY_COLOR,
    },
    summaryContainer: {
        flexDirection: 'column',
        marginTop: 8, // Reduced marginTop
    },
    summaryLabel: {
        fontSize: 15, // Slightly smaller summary label
        fontWeight: 'bold',
        color: TEXT_COLOR,
        marginBottom: 4, // Reduced marginBottom
    },
    summary: {
        fontSize: 15, // Slightly smaller summary text
        color: TEXT_COLOR,
        lineHeight: 20, // Reduced lineHeight
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: TEXT_COLOR,
        marginBottom: 8,
    },
    backButton: {
        paddingVertical: 8, // Reduced vertical padding
        paddingHorizontal: 12, // Reduced horizontal padding
        backgroundColor: CARD_BACKGROUND_COLOR,
        borderRadius: 6, // Slightly smaller border radius
        borderWidth: 1,
        borderColor: SECONDARY_COLOR,
        marginBottom: 8, // Reduced marginBottom
    },
    backButtonText: {
        fontSize: 14, // Smaller back button text
        color: TEXT_COLOR,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        color: SECONDARY_COLOR,
    },
    timeText: {
        fontSize: 11,
        color: SECONDARY_COLOR,
    },
    tabButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: BACKGROUND_COLOR,
        borderRadius: 20, // Slightly smaller border radius
        padding: 4, // Reduced padding
        marginBottom: 15, // Reduced marginBottom
    },
    tabButton: {
        paddingVertical: 8, // Reduced vertical padding
        paddingHorizontal: 12, // Reduced horizontal padding
        borderRadius: 16, // Slightly smaller border radius
    },
    activeTabButton: {
        backgroundColor: PRIMARY_COLOR,
    },
    tabButtonText: {
        fontSize: 14, // Slightly smaller tab button text
        color: SECONDARY_COLOR,
    },
    activeTabButtonText: {
        color: CARD_BACKGROUND_COLOR,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: CARD_BACKGROUND_COLOR,
        borderRadius: 10,
        padding: 18, // Reduced padding
    },
    contentText: {
        fontSize: 15, // Slightly smaller content text
        color: TEXT_COLOR,
        lineHeight: 22, // Reduced lineHeight
    },
    insightScrollView: {
        flex: 1,
    },
    insightScrollViewContent: {
        paddingRight: 8,
    },
});