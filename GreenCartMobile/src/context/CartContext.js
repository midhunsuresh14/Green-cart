import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Load cart and wishlist on init or user change
    useEffect(() => {
        const loadData = async () => {
            try {
                const cartKey = user ? `cart:${user.id || user.email}` : 'cart:guest';
                const wishlistKey = user ? `wishlist:${user.id || user.email}` : 'wishlist:guest';

                const storedCart = await AsyncStorage.getItem(cartKey);
                const storedWishlist = await AsyncStorage.getItem(wishlistKey);

                if (storedCart) setCartItems(JSON.parse(storedCart));
                if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));
            } catch (e) {
                console.error('Error loading cart/wishlist:', e);
            }
        };
        loadData();
    }, [user]);

    const saveCart = async (items) => {
        try {
            setCartItems(items);
            const cartKey = user ? `cart:${user.id || user.email}` : 'cart:guest';
            await AsyncStorage.setItem(cartKey, JSON.stringify(items));
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    };

    const saveWishlist = async (items) => {
        try {
            setWishlistItems(items);
            const wishlistKey = user ? `wishlist:${user.id || user.email}` : 'wishlist:guest';
            await AsyncStorage.setItem(wishlistKey, JSON.stringify(items));
        } catch (e) {
            console.error('Error saving wishlist:', e);
        }
    };

    const addToCart = async (product) => {
        const existingIndex = cartItems.findIndex(item => item.id === product.id || item._id === product._id);
        let newCart = [...cartItems];

        if (existingIndex >= 0) {
            newCart[existingIndex].quantity = (newCart[existingIndex].quantity || 1) + (product.quantity || 1);
        } else {
            newCart.push({ ...product, quantity: product.quantity || 1 });
        }

        await saveCart(newCart);
    };

    const updateQuantity = async (productId, quantity) => {
        const newCart = cartItems.map(item =>
            (item.id === productId || item._id === productId) ? { ...item, quantity } : item
        );
        await saveCart(newCart);
    };

    const removeFromCart = async (productId) => {
        const newCart = cartItems.filter(item => item.id !== productId && item._id !== productId);
        await saveCart(newCart);
    };

    const clearCart = async () => {
        await saveCart([]);
    };

    const toggleWishlist = async (product) => {
        const isExist = wishlistItems.some(item => item.id === product.id || item._id === product._id);
        let newWishlist = [];

        if (isExist) {
            newWishlist = wishlistItems.filter(item => item.id !== product.id && item._id !== product._id);
        } else {
            newWishlist = [...wishlistItems, product];
        }

        await saveWishlist(newWishlist);
    };

    const removeFromWishlist = async (productId) => {
        const newWishlist = wishlistItems.filter(item => item.id !== productId && item._id !== productId);
        await saveWishlist(newWishlist);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            wishlistItems,
            cartCount: cartItems.length,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            toggleWishlist,
            removeFromWishlist,
            isInWishlist: (productId) => wishlistItems.some(item => item.id === productId || item._id === productId)
        }}>
            {children}
        </CartContext.Provider>
    );
};
