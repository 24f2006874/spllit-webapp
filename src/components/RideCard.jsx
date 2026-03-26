import { MapPin } from 'lucide-react'
import '../pages/Dashboard.css'

function RideCard({ ride, onOpenProfile, onRequestRide, isRequesting, showEndButton, onEndRide, approvedRequest, onStartChat }) {
  return (
    <div className="group-card ride-card">
      <div className="ride-image-placeholder">
        <div className="image-placeholder"></div>
      </div>
      
      <div className="card-header">
        <MapPin size={20} />
        <div className="card-title">
          <h4>{ride.pickup}</h4>
          <p className="route-info">→ {ride.dropoff}</p>
        </div>
      </div>
      
      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">Date/Time</span>
          <span className="detail-value">
            {ride.dateTime ? new Date(ride.dateTime).toLocaleString() : 'Not set'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Seats</span>
          <span className="detail-value">{ride.seats}</span>
        </div>
        {!showEndButton && (
          <div className="detail-item your-share">
            <span className="detail-label">Status</span>
            <span className="detail-value">{ride.status || 'available'}</span>
          </div>
        )}
        {showEndButton && (
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value">{ride.status || 'active'}</span>
          </div>
        )}
      </div>
      
      <div className="ride-driver-info">
        <button
          className="driver-avatar clickable-avatar"
          onClick={() => onOpenProfile(ride)}
          title="View sharer profile"
        >
          {(ride.driverName || 'S').charAt(0).toUpperCase()}
        </button>
        <div className="driver-details">
          <p className="driver-name">{ride.driverName || 'Sharer'}</p>
        </div>
        <div className="seats-info">
          <p className="seats-count">{ride.notes || 'No notes'}</p>
        </div>
      </div>
      
      {showEndButton ? (
        <div className="ride-actions">
          <button 
            className="btn-complete-ride"
            onClick={() => onEndRide(ride.id)}
            title="End this ride and move to history"
          >
            End Ride
          </button>
        </div>
      ) : approvedRequest ? (
        <button 
          className="btn-start-chat-ride"
          onClick={() => onStartChat(approvedRequest)}
          title="Start chatting with the ride sharer"
        >
          💬 Start Chat
        </button>
      ) : (
        <button 
          className="btn-book-ride"
          onClick={() => onRequestRide(ride)}
          disabled={isRequesting === ride.id}
        >
          {isRequesting === ride.id ? 'Requesting...' : 'Request Ride'}
        </button>
      )}
    </div>
  )
}

export default RideCard
