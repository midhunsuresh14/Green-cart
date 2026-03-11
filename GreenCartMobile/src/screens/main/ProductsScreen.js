import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/config';

export default function ProductsScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.cardInfo}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.category}>{item.category || item.subcategory}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{item.finalPrice || item.price}</Text>
                    {item.originalPrice && (
                        <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                    )}
                </View>
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
                <Text style={styles.title}>All Products</Text>
            </View>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id || String(item.id) || Math.random().toString()}
                renderItem={renderItem}
                numColumns={2}
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
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    title: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    listContainer: {
        padding: Theme.spacing.s,
    },
    card: {
        flex: 1,
        margin: Theme.spacing.s,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.m,
        overflow: 'hidden',
        ...Theme.shadows.small,
    },
    image: {
        width: '100%',
        height: 150,
    },
    cardInfo: {
        padding: Theme.spacing.m,
    },
    name: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    category: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.textLight,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        marginRight: 8,
    },
    originalPrice: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.textLight,
        textDecorationLine: 'line-through',
    }
});
