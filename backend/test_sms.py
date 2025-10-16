import os
import sys
from dotenv import load_dotenv

try:
    from twilio.rest import Client as TwilioClient
except Exception as e:
    TwilioClient = None


def fail(message: str, code: int = 1) -> None:
    print(f"Error: {message}")
    sys.exit(code)


def main() -> None:
    load_dotenv()

    if TwilioClient is None:
        fail("twilio package not available. Install with: pip install twilio")

    if len(sys.argv) < 2:
        print("Usage: python test_sms.py <to_phone> [message]")
        print("Example: python test_sms.py +15551234567 'Hello from GreenCart'")
        sys.exit(2)

    to_phone = sys.argv[1]
    message_body = sys.argv[2] if len(sys.argv) > 2 else "Test SMS from GreenCart"

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")

    if not account_sid or not auth_token or not from_number:
        fail("Missing Twilio env vars. Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER are set in backend/.env")

    try:
        client = TwilioClient(account_sid, auth_token)
        to_param = to_phone
        if str(from_number).startswith("whatsapp:") and not str(to_phone).startswith("whatsapp:"):
            to_param = f"whatsapp:{to_phone}"

        msg = client.messages.create(body=message_body, from_=from_number, to=to_param)
        print(f"Sent. SID: {msg.sid}")
    except Exception as e:
        fail(f"Failed to send: {e}")


if __name__ == "__main__":
    main()















