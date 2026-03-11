import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import { Camera, Image as ImageIcon, Leaf, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/config';
import Button from '../../components/ui/Button';

export default function IdentifyScreen() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return cameraStatus === 'granted' && libraryStatus === 'granted';
    };

    const pickImage = async (useCamera = false) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera and gallery permissions are required to use this feature.');
            return;
        }

        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true, // we need base64 to send the image easily 
        };

        try {
            let result = null;
            if (useCamera) {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0]);
                setResult(null); // Reset previous results
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const identifyPlant = async () => {
        if (!image || !image.base64) {
            Alert.alert('Error', 'Please select an image first.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/identify-plant', {
                image: `data:image/jpeg;base64,${image.base64}`
            });

            if (response.data.success) {
                setResult(response.data.result);
            } else {
                Alert.alert('Error', response.data.error || 'Could not identify plant');
            }
        } catch (error) {
            // Since the actual backend uses PlantNet which might have rate limits or 
            // multipart form upload might be preferred depending on backend config
            // the web app sends base64 image as well.
            console.error("Identify Error:", error);
            Alert.alert('Error', 'Failed to connect to the identification service.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        return (
            <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Identification Result</Text>

                {result.bestMatch && (
                    <View style={styles.matchCard}>
                        <Text style={styles.matchName}>{result.bestMatch}</Text>
                        <Text style={styles.matchScore}>
                            Match Confidence: {((result.score || 0) * 100).toFixed(1)}%
                        </Text>
                    </View>
                )}

                {result.description && (
                    <Text style={styles.descriptionText}>{result.description}</Text>
                )}

                {result.medicinal_uses && result.medicinal_uses.length > 0 && (
                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>Medicinal Uses</Text>
                        {result.medicinal_uses.map((use, i) => (
                            <Text key={i} style={styles.listItem}>• {use}</Text>
                        ))}
                    </View>
                )}

                {result.care_instructions && (
                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>Care Instructions</Text>
                        {Object.entries(result.care_instructions).map(([key, value]) => (
                            <Text key={key} style={styles.listItem}>
                                <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{key.replace('_', ' ')}: </Text>
                                {value}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Plant Identifier</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {!image ? (
                    <View style={styles.uploadPlaceholder}>
                        <Leaf color={Theme.colors.primaryLight} size={64} style={{ marginBottom: Theme.spacing.m }} />
                        <Text style={styles.placeholderTitle}>Upload a photo to identify it</Text>
                        <Text style={styles.placeholderText}>
                            Take a clear photo of the leaves or flowers for best results.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImage(null); setResult(null); }}>
                            <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => pickImage(true)}
                    >
                        <Camera color={Theme.colors.primary} size={24} />
                        <Text style={styles.actionBtnText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => pickImage(false)}
                    >
                        <ImageIcon color={Theme.colors.primary} size={24} />
                        <Text style={styles.actionBtnText}>Gallery</Text>
                    </TouchableOpacity>
                </View>

                {image && !result && (
                    <Button
                        title="Identify Plant"
                        onPress={identifyPlant}
                        loading={loading}
                        style={{ marginTop: Theme.spacing.l }}
                    />
                )}

                {loading && !result && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Theme.colors.primary} />
                        <Text style={styles.loadingText}>Analyzing image...</Text>
                    </View>
                )}

                {renderResult()}

            </ScrollView>
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
    scrollContent: {
        padding: Theme.spacing.m,
    },
    uploadPlaceholder: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.xxl,
        borderRadius: Theme.borderRadius.l,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Theme.colors.border,
        borderStyle: 'dashed',
        marginBottom: Theme.spacing.l,
    },
    placeholderTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
        textAlign: 'center',
    },
    placeholderText: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        borderRadius: Theme.borderRadius.l,
        overflow: 'hidden',
        marginBottom: Theme.spacing.l,
        position: 'relative',
        ...Theme.shadows.medium,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    removeImageBtn: {
        position: 'absolute',
        top: Theme.spacing.m,
        right: Theme.spacing.m,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Theme.spacing.xs,
        ...Theme.shadows.small,
    },
    actionBtnText: {
        marginLeft: Theme.spacing.s,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        fontSize: Theme.typography.body.fontSize,
    },
    loadingContainer: {
        marginTop: Theme.spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Theme.spacing.m,
        color: Theme.colors.primary,
        fontWeight: '500',
    },
    resultContainer: {
        marginTop: Theme.spacing.l,
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.l,
        ...Theme.shadows.small,
    },
    resultTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.m,
    },
    matchCard: {
        backgroundColor: Theme.colors.primaryLight + '30',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.m,
        borderWidth: 1,
        borderColor: Theme.colors.primaryLight,
    },
    matchName: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    matchScore: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.text,
        marginTop: 4,
    },
    descriptionText: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
        marginBottom: Theme.spacing.m,
    },
    infoSection: {
        marginBottom: Theme.spacing.m,
        paddingBottom: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    infoTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
    },
    listItem: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        marginBottom: 4,
        lineHeight: 22,
    }
});
