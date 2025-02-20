DFK-AI-AGENT

Frontend: A React application for building a responsive and interactive user interface. Backend: A Node.js application with a MySQL database for handling server-side logic and API requests. 
AI-Agent: A Python-based module for AI functionalities and integrations.

Folder Structure

DFK-AI-AGENT/
  ├── defi-kingdom-frontend/   # React application for the user interface  
  ├── defi-kingdom-backend/    # Node.js application with MySQL database  
  └── defi-kingdom-agent/      # Python-based AI agent for advanced functionalities

## Prerequisites

Ensure you have the following installed:
- **Node.js** (version >= 18)
- **MySQL** (latest version)
- **Python** (version >= 3.8)
- **npm** for package management

## Nodemailer Setup with Gmail App Password for 2FA Authentication

1. Enable Two-Factor Authentication (2FA) for Your Gmail Account
  1. Visit Google Account Security.
  2. Under the "Signing in to Google" section, click on 2-Step Verification and follow the instructions to set it up
  3. Choose a method for verification (phone number, Google Authenticator, etc.).

2. Generate an App Password for Nodemailer

  After enabling 2FA for your Gmail account, you will need to create an App Password to use in your Nodemailer setup:

  1. Visit App Passwords.
  2. In the Select App dropdown, choose Other (Custom name).
  3. Type Node (or any name you prefer) in the text box and click Generate.
  4. Google will display a 16-character password. Copy this password, as you will use it in the next step.

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

 ## **Link to our Application Demo**

  Link - https://defi.pharmaalabs.com
  Tutorial - https://x.com/web3_nk/status/1892213237112098949

🤝 Contributing

Feel free to open issues and submit PRs!

📜 License

This project is licensed under the MIT License.

