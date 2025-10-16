# Mistral API Integration with GreenCart

## Overview
This document explains how to integrate Mistral AI with the GreenCart chatbot system. The implementation supports both Mistral and OpenAI APIs, with Mistral as the preferred option.

## Setup Instructions

### 1. Obtain Mistral API Key
1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the API key for use in the next step

### 2. Configure the Environment
Add your Mistral API key to the backend `.env` file:

```env
MISTRAL_API_KEY=your_actual_mistral_api_key_here
```

If you want to use OpenAI as a fallback, you can also add:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. Install Required Dependencies
Make sure all required packages are installed:

```bash
cd backend
pip install -r requirements.txt
```

If you need to install additional packages:

```bash
pip install requests
```

### 4. Restart the Backend Server
After adding the API key and installing dependencies, restart the backend server:

```bash
cd backend
python app.py
```

## How It Works

### API Priority
The chatbot endpoint follows this priority:
1. Use Mistral API if `MISTRAL_API_KEY` is configured
2. Fall back to OpenAI API if `OPENAI_API_KEY` is configured
3. Use rule-based responses if neither API key is configured

### Supported Models
- Mistral: `mistral-small-latest` (default)
- OpenAI: `gpt-3.5-turbo` (default)

### Message Formatting
The system automatically formats messages for each API:
- For Mistral: Removes system messages and formats appropriately
- For OpenAI: Uses standard message formatting

## Testing the Integration

### Automated Test
Run the provided test script to verify the integration:

```bash
python test_mistral_integration.py
```

### Manual Test
You can also test the backend endpoint directly with a tool like curl or Postman:

```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant for GreenCart"
      },
      {
        "role": "user",
        "content": "What herbal remedies do you have for stress relief?"
      }
    ]
  }'
```

## Troubleshooting

### "MISTRAL_API_KEY environment variable not set" Error
1. Make sure you've added your API key to the `.env` file
2. Ensure the API key is not commented out (no `#` at the beginning of the line)
3. Verify the API key format
4. Restart the backend server after making changes

### "401 Unauthorized" Error
1. Check that your Mistral API key is valid
2. Verify that you haven't exceeded your rate limits
3. Ensure your account has sufficient credits

### "Connection Error"
1. Check your internet connectivity
2. Verify that the Mistral API endpoint is accessible
3. Check for firewall or proxy issues

## Security Considerations
1. The Mistral API key is stored in the backend `.env` file and never exposed to the frontend
2. All API calls are made server-side to protect your API key
3. Consider implementing rate limiting to prevent abuse

## Customization

### Changing the Model
To change the Mistral model, modify the `app.py` file:

```python
payload = {
    'model': 'mistral-medium-latest',  # Change this line
    'messages': mistral_messages,
    'max_tokens': 300,
    'temperature': 0.7
}
```

### Adjusting Parameters
You can adjust the following parameters in the API call:
- `max_tokens`: Maximum number of tokens to generate (default: 300)
- `temperature`: Controls randomness (default: 0.7)

## Fallback Behavior
When the Mistral API is not configured or available, the system will:
1. Try the OpenAI API if configured
2. Fall back to rule-based responses if neither API is available

This ensures that users always receive some response, even when AI services are not available.

## Performance Considerations
- Mistral API responses typically take 1-3 seconds
- The system implements proper error handling and timeouts
- Responses are cached where appropriate to improve performance