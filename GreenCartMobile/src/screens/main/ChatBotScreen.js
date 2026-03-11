import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../api/config';
import { Send, Bot } from 'lucide-react-native';

export default function ChatBotScreen({ navigation }) {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hi there! I am your GreenCart assistant. How can I help you with your plants today?', sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText.trim(), sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await api.post('/chatbot', { message: userMsg.text });

            const botMsg = {
                id: (Date.now() + 1).toString(),
                text: response.data.reply || response.data.message || 'I received your message, but the AI service did not return a valid response.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('ChatBot Error:', error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I am having trouble connecting to the server. Please try again later.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
            // scroll to bottom
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const renderMessage = ({ item }) => {
        const isBot = item.sender === 'bot';
        return (
            <View style={[styles.messageWrapper, isBot ? styles.messageWrapperBot : styles.messageWrapperUser]}>
                {isBot && (
                    <View style={styles.botAvatar}>
                        <Bot color="#FFF" size={20} />
                    </View>
                )}
                <View style={[styles.messageBubble, isBot ? styles.messageBubbleBot : styles.messageBubbleUser]}>
                    <Text style={[styles.messageText, isBot ? styles.messageTextBot : styles.messageTextUser]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack() || navigation.navigate('HomeTab')}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>GreenBot</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.chatList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about plants, care, or remedies..."
                        placeholderTextColor={Theme.colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send color="#FFF" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        ...Theme.shadows.small,
        zIndex: 10,
    },
    title: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: '#10b981', // emerald-500
    },
    backBtnText: {
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
    },
    keyboardView: {
        flex: 1,
    },
    chatList: {
        padding: Theme.spacing.m,
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.m,
        alignItems: 'flex-end',
    },
    messageWrapperBot: {
        justifyContent: 'flex-start',
        paddingRight: '15%',
    },
    messageWrapperUser: {
        justifyContent: 'flex-end',
        paddingLeft: '15%',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    messageBubble: {
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.l,
        maxWidth: '100%',
    },
    messageBubbleBot: {
        backgroundColor: Theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    messageBubbleUser: {
        backgroundColor: Theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: Theme.typography.body.fontSize,
        lineHeight: 22,
    },
    messageTextBot: {
        color: Theme.colors.text,
    },
    messageTextUser: {
        color: '#FFF',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.l,
        paddingHorizontal: Theme.spacing.m,
        paddingTop: Theme.spacing.m,
        paddingBottom: Theme.spacing.m,
        maxHeight: 100,
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.text,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Theme.spacing.s,
    },
    sendBtnDisabled: {
        backgroundColor: Theme.colors.border,
    }
});
