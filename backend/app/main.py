# View (API Routes) Logic

from fastapi import FastAPI
from app.schemas import ChatRequest, ChatResponse
from app.services.nlp_proc import process_text
from app.services.llm_client import generate_socratic_reply

app = FastAPI(title="Socrates AI")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    
    # NLP preprocessing: tokenization, lemmatization 
    tokens = process_text(request.message)
    
    # gemini api call to generate a reply based on the user's message
    reply = await generate_socratic_reply(request.message)
    
    return {"reply": reply, "tokens": tokens}