import spacy

# model loading with error handling (in case the model isn't downloaded yet)
try:
    nlp = spacy.load("en_core_web_sm") # suitable for basic NLP tasks
except OSError:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def process_text(messages):
    """Process user messages to extract relevant tokens.

    Args:
        messages (list): List of user messages.

    Returns:
        list: List of processed tokens.
    """
    
    if not messages:
        return []

    # Extract the latest user message (question)
    latest_user_message = messages[-1].content if messages else ""

    if not latest_user_message.strip():
        return []

    # Use spaCy to process the latest user message and extract relevant tokens
    doc = nlp(latest_user_message)
    tokens = []
    for token in doc:
        if not token.is_stop and not token.is_punct:
            if token.pos_ in ["NOUN", "VERB", "ADJ"]:
                tokens.append(token.lemma_)

    unique_tokens = list(set(tokens))

    # Return top 5 unique tokens for simplicity
    return unique_tokens[:5]
   