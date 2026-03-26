import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Send } from 'lucide-react'
import io from 'socket.io-client'
import axios from 'axios'
import '../pages/Dashboard.css'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://localhost:8090'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function ChatWindow({ isOpen, onClose, user, request }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  const getUserName = useCallback(() => {
    if (!user) return 'Anonymous'
    if (user.displayName) return user.displayName
    if (user.email) {
      const parts = user.email.split('@')
      return parts[0] || 'Anonymous'
    }
    return 'Anonymous'
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = useCallback(async () => {
    if (!request?.id) return
    
    try {
      const response = await axios.get(
        `${PB_URL}/api/collections/messages/records`,
        {
          params: {
            filter: `request_id="${request.id}"`,
            sort: 'timestamp',
            perPage: 200
          }
        }
      )
      
      const loadedMessages = (response.data.items || []).map(msg => ({
        id: msg.id,
        clientMessageId: msg.id,
        requestId: msg.request_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderEmail: msg.sender_email,
        message: msg.message || msg.massage || '',
        text: msg.message || msg.massage || '',
        timestamp: msg.timestamp,
        type: 'message'
      }))
      
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [request?.id])

  useEffect(() => {
    if (!isOpen || !request?.id || !user) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
      setIsConnected(true)
      console.log('[Socket] Joining room:', request.id)
      
      socket.emit('join_chat', {
        requestId: request.id,
        userId: user.uid,
        userName: getUserName(),
        userEmail: user?.email || ''
      })
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
      setIsConnected(false)
    })

    socket.on('previous_messages', (data) => {
      if (data.requestId === request.id && data.messages) {
        const loadedMessages = (data.messages || []).map(msg => ({
          id: msg.id,
          clientMessageId: msg.id,
          requestId: msg.request_id,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          senderEmail: msg.sender_email,
          message: msg.message || msg.massage || '',
          text: msg.message || msg.massage || '',
          timestamp: msg.timestamp,
          type: 'message'
        }))
        setMessages(loadedMessages)
      }
    })

    socket.on('receive_message', (messageData) => {
      if (messageData.requestId === request.id) {
        setMessages(prev => {
          const isDuplicate = prev.some(msg => 
            msg.id === messageData.id || 
            msg.clientMessageId === messageData.clientMessageId
          )
          if (isDuplicate) return prev
          return [...prev, messageData]
        })
      }
    })

    return () => {
      if (socket) {
        socket.emit('leave_chat', { requestId: request.id })
        socket.disconnect()
      }
      setIsConnected(false)
    }
  }, [isOpen, request?.id, user, getUserName])

  useEffect(() => {
    if (!isOpen || !request?.id) return undefined

    loadMessages()

    pollingIntervalRef.current = setInterval(() => {
      loadMessages()
    }, 3000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [isOpen, request?.id, loadMessages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !request) return

    try {
      setIsSending(true)

      const messageText = newMessage.trim()
      const timestamp = new Date().toISOString()

      const messageData = {
        request_id: request.id,
        sender_id: user.uid,
        sender_name: getUserName(),
        sender_email: user?.email || '',
        message: messageText,
        timestamp: timestamp
      }

      await axios.post(`${PB_URL}/api/collections/messages/records`, messageData, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          requestId: request.id,
          message: messageText,
          senderId: user.uid,
          senderName: getUserName(),
          senderEmail: user?.email || '',
          timestamp: timestamp
        })
      }

      setNewMessage('')
      await loadMessages()

    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen || !request) return null

  const isSharer = user?.uid === request.sharerId
  const otherPartyName = isSharer
    ? request.passengerName
    : request.sharerName

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp || Date.now())
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="chat-overlay" onClick={handleClose}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-info">
            <h3>Chat with {otherPartyName}</h3>
            <p className="chat-route">
              {request.pickup} → {request.dropoff}
            </p>
          </div>
          <div className="chat-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          </div>
          <button className="chat-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="messages-container">
          {isLoading && messages.length === 0 ? (
            <div className="empty-chat">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <p>Say hello to start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isSentByUser = message.senderId === user?.uid

              return (
                <div
                  key={message.id || message.clientMessageId}
                  className={`message ${isSentByUser ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {isSentByUser ? 'You' : message.senderName}
                      </span>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="message-text">{message.message}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            className="chat-input"
            disabled={isSending}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!newMessage.trim() || isSending}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
