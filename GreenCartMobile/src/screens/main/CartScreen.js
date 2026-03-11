import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { Trash2 } from 'lucide-react-native';

export default function CartScreen({ navigation }) {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.finalPrice || item.price) * (item.quantity || 1), 0);
    const tax = subtotal * 0.05; // 5% tax like web
    const total = subtotal + tax;

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/100' }}
                style={styles.image}
            />
            <View style={styles.itemDetails}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{item.finalPrice || item.price}</Text>

                <View style={styles.actionRow}>
                    <View style={styles.qtyControls}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item._id || item.id, Math.max(1, (item.quantity || 1) - 1))}
                        >
                            <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity || 1}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item._id || item.id, (item.quantity || 1) + 1)}
                        >
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeFromCart(item._id || item.id)}
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
                <Text style={styles.title}>Shopping Cart</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <Button
                        title="Start Shopping"
                        onPress={() => navigation.navigate('ProductsTab')}
                        style={{ width: 200, marginTop: Theme.spacing.l }}
                    />
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => String(item._id || item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax (5%)</Text>
                            <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                        </View>
                        <Button
                            title="Proceed to Checkout"
                            onPress={() => {/* Navigate to Checkout */ }}
                        />
                    </View>
                </>
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
        color: Theme.colors.text,
    },
    clearText: {
        color: Theme.colors.error,
        fontWeight: '500',
    },
    list: {
        padding: Theme.spacing.m,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.m,
        padding: Theme.spacing.m,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: Theme.borderRadius.s,
        backgroundColor: Theme.colors.background,
    },
    itemDetails: {
        flex: 1,
        marginLeft: Theme.spacing.m,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
    },
    price: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Theme.spacing.s,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.s,
    },
    qtyBtn: {
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.xs,
    },
    qtyBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    qtyValue: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        paddingHorizontal: Theme.spacing.s,
    },
    removeBtn: {
        padding: Theme.spacing.xs,
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
    summaryContainer: {
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        ...Theme.shadows.medium,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.s,
    },
    summaryLabel: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
    },
    summaryValue: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '500',
        color: Theme.colors.text,
    },
    totalRow: {
        marginTop: Theme.spacing.s,
        paddingTop: Theme.spacing.s,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        marginBottom: Theme.spacing.l,
    },
    totalLabel: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    totalValue: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    }
});
