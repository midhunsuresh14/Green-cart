import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag, Box } from 'lucide-react-native';
import { CartContext } from '../../context/CartContext';
import Button from '../../components/ui/Button';

export default function ProductDetailScreen({ route, navigation }) {
    const { product } = route.params;
    const { addToCart, toggleWishlist, isInWishlist } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
        Alert.alert('Success', 'Added to cart successfully!');
    };

    const handleWishlist = () => {
        toggleWishlist(product);
    };

    const handleView3D = () => {
        navigation.navigate('ARViewer', {
            arModelUrl: product.arModelUrl,
            productName: product.name
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleWishlist} style={styles.wishlistBtn}>
                        <Heart
                            color={isInWishlist(product.id || product._id) ? Theme.colors.error : Theme.colors.textLight}
                            fill={isInWishlist(product.id || product._id) ? Theme.colors.error : 'none'}
                        />
                    </TouchableOpacity>
                </View>

                <Image
                    source={{ uri: product.imageUrl || product.image || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={styles.detailsContainer}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.category}>{product.category || product.subcategory}</Text>
                            <Text style={styles.title}>{product.name}</Text>
                        </View>

                        {product.arModelUrl && (
                            <TouchableOpacity style={styles.arBadge} onPress={handleView3D}>
                                <Box color="#FFF" size={16} />
                                <Text style={styles.arBadgeText}>View in 3D</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.finalPrice || product.price}</Text>
                        {product.originalPrice && (
                            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>

                    {product.careInstructions && (
                        <View style={styles.careBox}>
                            <Text style={styles.careTitle}>Care Instructions</Text>
                            <Text style={styles.careText}>{product.careInstructions}</Text>
                        </View>
                    )}

                    <View style={styles.qtyContainer}>
                        <Text style={styles.qtyLabel}>Quantity</Text>
                        <View style={styles.qtyControls}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <Button
                    title="Add to Cart"
                    onPress={handleAddToCart}
                    style={styles.addBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.xs,
        borderRadius: Theme.borderRadius.m,
    },
    backButtonText: {
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    wishlistBtn: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: Theme.spacing.s,
        borderRadius: Theme.borderRadius.round,
    },
    image: {
        width: '100%',
        height: 350,
    },
    detailsContainer: {
        padding: Theme.spacing.l,
        backgroundColor: Theme.colors.surface,
        borderTopLeftRadius: Theme.spacing.xl,
        borderTopRightRadius: Theme.spacing.xl,
        marginTop: -20,
    },
    category: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.primary,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: Theme.spacing.xs,
    },
    title: {
        fontSize: Theme.typography.h1.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    arBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        ...Theme.shadows.small,
        shadowColor: Theme.colors.primary,
    },
    arBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.l,
    },
    price: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        marginRight: Theme.spacing.m,
    },
    originalPrice: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        textDecorationLine: 'line-through',
    },
    sectionTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
    },
    description: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 24,
        marginBottom: Theme.spacing.l,
    },
    careBox: {
        backgroundColor: Theme.colors.primaryLight,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.l,
    },
    careTitle: {
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.xs,
    },
    careText: {
        color: Theme.colors.text,
    },
    qtyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    qtyLabel: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.m,
    },
    qtyBtn: {
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
    },
    qtyBtnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    qtyValue: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        paddingHorizontal: Theme.spacing.m,
    },
    bottomBar: {
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    addBtn: {
        marginVertical: 0,
    }
});
