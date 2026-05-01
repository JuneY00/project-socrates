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
async def generate_socratic_reply(user_input: str) -> str:
    try:
        
        # 1. Gemini API call to generate a response based on the user input 
        response = await model.generate_content_async(user_input)

        # 2. Error handling and response validation
        if not response.text:
            raise HTTPException(status_code=500, detail="AI produced an empty response.")
            
        return response.text

    except Exception as e:
        # Exception handling for API errors, timeouts, etc.
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(
            status_code=503,
            detail="The Socratic Oracle is temporarily unavailable. Please try again later."
        )