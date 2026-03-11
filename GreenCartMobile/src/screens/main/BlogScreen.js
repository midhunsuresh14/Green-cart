import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../api/config';

export default function BlogScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/blogs');
            if (response.data && response.data.blogs) {
                setPosts(response.data.blogs);
            } else if (Array.isArray(response.data)) {
                setPosts(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            // Fallback
            setPosts([
                { id: 1, title: 'Top 10 Medicinal Plants for Home', excerpt: 'Discover the best herbs you can grow indoors.', image: 'https://via.placeholder.com/300x150', category: 'Gardening' },
                { id: 2, title: 'The Benefits of Aloe Vera', excerpt: 'Why every household needs an Aloe Vera plant.', image: 'https://via.placeholder.com/300x150', category: 'Health' },
                { id: 3, title: 'Creating a DIY Herb Garden', excerpt: 'A simple guide to starting your own herb garden.', image: 'https://via.placeholder.com/300x150', category: 'DIY' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderPost = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image
                source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/300x150' }}
                style={styles.image}
            />
            <View style={styles.cardInfo}>
                <Text style={styles.category}>{item.category || 'Article'}</Text>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt || item.content?.substring(0, 100)}</Text>
                <Text style={styles.readMore}>Read More →</Text>
            </View>
        </TouchableOpacity>
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
                <Text style={styles.headerTitle}>GreenCart Blog</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => String(item._id || item.id)}
                renderItem={renderPost}
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
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.medium,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: Theme.colors.background,
    },
    cardInfo: {
        padding: Theme.spacing.m,
    },
    category: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: Theme.spacing.xs,
    },
    title: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.xs,
    },
    excerpt: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
        marginBottom: Theme.spacing.m,
    },
    readMore: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.primary,
    }
});
