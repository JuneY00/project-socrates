# View (API Routes) Logic

from fastapi import FastAPI
from app.schemas import ChatRequest, ChatResponse
from app.services.nlp_proc import process_text
from app.services.llm_client import generate_socratic_reply
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Socrates AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages and generate responses.

    Args:
        request (ChatRequest): The chat request containing user messages.

    Returns:
        ChatResponse: The chat response containing the generated reply and tokens.
    """
    
    # entire conversation history from the user, 
    # which can be used for context in generating replies
    history = request.messages

    if not history:
        return {"reply": "Hello! I'm Socrates. What would you like to discuss today?", "tokens": []}

    
    # entire conversation history from the user, 
    # which can be used for context in generating replies
    history = request.messages 
    
    if not history:
        return {"reply": "Hello! I'm Socrates. What would you like to discuss today?", "tokens": []}

    tokens = process_text(history)

    reply = await generate_socratic_reply(history)

    return {"reply": reply, "tokens": tokens}