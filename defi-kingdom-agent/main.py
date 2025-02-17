import requests
from bs4 import BeautifulSoup
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from urllib.parse import urlparse
from langchain_deepseek import ChatDeepSeek
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

from dotenv import load_dotenv
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"


load_dotenv()

# 1. Scrape the Website
def scrape_website(url):
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    # Extract text from various tags
    elements = []
    for tag in ['h1', 'h2', 'h3', 'p', 'div', 'span', 'ul', 'li']:
        elements.extend([elem.get_text() for elem in soup.find_all(tag)])

    # Combine all the extracted text
    return ' '.join(elements)

def scrape_website_with_links(url, max_links=5):
    """
    Scrape the main webpage and a limited number of redirection links.
    :param url: The main website URL to scrape.
    :param max_links: Maximum number of links to follow for scraping.
    :return: Combined text content from the main page and linked pages.
    """
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    # Scrape the main page content
    elements = []
    for tag in ['h1', 'h2', 'h3', 'p', 'div', 'span', 'ul', 'li']:
        elements.extend([elem.get_text() for elem in soup.find_all(tag)])

    # Find redirection links
    links = [a['href'] for a in soup.find_all('a', href=True)]
    absolute_links = [
        requests.compat.urljoin(url, link) for link in links if link.startswith("/")
    ]

    # Limit the number of links to follow
    absolute_links = list(set(absolute_links))[:max_links]

    # Scrape content from linked pages
    for link in absolute_links:
        try:
            print(f"Scraping linked page: {link}")
            link_response = requests.get(link)
            link_response.raise_for_status()
            link_soup = BeautifulSoup(link_response.text, 'html.parser')
            for tag in ['h1', 'h2', 'h3', 'p', 'div', 'span', 'ul', 'li']:
                elements.extend([elem.get_text() for elem in link_soup.find_all(tag)])
        except Exception as e:
            print(f"Failed to scrape {link}: {e}")

    # Combine all the text
    return ' '.join(elements)


def scrape_website_recursively(url, max_links=5, max_depth=3, visited=None):
    """
    Recursively scrape a website and its linked pages.
    :param url: The initial website URL to scrape.
    :param max_links: Maximum number of links to follow per page.
    :param max_depth: Maximum depth of recursion.
    :param visited: Set of already visited URLs to avoid duplication.
    :return: Combined text content from all pages.
    """
    if visited is None:
        visited = set()
    
    # Base case: stop recursion if max depth is reached
    if max_depth < 0:
        return ""
    
    # Avoid scraping the same URL twice
    if url in visited:
        return ""

    print(f"Scraping URL: {url} (Depth: {max_depth})")
    visited.add(url)

    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Scrape content from the current page
        elements = []
        for tag in ['h1', 'h2', 'h3', 'p', 'div', 'span', 'ul', 'li']:
            elements.extend([elem.get_text() for elem in soup.find_all(tag)])

        # Find and process links
        links = [a['href'] for a in soup.find_all('a', href=True)]
        absolute_links = [
            requests.compat.urljoin(url, link) for link in links if link.startswith("/") or link.startswith("http")
        ]

        # Limit the number of links to follow
        absolute_links = list(set(absolute_links))[:max_links]

        # Recursively scrape linked pages
        for link in absolute_links:
            elements.append(scrape_website_recursively(link, max_links, max_depth - 1, visited))

        # Combine all the scraped text
        return ' '.join(elements)

    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""


def scrape_entire_website(url, visited=None, delay=1):
    """
    Recursively scrape all pages within the same domain.
    :param url: The initial website URL to scrape.
    :param visited: Set of already visited URLs to avoid duplication.
    :param delay: Delay between requests to avoid overloading the server.
    :return: Combined text content from all pages within the same domain.
    """
    if visited is None:
        visited = set()
    
    # Avoid scraping the same URL twice
    if url in visited:
        return ""

    print(f"Scraping URL: {url}")
    visited.add(url)

    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Scrape content from the current page
        elements = []
        for tag in ['h1', 'h2', 'h3', 'p', 'div', 'span', 'ul', 'li']:
            elements.extend([elem.get_text() for elem in soup.find_all(tag)])

        # Find links and filter for same domain
        parsed_url = urlparse(url)
        base_domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
        links = [a['href'] for a in soup.find_all('a', href=True)]
        absolute_links = [
            requests.compat.urljoin(url, link) for link in links if link.startswith("/") or link.startswith("http")
        ]
        same_domain_links = [link for link in absolute_links if link.startswith(base_domain)]

        # Recursively scrape links in the same domain
        for link in same_domain_links:
            elements.append(scrape_entire_website(link, visited, delay))

        # Combine all the scraped text
        return ' '.join(elements)

    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""




# 2. Create Data Chunks
def chunk_text(text, chunk_size=500, overlap=100):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

# 3. Store Chunks in Chroma DB
def store_chunks_in_chroma(chunks, persist_directory):
    embeddings = OpenAIEmbeddings()  # Use OpenAI for embedding
    vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
    for i, chunk in enumerate(chunks):
        vectorstore.add_texts([chunk], metadatas=[{"chunk_index": i}])
    vectorstore.persist()
    
    
def store_chunks_with_hugggingFace(chunks, persist_directory):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name="HuggingFace-embeddings")
    for i, chunk in enumerate(chunks):
        vectorstore.add_texts([chunk], metadatas=[{"chunk_index": i}])
    vectorstore.persist()
    
    

# 4. Chatbot Interaction
def chatbot_response(query, persist_directory):
    vectorstore = Chroma(persist_directory=persist_directory, embedding_function=OpenAIEmbeddings())
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    chat = ChatOpenAI(model="gpt-4", temperature=0)
    qa_chain = RetrievalQA.from_chain_type(llm=chat, retriever=retriever)
    return qa_chain.run(query)

def is_chroma_db_exists(persist_directory):
    """
    Check if the Chroma DB already exists in the persist directory.
    :param persist_directory: The directory where the Chroma vector store is stored.
    :return: True if the Chroma DB exists, False otherwise.
    """
    return os.path.exists(os.path.join(persist_directory, 'chroma.sqlite3')) 

def load_chroma_vectorstore(persist_directory):
    """
    Load the Chroma vector store from the given directory.
    :param persist_directory: Directory where the vector store is persisted.
    :return: Loaded Chroma vector store.
    """
    # embeddings = OpenAIEmbeddings()  # Use OpenAI for embedding
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embeddings,  collection_name="HuggingFace-embeddings")
    return vectorstore

def fetch_relevant_info_from_chroma(query, persist_directory):
    try:
        
        """
        Fetch relevant information from the Chroma database based on a user's query.
        :param query: The user's query to search in the Chroma DB.
        :param persist_directory: Directory where the Chroma vector store is persisted.
        :return: The relevant response based on the query.
        """
        # Load the existing Chroma vector store
        vectorstore = load_chroma_vectorstore(persist_directory)

        # Set up the retriever using the vectorstore
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})

        # Set up the chain for querying the chatbot model
        
        chat = ChatGroq(
            model_name="llama3-70b-8192",  # or "llama3-70b-8192" / "llama3-8b-8192"
            temperature=0,
            max_tokens=None,
        )
        qa_chain = RetrievalQA.from_chain_type(llm=chat, retriever=retriever)

        # Get the answer to the query from the vectorstore
        response = qa_chain.run(query)
        
        messages = chatMessages()
        messages.append(("assistant", response))
        messages.append(("human", query))
        
        seek_msg = chat.invoke(messages)
        
        return seek_msg.content
    except Exception as e:
        print(f"Error: {e}")
        return e

def chatMessages():
    prompt = '''
        You are a helpful assistant that helps user with the information related to the Game, 
        You explain it as simple as for a 5th grader
        
        Make sure you provide the information in a json format
        it can have a title, description, and you could have an array of objects for steps with title, description
    '''
    messages = [
        (
            "system",
            prompt
        )]
    return messages

# Main Workflow
if __name__ == "__main__":
    website_url = "https://docs.defikingdoms.com/gameplay/getting-started"
    persist_dir = "chroma_db"

    print(is_chroma_db_exists(persist_dir))
    # Check if the Chroma DB already exists
    if not is_chroma_db_exists(persist_dir):
        # If Chroma DB does not exist, perform scraping and storing
        print("Chroma DB not found. Scraping website and linked pages...")
        scraped_text = scrape_website_recursively(website_url)

        print("Creating chunks...")
        chunks = chunk_text(scraped_text)

        print("Storing chunks in Chroma DB...")
        # store_chunks_in_chroma(chunks, persist_dir)
        store_chunks_with_hugggingFace(chunks, persist_dir)
    else:
        print("Chroma DB already exists. Skipping scraping and chunking.")

    # Chatbot is ready to respond based on existing Chroma DB
    print("Chatbot ready! Ask a question:")
    while True:
        user_query = input("You: ")
        if user_query.lower() in ['exit', 'quit']:
            break

        # Fetch the relevant information from Chroma DB
        response = fetch_relevant_info_from_chroma(user_query, persist_dir)
        print(f"Bot: {response}")