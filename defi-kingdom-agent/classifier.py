import os
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableBranch, RunnableLambda
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import json
from utils.format_llm_response import extract_json
from prompts.classifier_prompt import classifier_prompt
from prompts.hero_prompt import hero_prompt

os.environ["GROQ_API_KEY"] = "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"

# Initialize model
model = ChatGroq(model="gemma2-9b-it", temperature=0)


def _transaction_prompt(user_id, role, query):
    memory = get_user_memory(user_id)
    if role.lower() == 'assistant'.lower():
        memory.append((query))
    else:
        memory.append((role, query))
    return get_user_memory(user_id)

def _transaction_prompt_activity(user_id, role, query):
    memory = get_user_activity_memory(user_id)
    if role.lower() == 'assistant'.lower():
        memory.append((query))
    else:
        memory.append((role, query))
    return get_user_activity_memory(user_id)

def _classification_memory(user_id, role, query):
    memory = get_classification_memory(user_id)
    memory.append((role, query))
    return get_classification_memory(user_id)


# Define branching logic

def pass_original_query(input_query):
    classification_in_memory = _classification_memory("neel", "human", "{query}")
    classification = (ChatPromptTemplate.from_messages(classification_in_memory) | model | StrOutputParser()).invoke(input_query)
    _classification_memory("neel", "ai", classification)
    return {"query": input_query, "classification": classification}

user_memories = {}
def get_user_memory(user_id):
    """Retrieve or create memory for a specific user."""
    if user_id not in user_memories:
        user_memories[user_id] = [
            ("system", "You are a professional who is only responsible to convert the text in JSON "),
            ("human", "Swap 1 JEWEL to AVAX"),
            AIMessage(content=json.dumps({"from": "JEWEL", "to": "AVAX", "amount": 1, "action": "swap", "message": None})),
            ("human", "Swap 0.01 Crystal to Jewel"),
            AIMessage(content=json.dumps({"from": "CRYSTAL", "to": "JEWEL", "amount": 0.01, "action": "swap", "message": None})),
            ("human", "Transfer 0.005 Jewel to crsytal"),
            AIMessage(content=json.dumps({"from": "JEWEL", "to": "CRYSTAL", "amount": 0.005, "action": "swap", "message": None})),
            ("human", "swap jewel to crystal"),
            AIMessage(content=json.dumps({"from": "JEWEL", "to": "CRYSTAL", "amount": None, "action": "swap", "message": "Enter the amount to swap:"})),
            ("human", "0.008"),
            AIMessage(content=json.dumps({"from": "JEWEL", "to": "CRYSTAL", "amount": 0.008, "action": "swap", "message": None})),
        ]
    return user_memories[user_id]

user_memories_activity = {}
def get_user_activity_memory(user_id):
    """Retrieve or create memory for a specific user."""
    if user_id not in user_memories_activity:
        user_memories_activity[user_id] = [
            ("system", hero_prompt),
            ("human", "Please Buy me a hero"),
            AIMessage(content=json.dumps({"action": "buy_hero","message": None})),
            ("human", "Buy me any good hero"),
            AIMessage(content=json.dumps({"action": "buy_hero","message": None})),
            ("human", "purchase a new hero for me"),
            AIMessage(content=json.dumps({"action": "buy_hero","message": None})),
            ("human", "Can You buy me a new hero ?"),
            AIMessage(content=json.dumps({"action": None,"message": "Yes, Shall I proceed ahead ?"})),
            ("human", "Yes, Please"),
            AIMessage(content=json.dumps({"action": "buy_hero","message": None})),
            ("human", "Put my hero on work"),
            AIMessage(content=json.dumps({"action": "start_quest","message": None})),
            ("human", "hero to work"),
            AIMessage(content=json.dumps({"action": "start_quest","message": None})),
            ("human", "Put my free hero on work"),
            AIMessage(content=json.dumps({"action": "start_quest","message": None})),
        ]
    return user_memories_activity[user_id]

classification_memory = {}
def get_classification_memory(user_id):
    """Retrieve or create memory for a specific user."""
    if user_id not in classification_memory:
        classification_memory[user_id] = [
            ("system", classifier_prompt),
            ("human", "swap me 0.001 crystal to jewel"),
            ("ai", "Transaction"),
            ("human", "buy me hero"),
            ("ai", "Activity"),
            ("human", "put my hero on work"),
            ("ai", "Activity"),
            ("human", "swap me 0.008 jewel to avax"),
            ("ai", "Transaction"),
        ]   
        
    return classification_memory[user_id]

    
def run_chain(input_value):
     # Step 1: Get classification FIRST and store result
    classification_chain = RunnableLambda(pass_original_query)
    classification_result = classification_chain.invoke(input_value)  # Ensure classification happens first

    classifier_label = classification_result["classification"]
 
    # Step 2: Fetch memory-based prompts
    if classification_result["classification"].lower().strip() == "Transaction".lower().strip():
        transaction_in_memory = _transaction_prompt("neel", "human", "{query}")
        transaction_chain = ChatPromptTemplate.from_messages(transaction_in_memory) | model | StrOutputParser()
        selected_chain = transaction_chain
        result = selected_chain.invoke(input_value) 
        _transaction_prompt("neel", "assistant", AIMessage(content=json.dumps(extract_json(result))))
    else:
        activity_in_memory = _transaction_prompt_activity("neel", "human", "{query}")
        activity_chain = ChatPromptTemplate.from_messages(activity_in_memory) | model | StrOutputParser()
        selected_chain = activity_chain
        result = selected_chain.invoke(input_value) 
        _transaction_prompt_activity("neel", "assistant", AIMessage(content=json.dumps(extract_json(result))))


    # result = selected_chain.invoke(input_value) 

    formatted = {"classifier": classifier_label, "ai_response": result}
    print(formatted)
    return formatted

# chain("buy me a hero")
# get_user_memory("neel")

