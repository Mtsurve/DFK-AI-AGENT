from flask import Flask, request, jsonify
from flask_cors import CORS
from main import fetch_relevant_info_from_chroma  # Adjust import as needed
import json
import os
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
os.environ["GROQ_API_KEY"] = "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"
from langchain_groq import ChatGroq
import requests
from classifier import run_chain
from utils.format_llm_response import extract_json


app = Flask(__name__)
CORS(app)

# Dictionary to store conversation history for each user (session)
conversation_history = {}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        """
        Chat route to process user query and fetch response.
        Expects JSON with a 'query' key.
        """
        # Get the incoming request data (JSON)
        data = request.get_json()
        print(f"Data: {data}")
        query = data.get('query')  # The user's query
        
        print(f"User query: {query}")
        
        # Fetch relevant information from Chroma (including conversation context)
        response = fetch_relevant_info_from_chroma(query, 'chroma_db')
        
        first = response.find('`')
        last = response.rfind('`')
        
        _response = response[first: last+1]
        
        __response = _response.replace("`", "").replace("json","")
        
        _first = __response.find("{")
        _last  = __response.rfind("}")
        
        final = json.loads(__response[_first:_last+1])
        
        # Return the response from Chroma
        return jsonify({"response": final})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"response": "An error occurred. Please try again."})
    

API_URL = "https://0b87-103-249-242-26.ngrok-free.app/v1/token/swap-tokens"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzaGlzaGMwMDQ2QGdtYWlsLmNvbSIsImlhdCI6MTczODkxNjI0NSwiZXhwIjoxNzM5MDAyNjQ1fQ.i8Sb2ep0v2M5YeXojvD2M5aaC-luJgWhVrQ0E83Bz-s"
}
 
@app.route('/swap', methods=['POST'])
def swap_bot():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid JSON or no 'message' key provided"}), 400
        
        input_value = data['message']
        response = run_chain(input_value)
        parsed_response = extract_json(response['ai_response'])
            
        print(parsed_response)
            
        if not parsed_response:
            return jsonify({"error": "Failed to parse AI response"}), 500
        
        # if there is any value in message we return to the UI
        if parsed_response.get("message"):
            return jsonify({"response": parsed_response})
        
        swap_payload = {}
        if response["classifier"].lower().strip() == 'Activity'.lower().strip():
            swap_payload = {
                "action":  parsed_response.get("action")
            }
        else:
            swap_payload = {
                "from": parsed_response.get("from"),
                "to": parsed_response.get("to"),
                "amount": str(parsed_response.get("amount")),
                "action":  parsed_response.get("action")
            }
            
        # return jsonify({"res": swap_payload})

        swap_response = requests.post(API_URL, json=swap_payload, headers=HEADERS)
        swap_data = swap_response.json() if swap_response.status_code == 200 else {"error": "Swap API request failed"}
        
        parsed_response["success_response"] = swap_data.get("message", swap_data["message"])
        return jsonify({"response": parsed_response})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    

if __name__ == '__main__':
    app.run(debug=True)
x