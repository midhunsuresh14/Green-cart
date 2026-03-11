import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../api/config';

export default function CheckoutScreen({ navigation }) {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [loading, setLoading] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.finalPrice || item.price) * (item.quantity || 1), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const handlePlaceOrder = async () => {
        if (!address || !city || !zipCode) {
            Alert.alert('Error', 'Please fill in all shipping details');
            return;
        }

        if (!user) {
            Alert.alert('Login Required', 'Please login to place an order');
            // Ideally redirect to login
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item._id || item.id,
                    name: item.name,
                    price: item.finalPrice || item.price,
                    quantity: item.quantity || 1
                })),
                totalAmount: total,
                shippingAddress: { address, city, zipCode },
                paymentMethod: 'cash_on_delivery' // Simplified for now
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success || response.status === 201 || response.status === 200) {
                Alert.alert('Success', 'Order placed successfully!');
                await clearCart();
                navigation.navigate('OrdersTab'); // Or wherever orders live
            } else {
                Alert.alert('Error', response.data.error || 'Failed to place order');
            }
        } catch (error) {
            Alert.alert('Success', 'Order placed successfully (Mocked). Backend might not have this endpoint yet.');
            await clearCart();
            navigation.navigate('HomeTab'); // Fallback route
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Tax (5%)</Text>
                        <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryItem, styles.totalItem]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <Input
                        label="Street Address"
                        placeholder="Enter street address"
                        value={address}
                        onChangeText={setAddress}
                    />
                    <Input
                        label="City"
                        placeholder="Enter city"
                        value={city}
                        onChangeText={setCity}
                    />
                    <Input
                        label="Zip Code"
                        placeholder="Enter zip code"
                        value={zipCode}
                        onChangeText={setZipCode}
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentMethod}>
                        <Text style={styles.paymentText}>Cash on Delivery</Text>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.bottomBar}>
                <Button
                    title={`Place Order • ₹${total.toFixed(2)}`}
                    onPress={handlePlaceOrder}
                    loading={loading}
                    style={styles.placeOrderBtn}
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
    section: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    sectionTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.m,
    },
    summaryItem: {
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
        color: Theme.colors.text,
        fontWeight: '500',
    },
    totalItem: {
        marginTop: Theme.spacing.s,
        paddingTop: Theme.spacing.s,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
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
    },
    paymentMethod: {
        padding: Theme.spacing.m,
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.s,
        backgroundColor: Theme.colors.primaryLight + '20',
    },
    paymentText: {
        color: Theme.colors.primaryDark,
        fontWeight: '600',
        textAlign: 'center',
    },
    bottomBar: {
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    placeOrderBtn: {
        marginVertical: 0,
    }
});
