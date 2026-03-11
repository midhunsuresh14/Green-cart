import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and user on app load
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load storage data:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadStorageData();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });

            if (response.data.success) {
                const userToken = response.data.token;
                const userData = response.data.user;

                await AsyncStorage.setItem('token', userToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));

                setToken(userToken);
                setUser(userData);
                return { success: true };
            }
            return { success: false, error: response.data.error || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Network error occurred'
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Failed to logout:', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
