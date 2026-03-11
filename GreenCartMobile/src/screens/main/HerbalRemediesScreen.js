import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../api/config';
import { Search } from 'lucide-react-native';
import Input from '../../components/ui/Input';

export default function HerbalRemediesScreen({ navigation }) {
    const [remedies, setRemedies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRemedies();
    }, []);

    const fetchRemedies = async () => {
        try {
            const response = await api.get('/herbal-remedies');
            if (response.data && response.data.remedies) {
                setRemedies(response.data.remedies);

                // Extract unique categories
                const cats = new Set(response.data.remedies.map(item => item.category).filter(Boolean));
                setCategories(['All', ...Array.from(cats)]);
            }
        } catch (error) {
            console.error('Failed to fetch herbal remedies:', error);
            // Fallback mock data if endpoint is not fully ready
            const mockData = [
                { id: 1, title: 'Aloe Vera for Burns', category: 'Skin', description: 'Apply fresh aloe gel directly to minor burns to soothe and heal.' },
                { id: 2, title: 'Ginger Tea for Nausea', category: 'Digestion', description: 'Steep fresh ginger in hot water to relieve upset stomach and nausea.' },
                { id: 3, title: 'Chamomile for Sleep', category: 'Sleep', description: 'Drink chamomile tea 30 minutes before bed to promote relaxation.' },
                { id: 4, title: 'Peppermint for Headaches', category: 'Pain Relief', description: 'Apply diluted peppermint oil to temples to ease tension headaches.' }
            ];
            setRemedies(mockData);
            setCategories(['All', 'Skin', 'Digestion', 'Sleep', 'Pain Relief']);
        } finally {
            setLoading(false);
        }
    };

    const filteredRemedies = remedies.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ailment?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipSelected
            ]}
            onPress={() => setSelectedCategory(item)}
        >
            <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextSelected
            ]}>{item}</Text>
        </TouchableOpacity>
    );

    const renderRemedy = ({ item }) => (
        <View style={styles.remedyCard}>
            <Text style={styles.remedyTitle}>{item.title || item.ailment}</Text>
            <Text style={styles.remedyCategory}>{item.category || 'General'}</Text>
            <Text style={styles.remedyDescription}>{item.description}</Text>

            {item.ingredients && (
                <View style={styles.ingredientsBox}>
                    <Text style={styles.ingredientsTitle}>Ingredients/Plants:</Text>
                    <Text style={styles.ingredientsText}>
                        {Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients}
                    </Text>
                </View>
            )}
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
                <Text style={styles.title}>Herbal Remedies</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchSection}>
                <Input
                    placeholder="Search ailments or plants..."
                    icon="search"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.categoriesSection}>
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={renderCategory}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <FlatList
                data={filteredRemedies}
                keyExtractor={(item) => String(item._id || item.id)}
                renderItem={renderRemedy}
                contentContainerStyle={styles.remediesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No remedies found.</Text>
                    </View>
                }
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
    searchSection: {
        paddingHorizontal: Theme.spacing.m,
        paddingTop: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
    },
    categoriesSection: {
        backgroundColor: Theme.colors.surface,
        paddingBottom: Theme.spacing.m,
    },
    categoriesList: {
        paddingHorizontal: Theme.spacing.m,
    },
    categoryChip: {
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.borderRadius.round,
        marginRight: Theme.spacing.s,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    categoryChipSelected: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    categoryText: {
        color: Theme.colors.textLight,
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: '#FFF',
    },
    remediesList: {
        padding: Theme.spacing.m,
    },
    remedyCard: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    remedyTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    remedyCategory: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.primary,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: Theme.spacing.s,
    },
    remedyDescription: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
    },
    ingredientsBox: {
        marginTop: Theme.spacing.m,
        padding: Theme.spacing.s,
        backgroundColor: Theme.colors.primaryLight + '20',
        borderRadius: Theme.borderRadius.s,
    },
    ingredientsTitle: {
        fontSize: Theme.typography.small.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    ingredientsText: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.text,
        marginTop: 2,
    },
    emptyContainer: {
        padding: Theme.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: Theme.colors.textLight,
        fontSize: Theme.typography.body.fontSize,
    }
});
