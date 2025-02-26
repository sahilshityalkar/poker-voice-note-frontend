// component/players/PlayersComponent.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';
import config from '../../config';
import { FontAwesome } from '@expo/vector-icons';

// Color Palette
const PRIMARY_COLOR = '#3498db';   // Light Blue
const SECONDARY_COLOR = '#7f8c8d';   // Medium Gray
const ACCENT_COLOR = '#f39c12';    // Orange (for highlights)
const BACKGROUND_COLOR = '#ecf0f1';  // Very Light Gray
const CARD_BACKGROUND_COLOR = '#ffffff'; // White
const TEXT_COLOR = '#34495e';     // Dark Blue-Gray

// Define the Player and HandNote types based on your API response
interface Player {
    _id: string;
    user_id: string;
    name: string;
    totalHands: number;
    totalWins: number;
    handReferences: HandReference[];
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    strengths?: string[];    // Make strengths optional
    weaknesses?: string[];   // Make weaknesses optional
}

interface HandReference {
    handId: string;
    noteId: string;
    position: string;
    won: boolean;
    date: string;    //ISO String
}

interface Hand {
    _id: string;
    user_id: string;
    noteId: string;
    myPosition: string;
    iWon: boolean;
    potSize: number | null;
    date: string;
    createdAt: string;
    updatedAt: string;
    players: {
        playerId: string;
        name: string;
        position: string;
        won: boolean;
    }[];
}

interface Note {
    _id: string;
    user_id: string;
    handId: string;
    audioFileUrl: string;
    transcriptFromDeepgram: string;
    summaryFromGPT: string;
    insightFromGPT: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}

interface PlayerDetailsResponse {
    player: Player;
    handAndNotes: { hand: Hand; note: Note }[];
}

// Get screen width for responsive styling
const screenWidth = Dimensions.get('window').width;

const PlayersComponent: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [selectedHandNote, setSelectedHandNote] = useState<{ handId: string; noteId: string } | null>(null);
    const [handNotes, setHandNotes] = useState<PlayerDetailsResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false); // New state for analyzing indicator

    useEffect(() => {
        fetchPlayers();
    }, []);

    useEffect(() => {
        if (selectedPlayerId) {
            fetchHandNotes(selectedPlayerId);
        }
    }, [selectedPlayerId]);

    const fetchPlayers = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get<Player[]>(`${config.API_URL}/players/players/${userId}`);
            setPlayers(response.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch players.');
            setLoading(false);
            Alert.alert('Error', 'Failed to fetch players.');
        }
    };

    const fetchHandNotes = async (playerId: string) => {
        try {
            setLoading(true);
            const response = await axios.get<PlayerDetailsResponse>(
                `${config.API_URL}/api/v1/players/${playerId}/hands-notes`
            );
            setHandNotes(response.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch hand and notes.');
            setLoading(false);
            Alert.alert('Error', 'Failed to fetch hand and notes.');
        }
    };

    const handlePlayerPress = (playerId: string) => {
        setSelectedPlayerId(playerId);
        setSelectedHandNote(null); // Clear selected hand note when navigating to hand list
    };

    const handleHandNotePress = (handId: string, noteId: string) => {
        setSelectedHandNote({ handId, noteId });
    };

    const handleBackToPlayers = () => {
        setSelectedPlayerId(null);
        setSelectedHandNote(null);
        setHandNotes(null);
    };

    const handleBackToHandNotes = () => {
        setSelectedHandNote(null);
    };

      const handleAnalyzePlayer = async (playerId: string) => {
        setAnalyzing(true); // Start analyzing

        try {
            // POST request to analyze the player
            const response = await axios.post(`${config.API_URL}/api/v1/analyze/players/${playerId}/analyze`);

            if (response.status === 200) {
                // On success, refetch hand notes
                await fetchHandNotes(playerId);
            } else {
                Alert.alert('Error', 'Failed to analyze player.');
            }
        } catch (error: any) {
            console.error('Error analyzing player:', error);
            Alert.alert('Error', 'Failed to analyze player.');
        } finally {
            setAnalyzing(false); // Stop analyzing
        }
    };

    const renderPlayerItem = ({ item }: { item: Player }) => (
        <TouchableOpacity onPress={() => handlePlayerPress(item._id)} style={styles.listItem}>
            <View style={styles.playerCard}>
                <Text style={styles.playerName}>{item.name}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.playerInfo}><FontAwesome name="hand-o-up" size={14} color={SECONDARY_COLOR} /> {item.totalHands} Hands</Text>
                    <Text style={styles.playerInfo}><FontAwesome name="trophy" size={14} color={ACCENT_COLOR} /> {item.totalWins} Wins</Text>
                </View>
                <Text style={styles.secondaryText}>Created: {format(new Date(item.createdAt), 'MMMM dd, yyyy')}</Text>
                <Text style={styles.secondaryText}>Updated: {format(new Date(item.updatedAt), 'MMMM dd, yyyy')}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHandNoteItem = ({ item }: { item: { hand: Hand; note: Note } }) => {
        const { hand, note } = item;
        const handDate = new Date(hand.date);
        const formattedDate = format(handDate, 'MMMM');

        return (
            <TouchableOpacity onPress={() => handleHandNotePress(hand._id, note._id)} style={styles.listItem}>
                <View style={styles.handNoteCard}>
                    <Text style={styles.handTitle}>Hand</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.handInfo}><FontAwesome name="user" size={14} color={SECONDARY_COLOR} /> {hand.myPosition}</Text>
                        <Text style={styles.handInfo}>{hand.iWon ? <FontAwesome name="check" size={14} color="#2ecc71" /> : <FontAwesome name="times" size={14} color="#e74c3c" />} Won</Text>
                    </View>
                    <Text style={styles.secondaryText}>Date: {formattedDate}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.secondaryText}>
                        Note: {note.summaryFromGPT}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHandNoteDetails = () => {
        if (!selectedPlayerId || !selectedHandNote || !handNotes) {
            return null;
        }

        const { handId, noteId } = selectedHandNote;
        const selectedHandNoteItem = handNotes.handAndNotes.find(
            (item) => item.hand._id === handId && item.note._id === noteId
        );

        if (!selectedHandNoteItem) {
            return <Text style={styles.errorText}>Hand and Note Details Not Found</Text>;
        }

        const { hand, note } = selectedHandNoteItem;

        return (
            <ScrollView style={styles.container}>
                <TouchableOpacity onPress={handleBackToHandNotes} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.backButtonText}>Back to Hand Notes</Text>
                </TouchableOpacity>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Hand Details</Text>
                    <Text style={styles.detailText}><FontAwesome name="user" size={16} color={SECONDARY_COLOR} /> My Position: {hand.myPosition}</Text>
                    <Text style={styles.detailText}>{hand.iWon ? <FontAwesome name="check" size={16} color="#2ecc71" /> : <FontAwesome name="times" size={16} color="#e74c3c" />} Won</Text>
                    <Text style={styles.detailText}><FontAwesome name="money" size={16} color={SECONDARY_COLOR} /> Pot Size: {hand.potSize}</Text>
                    <Text style={styles.detailText}><FontAwesome name="calendar" size={16} color={SECONDARY_COLOR} /> Date: {format(new Date(hand.date), 'MMMM dd, yyyy, HH:mm')}</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Note Details</Text>
                    <Text style={styles.detailText}><FontAwesome name="sticky-note-o" size={16} color={SECONDARY_COLOR} /> Summary: {note.summaryFromGPT}</Text>
                    <Text style={styles.detailText}><FontAwesome name="lightbulb-o" size={16} color={SECONDARY_COLOR} /> Insight: {note.insightFromGPT}</Text>
                    <Text style={styles.detailText}><FontAwesome name="file-text-o" size={16} color={SECONDARY_COLOR} /> Transcript: {note.transcriptFromDeepgram}</Text>
                </View>
            </ScrollView>
        );
    };

    const renderHandNotesList = () => {
        if (!selectedPlayerId || !handNotes) {
            return null;
        }

        const player = handNotes.player;

        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={handleBackToPlayers} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.backButtonText}>Back to Players</Text>
                </TouchableOpacity>

                 <View style={styles.playerInfoContainer}>
                    <Text style={styles.playerTitle}>{player.name}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.playerInfo}><FontAwesome name="hand-o-up" size={14} color={SECONDARY_COLOR} /> {player.totalHands} Hands</Text>
                        <Text style={styles.playerInfo}><FontAwesome name="trophy" size={14} color={ACCENT_COLOR} /> {player.totalWins} Wins</Text>
                    </View>
                    <Text style={styles.secondaryText}>Created: {format(new Date(player.createdAt), 'MMMM dd, yyyy')}</Text>
                    <Text style={styles.secondaryText}>Updated: {format(new Date(player.updatedAt), 'MMMM dd, yyyy')}</Text>
                    {(player.strengths && player.strengths.length > 0) && (
                        <View style={styles.strengthsWeaknessesContainer}>
                            <Text style={styles.strengthsTitle}>Strengths:</Text>
                            {player.strengths.map((strength, index) => (
                                <Text key={index} style={styles.strengthItem}>- {strength}</Text>
                            ))}
                        </View>
                    )}

                    {(player.weaknesses && player.weaknesses.length > 0) && (
                        <View style={styles.strengthsWeaknessesContainer}>
                            <Text style={styles.weaknessesTitle}>Weaknesses:</Text>
                            {player.weaknesses.map((weakness, index) => (
                                <Text key={index} style={styles.weaknessItem}>- {weakness}</Text>
                            ))}
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.analyzeButton}
                        onPress={() => handleAnalyzePlayer(selectedPlayerId)}
                        disabled={analyzing}
                    >
                        {analyzing ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.analyzeButtonText}>Analyze Player</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={handNotes.handAndNotes}
                    renderItem={renderHandNoteItem}
                    keyExtractor={(item) => item.hand._id}
                    style={styles.list}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (selectedHandNote) {
        return renderHandNoteDetails();
    }

    if (selectedPlayerId) {
        return renderHandNotesList(); // Render HandNotes List with player details
    }

    return (
        <FlatList
            data={players}
            renderItem={renderPlayerItem}
            keyExtractor={(item) => item._id}
            style={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: BACKGROUND_COLOR, // Soft Background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: SECONDARY_COLOR, // Medium Gray
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#c0392b', // Dark Red
        textAlign: 'center',
    },
    list: {
        width: '100%',
    },
    listItem: {
        marginBottom: 12,
    },
    playerCard: {
        backgroundColor: CARD_BACKGROUND_COLOR, // White Card
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    playerName: {
        fontSize: 24,
        fontWeight: '700',
        color: TEXT_COLOR, // Dark Blue-Gray
        marginBottom: 8,
    },
    playerInfo: {
        fontSize: 16,
        color: SECONDARY_COLOR, // Medium Gray
        marginRight: 10,
    },
    handNoteCard: {
        backgroundColor: CARD_BACKGROUND_COLOR,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // Reduced height
        shadowOpacity: 0.07, // Reduced opacity
        shadowRadius: 4, // Reduced radius
        elevation: 2, // Reduced elevation
    },
    handTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: TEXT_COLOR,
        marginBottom: 8,
    },
    handInfo: {
        fontSize: 16,
        color: SECONDARY_COLOR,
        marginRight: 10,
    },
    backButton: {
        backgroundColor: PRIMARY_COLOR,
        padding: 14,
        borderRadius: 10,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    sectionContainer: {
        marginBottom: 25,
        padding: 20,
        backgroundColor: CARD_BACKGROUND_COLOR,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: TEXT_COLOR,
        marginBottom: 15,
    },
    detailText: {
        fontSize: 18,
        color: TEXT_COLOR,
        lineHeight: 28,
        marginBottom: 8,
    },
    playerInfoContainer: {
        marginBottom: 20
    },
    secondaryText: {
        fontSize: 14,
        color: SECONDARY_COLOR,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
      elevatedCard: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    playerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2a2a2a',
        marginBottom: 10
    },
     analyzeButton: {
        backgroundColor: ACCENT_COLOR,
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
     strengthsWeaknessesContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: CARD_BACKGROUND_COLOR,
        borderRadius: 8,
    },
    strengthsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2ecc71', // Green
        marginBottom: 5,
    },
    weaknessesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e74c3c', // Red
        marginBottom: 5,
    },
    strengthItem: {
        fontSize: 16,
        color: TEXT_COLOR,
    },
    weaknessItem: {
        fontSize: 16,
        color: TEXT_COLOR,
    },
});

export default PlayersComponent;