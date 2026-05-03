# Models (Pydantic Schemas) for request and response validation

from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str 
    
class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    topic: str = "General" 

class ChatResponse(BaseModel):
    reply: str 
    tokens: list[str] 