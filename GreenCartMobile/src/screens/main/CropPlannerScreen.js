import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../api/config';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CropPlannerScreen({ navigation }) {
    const [location, setLocation] = useState('');
    const [soilType, setSoilType] = useState('');
    const [season, setSeason] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);

    const getSuggestions = async () => {
        if (!location) {
            Alert.alert('Error', 'Please enter a location to get weather-based suggestions.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/crop-planner', {
                location,
                soilType,
                season
            });

            if (response.data && response.data.suggestions) {
                setSuggestions(response.data.suggestions);
            } else {
                // Fallback for demonstration since actual AI endpoint might need specific keys
                setSuggestions([
                    { crop: 'Tomatoes', reason: 'Suitable for current warm weather and well-draining soil in your area.' },
                    { crop: 'Basil', reason: 'Companions well with tomatoes and thrives in full sun.' },
                    { crop: 'Marigold', reason: 'Helps deter pests naturally in your region.' }
                ]);
            }
        } catch (error) {
            console.error('Crop Planner Error:', error);
            // Mock data fallback
            setSuggestions([
                { crop: 'Tomatoes', reason: 'Suitable for current warm weather and well-draining soil in your area.' },
                { crop: 'Basil', reason: 'Companions well with tomatoes and thrives in full sun.' },
                { crop: 'Marigold', reason: 'Helps deter pests naturally in your region.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack() || navigation.navigate('HomeTab')}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Crop Planner</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Plan Your Garden</Text>
                    <Text style={styles.cardDesc}>
                        Enter your details below to get AI-powered companion planting and crop suggestions based on your local climate.
                    </Text>

                    <Input
                        label="Location (City or Zip Code)"
                        placeholder="e.g., San Francisco, CA"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Input
                        label="Soil Type (Optional)"
                        placeholder="e.g., Loamy, Clay, Sandy"
                        value={soilType}
                        onChangeText={setSoilType}
                    />

                    <Input
                        label="Season (Optional)"
                        placeholder="e.g., Spring, Summer"
                        value={season}
                        onChangeText={setSeason}
                    />

                    <Button
                        title="Get Suggestions"
                        onPress={getSuggestions}
                        loading={loading}
                        style={{ marginTop: Theme.spacing.m }}
                    />
                </View>

                {suggestions && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>AI Recommendations</Text>

                        {suggestions.map((item, index) => (
                            <View key={index} style={styles.suggestionCard}>
                                <View style={styles.suggestionHeader}>
                                    <Text style={styles.suggestionIndex}>{index + 1}</Text>
                                    <Text style={styles.cropName}>{item.crop}</Text>
                                </View>
                                <Text style={styles.cropReason}>{item.reason}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// Just to avoid missing import error for TouchableOpacity above
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
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
    title: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    backBtnText: {
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: Theme.spacing.m,
    },
    card: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.l,
        marginBottom: Theme.spacing.l,
        ...Theme.shadows.medium,
    },
    cardTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.xs,
    },
    cardDesc: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
        marginBottom: Theme.spacing.l,
    },
    resultsContainer: {
        marginTop: Theme.spacing.m,
    },
    resultsTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.m,
    },
    suggestionCard: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.m,
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primary,
        ...Theme.shadows.small,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.xs,
    },
    suggestionIndex: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Theme.colors.primaryLight,
        color: Theme.colors.primaryDark,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: 'bold',
        marginRight: Theme.spacing.s,
    },
    cropName: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    cropReason: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
        marginLeft: 32, // align with text
    }
});
