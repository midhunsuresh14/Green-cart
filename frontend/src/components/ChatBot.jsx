import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Leaf, ShoppingCart } from 'lucide-react';
import { api } from '../lib/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your GreenCart assistant. I can help you with our herbal remedies and products. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remedies, setRemedies] = useState([]);
  const [products, setProducts] = useState([]);
  const [conversationContext, setConversationContext] = useState({
    lastQuestion: null,
    awaitingConfirmation: false,
    topic: null
  });
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load remedies and products data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load remedies
        const remediesData = await api.listRemedies();
        setRemedies(Array.isArray(remediesData) ? remediesData : []);
        
        // Load products
        const productsData = await api.listProductsPublic();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Continue with empty arrays if data loading fails
      }
    };
    
    loadData();
  }, []);

  // Enhanced rule-based response system with better intent detection
  const generateRuleBasedResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // Handle exit intents
    if (input === 'no' || input === 'nope' || input === 'nah' || input === 'nothing' || input === 'that\'s all') {
      if (conversationContext.awaitingConfirmation) {
        setConversationContext(prev => ({ ...prev, awaitingConfirmation: false, lastQuestion: null }));
        return "Got it! If you need anything else later, just let me know. I'm here to help whenever you need herbal advice or product information. 🌿";
      }
      return "Understood. Is there anything else I can help you with regarding our herbal remedies or products?";
    }
    
    // Handle confirmation intents
    if (input === 'yes' || input === 'yeah' || input === 'yep' || input === 'sure' || input === 'okay') {
      if (conversationContext.awaitingConfirmation && conversationContext.lastQuestion) {
        setConversationContext(prev => ({ ...prev, awaitingConfirmation: false }));
        return conversationContext.lastQuestion;
      }
      return "Great! What would you like to know more about? I can tell you about our herbal remedies, products, or help with ordering.";
    }
    
    // Handle unclear input
    if (input === '' || input === '.' || input === '..' || input.length < 2 || 
        input.match(/^(huh|what|idk|dunno|dont know|don't know|not sure|um|uh|erm|er|hrm)$/)) {
      const clarificationPrompts = [
        "I didn't quite catch that. Could you rephrase that for me?",
        "Hmm, I'm not sure I understood. Could you tell me again in a different way?",
        "I'm a bit confused. Could you explain that a bit more clearly?",
        "I didn't get that. Would you mind rephrasing your question?",
        "Could you try asking that in a different way? I'm here to help!"
      ];
      return clarificationPrompts[Math.floor(Math.random() * clarificationPrompts.length)];
    }
    
    // Greetings
    if (input.match(/^(hello|hi|hey|greetings|good morning|good afternoon|good evening|g\'day)/)) {
      const greetings = [
        "Hello there! 🌿 I'm here to help you with GreenCart's herbal remedies and products. What would you like to know about our natural solutions?",
        "Hi! I'm your GreenCart assistant. I'd love to help you discover our herbal remedies and products. What can I tell you about?",
        "Greetings! I specialize in helping with herbal remedies and plant-based products. What brings you here today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Product/Remedy inquiries
    if (input.includes('product') || input.includes('item') || input.includes('plant') || input.includes('herb') || 
        input.includes('remedy') || input.includes('treatment') || input.includes('cure') || input.includes('health') ||
        input.includes('show me') || input.includes('tell me about') || input.includes('looking for')) {
      
      // Specific remedy search
      const searchTerm = input.replace(/^(what|which|can you tell me about|tell me about|show me|find|do you have|looking for|suggest)/, '').trim();
      
      // Check if user is asking about specific remedies
      if (remedies.length > 0) {
        const matchingRemedies = remedies.filter(remedy => 
          remedy.name.toLowerCase().includes(searchTerm) || 
          remedy.category.toLowerCase().includes(searchTerm) ||
          (remedy.keywords && remedy.keywords.some(k => k.toLowerCase().includes(searchTerm))) ||
          (remedy.illness && remedy.illness.toLowerCase().includes(searchTerm)) ||
          (remedy.tags && remedy.tags.some(t => t.toLowerCase().includes(searchTerm)))
        );
        
        if (matchingRemedies.length > 0) {
          const remedy = matchingRemedies[0];
          let response = `🌿 **${remedy.name}**\n\n` +
                 `**Category:** ${remedy.category}\n` +
                 `**Used for:** ${remedy.illness}\n` +
                 `**Description:** ${remedy.description}\n`;
                 
          if (remedy.benefits && remedy.benefits.length > 0) {
            response += `**Benefits:** ${remedy.benefits.join(', ')}\n`;
          }
          
          if (remedy.preparation) {
            response += `**How to use:** ${remedy.preparation}\n`;
          }
          
          if (remedy.dosage) {
            response += `**Recommended dosage:** ${remedy.dosage}\n`;
          }
          
          if (remedy.effectiveness) {
            response += `**Effectiveness:** ${remedy.effectiveness}\n`;
          }
          
          response += "\nWould you like to know more about this remedy or see other options? I'm happy to provide more details if you're interested!";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here's more about ${remedy.name}: ${remedy.description}`, awaitingConfirmation: true }));
          return response;
        }
      }
      
      // Check if user is asking about specific products
      if (products.length > 0) {
        const matchingProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          product.category.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm))
        );
        
        if (matchingProducts.length > 0) {
          const product = matchingProducts[0];
          let response = `🌱 **${product.name}**\n\n` +
                 `**Category:** ${product.category}${product.subcategory ? ` > ${product.subcategory}` : ''}\n` +
                 `**Price:** $${product.price}\n` +
                 `**Description:** ${product.description}\n` +
                 `**In stock:** ${product.stock > 0 ? '✅ Yes' : '❌ No'}\n`;
                 
          if (product.discount && product.discount > 0) {
            response += `**Discount:** ${product.discount}% off\n`;
          }
          
          response += "\nWould you like to know more about this product or see other options? I can tell you more if you're interested!";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here's more about ${product.name}: ${product.description}`, awaitingConfirmation: true }));
          return response;
        }
      }
      
      // Show categories if no specific search term
      if (remedies.length > 0) {
        const categories = [...new Set(remedies.map(r => r.category))];
        return `We have herbal remedies for various health conditions. Our main categories include:\n\n` +
               categories.slice(0, 5).map(cat => `• ${cat}`).join('\n') +
               `\n\nYou can ask me about remedies for specific conditions like stress, skin issues, or immunity. What would you like to explore?`;
      }
      
      return "We have a wide variety of herbal remedies and products. You can ask me about specific remedies for conditions like stress, skin issues, or immunity, or about specific products. What are you looking for?";
    }
    
    // Order inquiries
    if (input.includes('order') || input.includes('buy') || input.includes('purchase') || input.includes('cart') || input.includes('checkout')) {
      const response = "🛒 To place an order:\n\n" +
             "1. Browse our herbal remedies and products\n" +
             "2. Click on any item to view details\n" +
             "3. Select quantity and click 'Add to Cart'\n" +
             "4. Click the shopping cart icon to view your cart\n" +
             "5. Proceed to checkout and enter your shipping/payment info\n\n" +
             "Would you like me to walk you through any specific step?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here are the steps to place an order with us...", awaitingConfirmation: true }));
      return response;
    }
    
    // Shipping inquiries
    if (input.includes('shipping') || input.includes('delivery') || input.includes('ship') || input.includes('arrive')) {
      const response = "🚚 Shipping Information:\n\n" +
             "• Standard shipping: 3-5 business days\n" +
             "• Express shipping: 1-2 business days (extra fee)\n" +
             "• Free shipping on orders over $50\n" +
             "• We ship to all 50 states\n\n" +
             "Would you like to know more about tracking your order or international shipping?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what you need to know about our shipping options...", awaitingConfirmation: true }));
      return response;
    }
    
    // Returns inquiries
    if (input.includes('return') || input.includes('refund') || input.includes('exchange')) {
      const response = "↩️ Return Policy:\n\n" +
             "• 30-day return policy on all products\n" +
             "• Items must be unopened and in original packaging\n" +
             "• Contact support with your order number to initiate a return\n" +
             "• Refunds processed within 5-7 business days\n\n" +
             "Do you need help initiating a return or have questions about exchanges?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's information about our return policy...", awaitingConfirmation: true }));
      return response;
    }
    
    // Specific health conditions
    if (input.includes('stress') || input.includes('anxiety') || input.includes('relax') || input.includes('sleep')) {
      if (remedies.length > 0) {
        const stressRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('stress') || 
          r.category.toLowerCase().includes('sleep') ||
          r.illness.toLowerCase().includes('stress') ||
          r.illness.toLowerCase().includes('anxiety') ||
          r.illness.toLowerCase().includes('insomnia') ||
          r.keywords.some(k => k.toLowerCase().includes('stress')) ||
          r.keywords.some(k => k.toLowerCase().includes('anxiety')) ||
          r.keywords.some(k => k.toLowerCase().includes('sleep'))
        );
        
        if (stressRemedies.length > 0) {
          const remedyNames = stressRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `😌 For stress and sleep issues, we recommend:

${remedyNames}

` +
                 "These natural remedies can help promote relaxation and improve sleep quality. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help with stress and sleep: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "😌 For stress and anxiety relief, we recommend our Chamomile Tea and Lavender Essential Oil. " +
             "These natural remedies can help promote relaxation and improve sleep quality. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for stress relief...", awaitingConfirmation: true }));
      return response;
    }
    
    if (input.includes('skin') || input.includes('face') || input.includes('beauty') || input.includes('acne') || input.includes('eczema')) {
      if (remedies.length > 0) {
        const skinRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('skin') || 
          r.illness.toLowerCase().includes('skin') ||
          r.illness.toLowerCase().includes('acne') ||
          r.illness.toLowerCase().includes('eczema') ||
          r.keywords.some(k => k.toLowerCase().includes('skin')) ||
          r.keywords.some(k => k.toLowerCase().includes('acne')) ||
          r.keywords.some(k => k.toLowerCase().includes('eczema'))
        );
        
        if (skinRemedies.length > 0) {
          const remedyNames = skinRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `✨ For skin health, we offer:

${remedyNames}

` +
                 "These natural solutions can help with various skin conditions. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help with skin issues: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "✨ For skin health, we offer Aloe Vera Gel and Tea Tree Oil products. " +
             "These natural solutions can help with various skin conditions including acne, irritation, and dryness. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for skin health...", awaitingConfirmation: true }));
      return response;
    }
    
    if (input.includes('immune') || input.includes('cold') || input.includes('flu') || input.includes('sick') || input.includes('infection')) {
      if (remedies.length > 0) {
        const immuneRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('immune') || 
          r.illness.toLowerCase().includes('cold') ||
          r.illness.toLowerCase().includes('flu') ||
          r.illness.toLowerCase().includes('infection') ||
          r.keywords.some(k => k.toLowerCase().includes('immune')) ||
          r.keywords.some(k => k.toLowerCase().includes('cold')) ||
          r.keywords.some(k => k.toLowerCase().includes('flu')) ||
          r.keywords.some(k => k.toLowerCase().includes('infection'))
        );
        
        if (immuneRemedies.length > 0) {
          const remedyNames = immuneRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `🛡️ To boost your immune system, try:

${remedyNames}

` +
                 "These natural remedies can help strengthen your body's defenses. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help boost your immune system: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "🛡️ To boost your immune system, try our Echinacea supplements and Elderberry syrup. " +
             "These natural remedies can help strengthen your body's defenses against common illnesses. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for immune support...", awaitingConfirmation: true }));
      return response;
    }
    
    if (input.includes('pain') || input.includes('ache') || input.includes('muscle') || input.includes('headache') || input.includes('joint')) {
      if (remedies.length > 0) {
        const painRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('pain') || 
          r.illness.toLowerCase().includes('pain') ||
          r.illness.toLowerCase().includes('ache') ||
          r.illness.toLowerCase().includes('muscle') ||
          r.illness.toLowerCase().includes('headache') ||
          r.illness.toLowerCase().includes('joint') ||
          r.keywords.some(k => k.toLowerCase().includes('pain')) ||
          r.keywords.some(k => k.toLowerCase().includes('ache')) ||
          r.keywords.some(k => k.toLowerCase().includes('muscle')) ||
          r.keywords.some(k => k.toLowerCase().includes('headache')) ||
          r.keywords.some(k => k.toLowerCase().includes('joint'))
        );
        
        if (painRemedies.length > 0) {
          const remedyNames = painRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `🤕 For pain relief, we recommend:

${remedyNames}

` +
                 "These natural remedies can help with various types of pain. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help with pain relief: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "🤕 For pain relief, we offer Arnica Gel and Turmeric supplements. " +
             "These natural remedies can help with muscle pain, joint pain, and inflammation. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for pain relief...", awaitingConfirmation: true }));
      return response;
    }
    
    // Digestive health
    if (input.includes('digest') || input.includes('stomach') || input.includes('nausea') || input.includes('ibs') || input.includes('bloating')) {
      if (remedies.length > 0) {
        const digestRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('digest') || 
          r.illness.toLowerCase().includes('digest') ||
          r.illness.toLowerCase().includes('stomach') ||
          r.illness.toLowerCase().includes('nausea') ||
          r.illness.toLowerCase().includes('ibs') ||
          r.illness.toLowerCase().includes('bloating') ||
          r.keywords.some(k => k.toLowerCase().includes('digest')) ||
          r.keywords.some(k => k.toLowerCase().includes('stomach')) ||
          r.keywords.some(k => k.toLowerCase().includes('nausea')) ||
          r.keywords.some(k => k.toLowerCase().includes('ibs')) ||
          r.keywords.some(k => k.toLowerCase().includes('bloating'))
        );
        
        if (digestRemedies.length > 0) {
          const remedyNames = digestRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `🌿 For digestive health, we recommend:

${remedyNames}

` +
                 "These natural remedies can help with various digestive issues. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help with digestive issues: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "🌿 For digestive health, we offer Ginger Tea and Peppermint Oil. " +
             "These natural remedies can help with nausea, indigestion, and IBS symptoms. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for digestive health...", awaitingConfirmation: true }));
      return response;
    }
    
    // Respiratory health
    if (input.includes('cough') || input.includes('cold') || input.includes('respir') || input.includes('bronch') || input.includes('throat')) {
      if (remedies.length > 0) {
        const respRemedies = remedies.filter(r => 
          r.category.toLowerCase().includes('respir') || 
          r.illness.toLowerCase().includes('cough') ||
          r.illness.toLowerCase().includes('cold') ||
          r.illness.toLowerCase().includes('bronch') ||
          r.illness.toLowerCase().includes('throat') ||
          r.keywords.some(k => k.toLowerCase().includes('cough')) ||
          r.keywords.some(k => k.toLowerCase().includes('cold')) ||
          r.keywords.some(k => k.toLowerCase().includes('respir')) ||
          r.keywords.some(k => k.toLowerCase().includes('bronch')) ||
          r.keywords.some(k => k.toLowerCase().includes('throat'))
        );
        
        if (respRemedies.length > 0) {
          const remedyNames = respRemedies.slice(0, 3).map(r => r.name).join(', ');
          const response = `🫁 For respiratory health, we recommend:

${remedyNames}

` +
                 "These natural remedies can help with cough, cold, and respiratory issues. " +
                 "Would you like detailed information about any specific remedy?";
          setConversationContext(prev => ({ ...prev, lastQuestion: `Here are some remedies that might help with respiratory issues: ${remedyNames}`, awaitingConfirmation: true }));
          return response;
        }
      }
      const response = "🫁 For respiratory health, we offer Eucalyptus Steam Treatment and Thyme & Honey Syrup. " +
             "These natural remedies can help with cough, congestion, and sore throat. " +
             "Would you like more information about these products?";
      setConversationContext(prev => ({ ...prev, lastQuestion: "Here's what we recommend for respiratory health...", awaitingConfirmation: true }));
      return response;
    }
    
    // Thank you responses
    if (input.includes('thank')) {
      const responses = [
        "You're very welcome! 🌿 I'm always here to help with our herbal remedies and products. Is there anything else I can assist you with today?",
        "It's my pleasure! I'm glad I could help. If you have any other questions about our natural solutions, just let me know!",
        "You're so welcome! I enjoy helping our customers discover the benefits of herbal remedies. Anything else I can help with?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default response with empathy
    const responses = [
      "I understand you're looking for information. Could you tell me more about what you're interested in? I'd love to help with our herbal remedies or products.",
      "That's an interesting question. I'm here to help with our natural solutions. Could you share a bit more about what you're looking for?",
      "Thanks for reaching out! I specialize in helping with herbal remedies and plant-based products. What would you like to know more about?",
      "I'm here to help make your experience with GreenCart wonderful! Is there something specific about our herbal remedies or products you'd like to explore?",
      "I'd be happy to assist you! We have a variety of natural solutions for different needs. What brings you here today?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Function to get response from AI API (Mistral/OpenAI) with context about remedies and products
  const getAIResponse = async (userInput, conversationHistory) => {
    try {
      // Prepare context with remedies and products data
      const remediesContext = remedies.slice(0, 10).map(remedy => ({
        name: remedy.name,
        category: remedy.category,
        illness: remedy.illness,
        description: remedy.description,
        benefits: remedy.benefits,
        preparation: remedy.preparation
      }));
      
      const productsContext = products.slice(0, 10).map(product => ({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description
      }));
      
      // Prepare the system message with context about GreenCart's products
      const systemMessage = {
        role: "system",
        content: `You are a helpful, empathetic assistant for GreenCart, an e-commerce platform specializing in herbal remedies and medicinal plants. 
        Your role is to help customers with questions specifically about:
        1. Herbal remedies for various health conditions
        2. Medicinal plants and their uses
        3. Product information and availability
        4. Ordering and delivery process
        
        Here is some context about our current remedies:
        ${JSON.stringify(remediesContext, null, 2)}
        
        And here is some context about our current products:
        ${JSON.stringify(productsContext, null, 2)}
        
        Keep your responses concise, friendly, and accurate. Focus only on herbal remedies and products. 
        If you don't know something, suggest the customer check the website or contact support.
        Always stay in character as a knowledgeable herbal and plant expert.
        Show empathy and use a warm, human-friendly tone.
        When users say "yes", provide the information you promised.
        When users say "no", respect their decision and offer other help.
        When users give unclear input, ask clarifying questions.`
      };
      
      // Prepare the messages for the API call
      const messagesForAPI = [systemMessage];
      
      // Add conversation history
      for (const msg of conversationHistory) {
        messagesForAPI.push({
          role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
          content: msg.content || msg.text
        });
      }
      
      // Add the user's latest message
      messagesForAPI.push({
        role: "user",
        content: userInput
      });
      
      // Call the backend endpoint via centralized API client
      const data = await api.chatbot(messagesForAPI);
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Provide more specific error messages based on the error type
      if (error.message.includes('configured')) {
        throw new Error('AI_NOT_CONFIGURED');
      } else if (error.message.includes('API error')) {
        throw new Error('AI_ERROR');
      } else {
        throw new Error('CONNECTION_ERROR');
      }
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history (last 6 messages to keep context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Try to get response from AI (Mistral/OpenAI)
      let botResponse;
      try {
        botResponse = await getAIResponse(inputValue, conversationHistory);
      } catch (error) {
        // If AI fails, fall back to rule-based responses
        if (error.message === 'AI_NOT_CONFIGURED' || error.message === 'AI_ERROR' || error.message === 'CONNECTION_ERROR') {
          botResponse = generateRuleBasedResponse(inputValue);
        } else {
          throw error; // Re-throw unexpected errors
        }
      }
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Fallback to rule-based responses if AI fails
      const fallbackResponse = generateRuleBasedResponse(inputValue);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
        style={{ zIndex: 1000 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50"
             style={{ zIndex: 1000 }}>
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf size={20} />
              <span className="font-semibold">GreenCart Assistant</span>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex mb-4 justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300 text-gray-700">
                    <Bot size={16} />
                  </div>
                  <div className="rounded-lg p-3 bg-white text-gray-800 border border-gray-200 rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about our herbal remedies..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={inputValue.trim() === '' || isLoading}
                className="bg-green-600 text-white rounded-full p-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Specialized in herbal remedies & products
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;