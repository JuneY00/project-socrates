# LLM (Large Language Model) Client API Logic 

import os
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

# setup Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables")

genai.configure(api_key=api_key)

# System prompt to guide the behavior of the Gemini model as Socrates
SYSTEM_PROMPT = (
    "1. You are Socrates, the ancient Greek philosopher. "
    "2. Your goal is to practice the Socratic method. Do not give direct answers. "
    "3. Instead, ask probing questions that challenge the user's assumptions and help them "
    "4. reach their own conclusions. Be humble, intellectual, and slightly ironic."
)

# Model initialize use gemini-flash-latest
model = genai.GenerativeModel(
    model_name="gemini-flash-latest",
    system_instruction=SYSTEM_PROMPT
)

# get user input and generate a Socratic reply 
async def generate_socratic_reply(messages: list) -> str:
    """Generate a Socratic reply based on the user's messages.

    Args:
        messages (list): List of user messages.

    Raises:
        HTTPException: If there is an error with the Gemini API.
        HTTPException: If the response from the Gemini API is invalid.

    Returns:
        str: The Socratic reply from the Gemini API.
    """

    try:
        # 1. Prepare the conversation history for the Gemini API        
        #   - last message is the latest user input, and the rest are the conversation history
        gemini_history = []
        for msg in messages[:-1]:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.content]})


        # 2. Start a chat session with the Gemini model using the conversation history
        chat = model.start_chat(history=gemini_history)

        # 3. query the Gemini model with the latest user message
        latest_user_message = messages[-1].content if messages else ""
        response = await chat.send_message_async(latest_user_message)

        if not response.text:
            raise HTTPException(status_code=500, detail="Socrates has stepped away for a moment.")
            
        return response.text

    except Exception as e:
        # Exception handling for API errors, timeouts, etc.
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(
            status_code=503,
            detail="The Socratic Oracle is temporarily unavailable. Please try again later."
        )