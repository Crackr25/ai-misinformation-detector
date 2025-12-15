# AI Misinformation Detector

## Overview
A comprehensive system for detecting AI-generated misinformation, featuring a React frontend and a Node.js/Express backend with SQLite for user authentication.

## Features
- **User Authentication**: Secure Login/Register functionality.
- **Content Detection**: Analyze text to detect AI-generated content (uses OpenRouter API).
- **Dashboard**: Central hub for monitoring activities.
- **Alert History**: Track past detection results.
- **Analytics**: Graphic visualization of detection trends.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## Installation

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    # Front-end dependencies
    npm install

    # Back-end dependencies
    cd server
    npm install
    cd ..
    ```

## Running the Application

To run both the backend server and the frontend client simultaneously (recommended):

```bash
npm run start:all
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Project Structure
- `/src`: React frontend application.
- `/server`: Node.js Express backend.
  - `database.sqlite`: SQLite database (auto-created on start).
