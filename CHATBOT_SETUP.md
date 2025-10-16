# GreenCart Chatbot Setup Guide

## Overview
This guide explains how to set up and use the AI-powered chatbot for GreenCart, which can use either the Mistral API or OpenAI API to provide intelligent customer support. Mistral is the preferred option, with OpenAI as a fallback.

## Prerequisites
1. Either Mistral API key (sign up at https://console.mistral.ai/) or OpenAI API key (sign up at https://platform.openai.com/)
2. Python packages installed (run `pip install -r backend/requirements.txt`)
3. Running backend server

## Setup Instructions

### 1. Configure API Key
Add either your Mistral API key (preferred) or OpenAI API key to the backend `.env` file:

For Mistral (preferred):
```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

For OpenAI (fallback):
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Important:** Replace `your_mistral_api_key_here` with your actual API key from Mistral, or `sk-your_openai_api_key_here` with your actual API key from OpenAI.

### 2. Install Dependencies
Make sure all required packages are installed:

```bash
cd backend
pip install -r requirements.txt
```

If you haven't installed the OpenAI package yet, you can install it directly:

```bash
cd backend
pip install openai
```

### 3. Restart the Backend Server
After adding the API key and installing dependencies, restart the backend server:

```bash
cd backend
python app.py
```

## How It Works

### Frontend Integration
The chatbot component is already integrated into the main App component and will appear as a floating button on all pages.

When the AI service is not configured or available, the chatbot automatically falls back to rule-based responses, so users will always get some response.

### Backend Endpoint
The backend provides a `/api/chatbot` endpoint that:
1. Receives user messages and conversation history
2. Calls the Mistral API (if configured) or falls back to OpenAI API with a system prompt that defines the bot's personality
3. Returns AI-generated responses

### Conversation Context
The chatbot maintains context by sending the last 6 messages in the conversation history to the AI, allowing for more natural conversations.

## Customization

### Bot Personality
The system prompt in `backend/app.py` defines the bot's personality. You can modify this to change how the bot responds:

```python
system_message = {
    "role": "system",
    "content": """You are a helpful assistant for GreenCart, an e-commerce platform for herbal remedies and medicinal plants. 
    Your role is to help customers with questions about:
    1. Herbal remedies for various health conditions
    2. Medicinal plants and their uses
    3. Product information and availability
    4. Ordering and delivery process
    5. General customer support
    
    Keep your responses concise, friendly, and accurate. If you don't know something, suggest the customer check the website or contact support.
    Always stay in character as a knowledgeable herbal and plant expert."""
}
```

### Model Selection
The chatbot uses `mistral-small-latest` for Mistral or `gpt-3.5-turbo` for OpenAI. You can change these in the backend code:

For Mistral:
```python
payload = {
    'model': 'mistral-small-latest',  # or another Mistral model
    'messages': mistral_messages,
    'max_tokens': 300,
    'temperature': 0.7
}
```

For OpenAI:
```python
response = client.chat.completions.create(
    model="gpt-4",  # or another OpenAI model
    messages=messages,
    max_tokens=300,
    temperature=0.7
)
```

## Testing
To test the chatbot:
1. Start both the frontend and backend servers
2. Navigate to any page in the GreenCart application
3. Click the chatbot icon in the bottom-right corner
4. Type a message and press Enter or click Send

You can also test the backend endpoint directly with a tool like curl or Postman:

```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you help me with?", "history": []}'
```

If no API key is configured, you'll receive:
```json
{"error": "No API keys configured. Please set MISTRAL_API_KEY or OPENAI_API_KEY in environment variables."}
```

Once configured, you'll receive an AI-generated response:
```json
{"response": "Hello! I'm here to help you with GreenCart..."}
```

## Troubleshooting

### "OpenAI API key not configured" Error
1. Make sure you've added your API key to the `.env` file
2. Ensure the API key is not commented out (no `#` at the beginning of the line)
3. Verify the API key format (should start with `sk-`)
4. Restart the backend server after making changes

### "ImportError: No module named openai" Error
Run `pip install openai requests` to install the required packages.

### Rate Limiting
If you encounter rate limiting issues, consider implementing request throttling or upgrading your OpenAI plan.

## Security Considerations
1. The OpenAI API key is stored in the backend `.env` file and never exposed to the frontend
2. All API calls are made server-side to protect your API key
3. Consider implementing rate limiting to prevent abuse

## Fallback Behavior
When the AI service is not configured or available, the chatbot automatically falls back to rule-based responses. This ensures that users always receive some response, even when the AI service is not available.

The fallback responses are based on pattern matching and can handle common queries about:
- Greetings
- Herbal remedies
- Ordering process
- Contact information
- General support

## Future Enhancements
1. Add function calling to allow the bot to retrieve product information directly
2. Implement conversation logging for analytics
3. Add support for multiple languages
4. Integrate with the product database to provide specific product recommendations