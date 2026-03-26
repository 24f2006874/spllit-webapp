# SPLLIT - Real-time Carpool Platform

A modern carpool platform built with React, Firebase, and Socket.IO for real-time messaging.

## Features

- 🚗 **Ride Sharing**: Create and join rides with cost sharing
- 💬 **Real-time Chat**: Instant messaging between ride sharers and co-travelers
- 🔐 **Firebase Auth**: Secure user authentication
- 📍 **Location-based**: Find rides by pickup and dropoff locations
- ⏰ **Auto-completion**: Rides automatically complete after 48 hours
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, Vite, Socket.IO Client
- **Backend**: Node.js, Socket.IO Server, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: CSS with modern gradients and animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Auth enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spllit-webapp
   ```

2. **Install client dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### Running the Application

**Development Mode (Recommended)**
```bash
npm start
```
This will start both the Socket.IO server (port 3001) and the React app (port 5173) simultaneously.

**Manual Start**
```bash
# Terminal 1: Start the Socket.IO server
npm run server

# Terminal 2: Start the React app
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
spllit-webapp/
├── public/                 # Static assets
├── server/                 # Socket.IO backend server
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ChatWindow.jsx         # Real-time chat component
│   │   ├── AcceptanceNotification.jsx
│   │   ├── RideRequestNotification.jsx
│   │   └── ...
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Login.jsx      # Authentication
│   │   └── ...
│   ├── firebase.js        # Firebase configuration
│   └── main.jsx           # App entry point
├── .env.local             # Environment variables (gitignored)
└── package.json
```

## Socket.IO Events

### Client → Server
- `join_chat`: Join a chat room for a specific ride request
- `send_message`: Send a message to the chat room
- `typing_start`: Indicate user started typing
- `typing_stop`: Indicate user stopped typing
- `leave_chat`: Leave a chat room

### Server → Client
- `receive_message`: Receive a new message
- `user_joined`: Notify when someone joins the chat
- `user_left`: Notify when someone leaves the chat
- `user_typing`: Show typing indicators

## Firebase Collections

- `rides`: Ride listings with details
- `rideRequests`: Ride request data with status
- `messages`: Chat messages (legacy, now using Socket.IO)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
