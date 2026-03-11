import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/config';
import { AuthContext } from '../../context/AuthContext';
import { Package } from 'lucide-react-native';

export default function OrdersScreen() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/user');
            if (response.data && response.data.orders) {
                setOrders(response.data.orders);
            } else if (Array.isArray(response.data)) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                    <Package color={Theme.colors.primary} size={20} />
                    <Text style={styles.orderId}>Order #{String(item._id || item.id).substring(0, 8)}</Text>
                </View>
                <Text style={[
                    styles.status,
                    item.status === 'delivered' ? styles.statusDelivered : styles.statusPending
                ]}>
                    {item.status || 'Pending'}
                </Text>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.detailText}>{item.items?.length || 0} Items</Text>
                <Text style={styles.totalValue}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
            </View>

            <Text style={styles.dateText}>
                {new Date(item.created_at || Date.now()).toLocaleDateString()}
            </Text>
        </View>
    );

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Please log in to view orders</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                <Text style={styles.title}>My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => String(item._id || item.id || Math.random())}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
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
    orderCard: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.s,
        paddingBottom: Theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderId: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginLeft: Theme.spacing.s,
    },
    status: {
        fontSize: Theme.typography.small.fontSize,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusPending: {
        color: Theme.colors.accent,
    },
    statusDelivered: {
        color: Theme.colors.success,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.s,
    },
    detailText: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
    },
    totalValue: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    dateText: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.textLight,
    }
});
