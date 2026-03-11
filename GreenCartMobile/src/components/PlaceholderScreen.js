import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export default function PlaceholderScreen({ route }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{route.name} Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    text: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: Theme.typography.h2.fontWeight,
        color: Theme.colors.text,
    }
});
