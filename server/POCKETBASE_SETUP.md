# SPLLIT Chat Setup with PocketBase

## What is PocketBase?
PocketBase is a free, open-source, self-hostable backend that provides:
- SQLite database
- Admin UI
- REST API
- WebSocket support
- Real-time subscriptions

## Setup Instructions

### Step 1: Start PocketBase
```bash
cd spllit-webapp/server
./pocketbase.exe serve --http=127.0.0.1:8090
```

PocketBase will start on `http://localhost:8090`

### Step 2: Setup PocketBase Collections
```bash
cd spllit-webapp/server
node setup-pb.js
```

This will:
- Create an admin account
- Create the `messages` collection for storing chat messages

### Step 3: Start the Socket.IO Server
```bash
cd spllit-webapp/server
npm run dev
```

### Step 4: Start the React App
```bash
cd spllit-webapp
npm run dev
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│  Socket.IO  │────▶│  PocketBase │
│   Client    │◀────│   Server    │◀────│  (Messages) │
│  (Port 5173)│     │ (Port 3001) │     │ (Port 8090) │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Firebase   │
                    │ (Auth/Rides)│
                    └─────────────┘
```

## How Chat Works

1. **User opens chat** → Loads messages from PocketBase
2. **User sends message** → Saved to PocketBase + broadcast via Socket.IO
3. **Real-time** → Socket.IO broadcasts to all users in the same room
4. **Persistent** → Messages stored in PocketBase, available anytime

## PocketBase Admin UI

Access the admin panel at: `http://localhost:8090/_/`

- Email: `admin@spllit.com`
- Password: `admin123456`

## API Endpoints

### Get Messages
```
GET http://localhost:8090/api/collections/messages/records?filter=(request_id="ROOM_ID")&sort=timestamp
```

### Create Message
```
POST http://localhost:8090/api/collections/messages/records
{
  "request_id": "room123",
  "sender_id": "user123",
  "sender_name": "John",
  "message": "Hello!",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Troubleshooting

### PocketBase not starting?
- Check if port 8090 is available
- Try: `netstat -ano | findstr :8090`

### Messages not saving?
- Check PocketBase is running: `http://localhost:8090/api/health`
- Check server logs for errors

### Socket.IO not connecting?
- Ensure Socket.IO server is running on port 3001
- Check CORS settings in server.js
