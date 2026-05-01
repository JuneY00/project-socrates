# Natural Language Processing (NLP) Logic
import spacy

# model loading with error handling (in case the model isn't downloaded yet)
try:
    nlp = spacy.load("en_core_web_sm") # suitable for basic NLP tasks
except OSError:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def process_text(text: str):
    if not text.strip():
        return []
        
    doc = nlp(text)
    # Tokenization, lemmatization, and removal of stop words/punctuation
    tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
    return tokens