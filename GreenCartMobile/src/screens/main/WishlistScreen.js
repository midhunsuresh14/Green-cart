import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { Trash2, ShoppingCart } from 'lucide-react-native';

export default function WishlistScreen({ navigation }) {
    const { wishlistItems, removeFromWishlist, addToCart } = useContext(CartContext);

    const handleMoveToCart = (item) => {
        addToCart({ ...item, quantity: 1 });
        removeFromWishlist(item._id || item.id);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => navigation.navigate('HomeTab', { screen: 'ProductDetail', params: { product: item } })}
            >
                <Image
                    source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            <View style={styles.cardInfo}>
                <View>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.price}>₹{item.finalPrice || item.price}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleMoveToCart(item)}
                    >
                        <ShoppingCart color={Theme.colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconBtn, styles.deleteBtn]}
                        onPress={() => removeFromWishlist(item._id || item.id)}
                    >
                        <Trash2 color={Theme.colors.error} size={20} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>My Wishlist</Text>
            </View>

            {wishlistItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Your wishlist is empty</Text>
                    <Button
                        title="Browse Products"
                        onPress={() => navigation.navigate('ProductsTab')}
                        style={{ width: 200, marginTop: Theme.spacing.l }}
                    />
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    keyExtractor={(item) => String(item._id || item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: Theme.typography.h3.fontSize,
        color: Theme.colors.textLight,
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
        ...Theme.shadows.small,
    },
    imageContainer: {
        width: 100,
        height: 100,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    cardInfo: {
        flex: 1,
        padding: Theme.spacing.m,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    name: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: 4,
        width: 120, // To avoid pushing actions out
    },
    price: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: Theme.spacing.s,
        backgroundColor: Theme.colors.primaryLight + '40',
        borderRadius: Theme.borderRadius.s,
        marginLeft: Theme.spacing.s,
    },
    deleteBtn: {
        backgroundColor: Theme.colors.error + '20',
    }
});
