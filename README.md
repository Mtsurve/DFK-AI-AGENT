DFK-AI-AGENT

Frontend: A React application for building a responsive and interactive user interface. Backend: A Node.js application with a MySQL database for handling server-side logic and API requests. 
AI-Agent: A Python-based module for AI functionalities and integrations.

Folder Structure

DFK-AI-AGENT/
  ├── defi-kingdom-agent/ # React application for the user interface
  ├── defi-kingdom-backend/ # Node.js application with MySQL database
  ├── defi-kingdom-frontend/ # Python-based AI agent for advanced functionalities

## Prerequisites

Ensure you have the following installed:
- **Node.js** (version >= 18)
- **MySQL** (latest version)
- **Python** (version >= 3.8)
- **npm** for package management

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/project-name.git
cd project-name
```

### 2. Setup the frontend
```bash
cd defi-kingdom-frontend
npm install
npm run dev
```
- The frontend will run on port **5173**.

### 3. Setup the backend
```bash
cd defi-kingdom-backend
npm install
node index.js
```
- The backend will run on port **8080**.
- **Note:** Create a database named `defi_kingdom` in MySQL.

### 4. Setup the AI-Agent
```bash
cd defi-kingdom-agent
python3 -m venv .venv
pip3 install -r requirements.txt
source .venv/bin/activate
flask run
```
- The AI-Agent will run on port **5000**.

### 5. Parallel Setup
Make sure to keep all the projects running in parallel:
- Frontend on port **5173**
- Backend on port **8080**
- AI-Agent on port **5000**

### 6. Configuration
- Have a **Grok AI key** and add the required keys in all projects' `.env` files for the project to execute properly.

## Usage

1. Start the frontend, backend, and AI-Agent.
2. Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to view the application.

Tech Stack

Backend: Node.js, Express, MySQL

Frontend: React.js, Tailwind CSS

Agent: Python/FLASK (AI Automation)

🤝 Contributing

Feel free to open issues and submit PRs!

📜 License

This project is licensed under the MIT License.

