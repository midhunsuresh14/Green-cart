import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../api/config';
import { Calendar, MapPin, Clock } from 'lucide-react-native';

export default function EventsScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            if (response.data && response.data.events) {
                setEvents(response.data.events);
            } else if (Array.isArray(response.data)) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
            // Fallback
            setEvents([
                { id: 1, title: 'Urban Gardening Workshop', date: 'Oct 15, 2026', time: '10:00 AM - 1:00 PM', location: 'City Park, NY', description: 'Learn how to maximize your small space for growing herbs and vegetables.' },
                { id: 2, title: 'Medicinal Plant Walk', date: 'Oct 22, 2026', time: '9:00 AM - 12:00 PM', location: 'State Nature Reserve', description: 'A guided tour to identify local medicinal plants and their uses.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.dateBadge}>
                <Text style={styles.dateMonth}>{item.date?.split(' ')[0] || 'TBD'}</Text>
                <Text style={styles.dateDay}>{item.date?.split(' ')[1]?.replace(',', '') || '?'}</Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.infoRow}>
                    <Clock color={Theme.colors.textLight} size={14} />
                    <Text style={styles.infoText}>{item.time || 'Time TBD'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <MapPin color={Theme.colors.textLight} size={14} />
                    <Text style={styles.infoText}>{item.location}</Text>
                </View>

                <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

                <TouchableOpacity style={styles.registerBtn}>
                    <Text style={styles.registerText}>Register Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upcoming Events</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => String(item._id || item.id)}
                renderItem={renderEvent}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    headerTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    backBtnText: {
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: Theme.spacing.m,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.medium,
    },
    dateBadge: {
        width: 70,
        backgroundColor: Theme.colors.primaryLight + '40',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.s,
        borderRightWidth: 1,
        borderRightColor: Theme.colors.primaryLight + '50',
    },
    dateMonth: {
        fontSize: Theme.typography.small.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    cardContent: {
        flex: 1,
        padding: Theme.spacing.m,
    },
    title: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.textLight,
        marginLeft: Theme.spacing.xs,
    },
    description: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 20,
        marginTop: Theme.spacing.s,
        marginBottom: Theme.spacing.m,
    },
    registerBtn: {
        backgroundColor: Theme.colors.primaryLight + '20',
        paddingVertical: Theme.spacing.s,
        paddingHorizontal: Theme.spacing.m,
        borderRadius: Theme.borderRadius.s,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Theme.colors.primary,
    },
    registerText: {
        color: Theme.colors.primaryDark,
        fontWeight: '600',
        fontSize: Theme.typography.small.fontSize,
    }
});
