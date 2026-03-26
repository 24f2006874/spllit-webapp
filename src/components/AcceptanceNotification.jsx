import { X, MessageCircle } from 'lucide-react'
import '../pages/Dashboard.css'

function AcceptanceNotification({ isOpen, request, onClose, onOpenChat }) {
  if (!isOpen || !request) return null

  return (
    <div className="request-notification-overlay" onClick={onClose}>
      <div className="request-notification" onClick={(e) => e.stopPropagation()}>
        <div className="notification-icon">✅</div>
        <h2 className="notification-title">Request Accepted!</h2>
        
        <div className="acceptance-message">
          <p className="message-text">
            <strong>{request.sharerName}</strong> has accepted your ride request!
          </p>
          <p className="message-subtext">
            You can now chat with them to discuss details, meeting point, and cost sharing.
          </p>
        </div>

        <div className="sharer-info">
          <div className="sharer-avatar">
            {request.sharerName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="sharer-details">
            <p className="sharer-name">{request.sharerName}</p>
            <p className="sharer-email">{request.sharerEmail}</p>
          </div>
        </div>

        <div className="ride-preview">
          <h4>Ride Details</h4>
          <div className="preview-item">
            <span>📍 {request.pickup}</span>
            <span>→</span>
            <span>📍 {request.dropoff}</span>
          </div>
          <div className="preview-item">
            <span>🕒 {new Date(request.dateTime).toLocaleString()}</span>
          </div>
        </div>

        <div className="notification-actions">
          <button 
            className="btn-start-chat"
            onClick={() => onOpenChat(request)}
          >
            <MessageCircle size={18} />
            Start Chat
          </button>
          <button 
            className="btn-maybe-later"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default AcceptanceNotification
