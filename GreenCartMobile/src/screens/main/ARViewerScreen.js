import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

export default function ARViewerScreen({ route, navigation }) {
    const { arModelUrl, productName } = route.params;
    const [loading, setLoading] = useState(true);

    // We use a local HTML string to embed Google's <model-viewer> web component.
    // This allows robust 3D rendering of .glb/.gltf files inside React Native!
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>3D Viewer</title>
            <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
            <style>
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #f8fafc; overflow: hidden; }
                model-viewer {
                    width: 100%;
                    height: 100%;
                    --poster-color: transparent;
                }
                .loading-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: -apple-system, system-ui, sans-serif;
                    color: #059669;
                    font-weight: bold;
                    pointer-events: none;
                }
                .ar-button {
                    background-color: white;
                    border-radius: 40px;
                    border: none;
                    position: absolute;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 12px 24px;
                    font-family: -apple-system, system-ui, sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    color: #047857;
                    box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ar-button:active {
                    background-color: #f0fdf4;
                }
            </style>
        </head>
        <body>
            <model-viewer 
                src="${arModelUrl}"
                camera-controls 
                auto-rotate 
                ar
                ar-scale="auto"
                ar-modes="webxr scene-viewer quick-look"
                rotation-per-second="30deg"
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1"
                onload="window.ReactNativeWebView.postMessage('loaded')"
            >
                <div class="loading-text" slot="poster">Loading 3D Model...</div>
                
                <button slot="ar-button" class="ar-button">
                    View in your space
                </button>
            </model-viewer>
        </body>
        </html>
    `;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.subtitle}>3D Review</Text>
                    <Text style={styles.title} numberOfLines={1}>{productName}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                    <X color={Theme.colors.text} size={24} />
                </TouchableOpacity>
            </View>

            {/* 3D Webview Container */}
            <View style={styles.webviewContainer}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={Theme.colors.primary} />
                        <Text style={styles.loadingText}>Initializing 3D Engine...</Text>
                    </View>
                )}

                <WebView
                    source={{ html: htmlContent }}
                    style={styles.webview}
                    scrollEnabled={false}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'loaded') {
                            setLoading(false);
                        }
                    }}
                    // Setting this true hides the webview until the model-viewer is initialized
                    // but since model-viewer has its own poster, we let webview load instantly 
                    // and use the onMessage to hide our native activity indicator.
                    onLoadEnd={() => setLoading(false)}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.l,
        paddingVertical: Theme.spacing.m,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: Theme.spacing.m,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Theme.shadows.small,
        shadowColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    webviewContainer: {
        flex: 1,
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    loadingText: {
        marginTop: Theme.spacing.m,
        color: Theme.colors.textLight,
        fontSize: 14,
        fontWeight: '500',
    }
});
