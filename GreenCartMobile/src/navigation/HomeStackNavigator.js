import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import CropPlannerScreen from '../screens/main/CropPlannerScreen';
import HerbalRemediesScreen from '../screens/main/HerbalRemediesScreen';
import ChatBotScreen from '../screens/main/ChatBotScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import BlogScreen from '../screens/main/BlogScreen';
import EventsScreen from '../screens/main/EventsScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="CropPlanner" component={CropPlannerScreen} />
            <Stack.Screen name="HerbalRemedies" component={HerbalRemediesScreen} />
            <Stack.Screen name="ChatBot" component={ChatBotScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="BlogScreen" component={BlogScreen} />
            <Stack.Screen name="EventsScreen" component={EventsScreen} />
        </Stack.Navigator>
    );
}
