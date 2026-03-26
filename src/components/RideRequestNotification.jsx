import { X, Check } from 'lucide-react'
import '../pages/Dashboard.css'

function RideRequestNotification({ request, onApprove, onReject }) {
  if (!request) return null

  return (
    <div className="request-notification-overlay" onClick={onReject}>
      <div className="request-notification" onClick={(e) => e.stopPropagation()}>
        <div className="notification-icon">🔔</div>
        <h2 className="notification-title">New Co-Traveler Request!</h2>
        
        <div className="passenger-info">
          <div className="passenger-avatar">
            {request.passengerName?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="passenger-details">
            <p className="passenger-name">{request.passengerName}</p>
            <p className="passenger-email">{request.passengerEmail}</p>
          </div>
        </div>

        <div className="request-ride-details">
          <div className="detail-row">
            <span className="detail-label">📍 From</span>
            <span className="detail-value">{request.pickup}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">📍 To</span>
            <span className="detail-value">{request.dropoff}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">🕒 Time</span>
            <span className="detail-value">
              {request.dateTime ? new Date(request.dateTime).toLocaleString() : 'Not set'}
            </span>
          </div>
        </div>

        <div className="notification-actions">
          <button 
            className="btn-approve-request"
            onClick={() => onApprove(request.id)}
          >
            <Check size={18} />
            Accept
          </button>
          <button 
            className="btn-reject-request"
            onClick={() => onReject()}
          >
            <X size={18} />
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default RideRequestNotification
