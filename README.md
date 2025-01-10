# Color Prediction Game API

This repository contains the backend API for the Color Prediction Game. Built with **Node.js**, **Express**, and **MongoDB**, this API powers the game functionality, handling data storage, user interactions, and more.

---

## Features

- User registration and authentication.
- Game logic to predict and store color selections.
- MongoDB integration for data persistence.
- Removed some specific functionality for security and privacy reasons.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/color-prediction-game-api.git
   ```

2. Navigate to the project directory:
   ```bash
   cd color-prediction-game-api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

---

## Endpoints

### Authentication
- `POST /api/register` - Register a new user.
- `POST /api/login` - User login.

### Game
- `GET /api/colors` - Fetch available colors for prediction.
- `POST /api/predict` - Submit a color prediction.
  
### Admin
- `POST /api/admin` - Submit a color prediction.

---

## Disclaimer

**I will not be responsible for anyone using this API incorrectly.**

This project is intended for educational purposes only. Please ensure compliance with applicable laws and regulations when using this API.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
