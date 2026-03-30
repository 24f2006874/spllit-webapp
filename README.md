# SPLLIT - Real-time Carpool Platform

A modern carpool platform built with React, Firebase, and Socket.IO for real-time messaging.

## Features

- 🚗 **Ride Sharing**: Create and join rides with cost sharing
- 💬 **Real-time Chat**: Instant messaging between ride sharers and co-travelers
- 🔐 **Firebase Auth**: Secure passwordless email authentication
- 📍 **Location-based**: Find rides by pickup and dropoff locations
- ⏰ **Auto-completion**: Rides automatically complete after 48 hours
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, Vite, Socket.IO Client
- **Backend**: Node.js, Socket.IO Server, Express
- **Database**: Firebase Firestore + PocketBase v0.23.4
- **Authentication**: Firebase Auth (magic link / passwordless)
- **Styling**: CSS with modern gradients and animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Auth enabled
- PocketBase v0.23.4 binary ([download here](https://pocketbase.io/docs/))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/24f2006874/spllit-webapp.git
cd spllit-webapp
```

**2. Install client dependencies**

```bash
npm install
```

**3. Install server dependencies**

```bash
cd server
npm install
cd ..
```

**4. Environment setup**

Create a `.env.local` file in the project root with the following variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_SOCKET_URL=http://localhost:3001
VITE_PB_URL=http://localhost:8090
```

> Ask your team lead for the Firebase credentials. Never commit this file — it is gitignored.

**5. PocketBase setup**

Download the PocketBase v0.23.4 binary for your OS from [pocketbase.io](https://pocketbase.io/docs/) and place it in a folder of your choice. Start it on port 8090:

```bash
./pocketbase serve --http="127.0.0.1:8090"
```

Then import the database schema:

1. Open the PocketBase admin UI at `http://127.0.0.1:8090/_/`
2. Go to **Settings → Import collections**
3. Paste the contents of `pb_schema.json` (found in the project root) and confirm

This will create the following collections: `rides`, `rideRequests`, and `messages`.

> **Note:** When creating collections via the API or migrations, use `fields` (not `schema`) in the payload — the current PocketBase version requires this, otherwise only the `id` field gets created.

### Running the Application

**Development mode (recommended)**

```bash
npm start
```

This starts both the Socket.IO server (port 3001) and the React app (port 5173) simultaneously.

**Manual start**

```bash
# Terminal 1: Start the Socket.IO server
npm run server

# Terminal 2: Start the React app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** PocketBase must also be running separately on port 8090 for ride and chat features to work. See the PocketBase setup step above.

**Building for production**

```bash
npm run build
npm run preview
```

## Project Structure

```
spllit-webapp/
├── public/                 # Static assets
├── server/                 # Socket.IO backend server
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ChatWindow.jsx
│   │   ├── AcceptanceNotification.jsx
│   │   ├── RideRequestNotification.jsx
│   │   └── ...
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Login.jsx       # Authentication
│   │   └── ...
│   ├── firebase.js         # Firebase configuration
│   └── main.jsx            # App entry point
├── pb_schema.json          # PocketBase collections schema (import this on setup)
├── .env.local              # Environment variables (gitignored, create manually)
└── package.json
```

## Database Collections (PocketBase)

| Collection | Description |
|---|---|
| `rides` | Ride listings — pickup, dropoff, seats, status, driver info |
| `rideRequests` | Requests made by passengers — links a passenger to a ride, tracks status (`pending`, `approved`, `rejected`) |
| `messages` | Chat messages — each row is one message linked to a `rideRequest` via `request_id` |

## Socket.IO Events

**Client → Server**

| Event | Description |
|---|---|
| `join_chat` | Join a chat room for a specific ride request |
| `send_message` | Send a message to the chat room |
| `typing_start` | Indicate user started typing |
| `typing_stop` | Indicate user stopped typing |
| `leave_chat` | Leave a chat room |

**Server → Client**

| Event | Description |
|---|---|
| `receive_message` | Receive a new message |
| `user_joined` | Notify when someone joins the chat |
| `user_left` | Notify when someone leaves the chat |
| `user_typing` | Show typing indicators |

## Authentication Notes

- The app uses Firebase **passwordless (magic link) email auth** — users receive a sign-in link via email
- Magic link emails may land in spam — mark as "not spam" after first login
- PocketBase uses `/api/collections/_superusers/auth-with-password` for admin authentication compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.