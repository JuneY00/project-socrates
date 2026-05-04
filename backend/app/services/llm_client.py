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
    "You are Socrates, a virtual Socratic tutor built by Valearnis — an educational platform for students aged 10-18. "
    "Your role is to help students think critically about ANY school subject using the Socratic method. "
    "\n\n"
    "RULES:\n"
    "- Never give direct answers. Ask 1 short question that guides the student to think deeper.\n"
    "- Keep every response under 3 sentences.\n"
    "- Use simple, friendly language suitable for students aged 10-18.\n"
    "- Respond in the same language the user writes in.\n"
    "- Cover any school subject: maths, science, history, philosophy, English, etc.\n"
    "- If a student seems frustrated, be encouraging and patient.\n"
    "- Do not use theatrical or overly dramatic language.\n"
    "- Do not use any markdown formatting such as **, *, $, backticks, #, or LaTeX. Plain text only.\n"  

)

# get user input and generate a Socratic reply 
async def generate_socratic_reply(messages: list, topic: str, tokens: list) -> str:
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
        dynamic_prompt = SYSTEM_PROMPT+(
            f"\nThe student has selected the topic: {topic}. "
            f"Focus your Socratic questions around {topic}. "
            f"Key concepts from the student's question: {', '.join(tokens)}. " 
            "If the question is unrelated, gently guide them back to this topic."
        )
        
        # Model initialize use gemini-flash-latest
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=dynamic_prompt,
            generation_config=genai.GenerationConfig(
            temperature=0.7,   # creativity level (0.0 = deterministic, 1.0 = very creative)
            )
        )

        # Prepare the conversation history for the Gemini API        
        #   - last message is the latest user input, and the rest are the conversation history
        gemini_history = []
        for msg in messages[:-1]:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.content]})


        # Start a chat session with the Gemini model using the conversation history
        chat = model.start_chat(history=gemini_history)

        # query the Gemini model with the latest user message
        latest_user_message = messages[-1].content if messages else ""
        response = await chat.send_message_async(latest_user_message)
        
        print("=== Gemini response ===")
        print(response.text)  
        print("======================")
        
        # Check if response is valid
        if not response or not response.text:
            raise ValueError("Empty response from AI")
            
        return response.text

    except ValueError as ve:
        # Handle invalid response from Gemini API
        print(f"Invalid response from Gemini API: {ve}")
        raise HTTPException(
            status_code=502,
            detail="Received an invalid response from the Socratic Oracle. Please try again."
        )
        
    except Exception as e:
        # Exception handling for API errors, timeouts, etc.
        err_msg = str(e).lower()
        print(f"[ERROR] Error communicating with Gemini API: {e}")
        
        # Rate limit or quota errors  
        if "429" in err_msg or "quota" in err_msg:
            raise HTTPException(
                status_code=429,
                detail="The Socratic Oracle is currently experiencing high demand. Please try again later."
            )
        # API key or permission errors
        elif "403" in err_msg or "permission" in err_msg:
            raise HTTPException(
                status_code=403,
                detail="Access to the Socratic Oracle is forbidden. Please contact support."
            )    
        # Other errors (network issues, server errors, etc.)
        raise HTTPException(
            status_code=503,
            detail="The Socratic Oracle is temporarily unavailable. Please try again later."
        )