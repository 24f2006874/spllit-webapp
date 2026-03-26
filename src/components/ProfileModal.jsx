import { X } from 'lucide-react'
import '../pages/Dashboard.css'

function ProfileModal({ isOpen, profileType, user, selectedSharer, onClose, onRequestRide, isRequesting, rides }) {
  if (!isOpen) return null

  if (profileType === 'user') {
    const userRideCount = rides?.filter((r) => r.createdBy === user?.uid).length || 0
    const completeRideCount = rides?.filter((r) => r.createdBy === user?.uid && r.status === 'completed').length || 0

    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <h2>My Profile</h2>
            <button 
              type="button" 
              className="profile-modal-close" 
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <h3 className="profile-name">{user?.displayName || user?.email?.split('@')[0]}</h3>
              <p className="profile-email">{user?.email}</p>
            </div>

            <div className="profile-stats-section">
              <div className="stat-item">
                <span className="stat-label">Rides Shared</span>
                <span className="stat-value">{userRideCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed Rides</span>
                <span className="stat-value">{completeRideCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : 'Recently'}</span>
              </div>
            </div>

            <div className="profile-info-section">
              <h4>Account Information</h4>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (profileType === 'sharer' && selectedSharer) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <h2>Ride Sharer Profile</h2>
            <button 
              type="button" 
              className="profile-modal-close" 
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {selectedSharer.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h3 className="profile-name">{selectedSharer.name}</h3>
              <p className="profile-email">{selectedSharer.email}</p>
            </div>

            <div className="ride-details-section">
              <h4>Ride Details</h4>
              <div className="ride-detail-item">
                <span className="detail-label">From</span>
                <span className="detail-value">{selectedSharer.pickup}</span>
              </div>
              <div className="ride-detail-item">
                <span className="detail-label">To</span>
                <span className="detail-value">{selectedSharer.dropoff}</span>
              </div>
              <div className="ride-detail-item">
                <span className="detail-label">Date & Time</span>
                <span className="detail-value">
                  {selectedSharer.dateTime ? new Date(selectedSharer.dateTime).toLocaleString() : 'Not set'}
                </span>
              </div>
              <div className="ride-detail-item">
                <span className="detail-label">Available Seats</span>
                <span className="detail-value">{selectedSharer.seats}</span>
              </div>
              <div className="ride-detail-item">
                <span className="detail-label">Notes</span>
                <span className="detail-value">{selectedSharer.notes || 'No additional notes'}</span>
              </div>
            </div>

            <button 
              className="btn-request-ride-modal"
              onClick={() => onRequestRide(selectedSharer)}
              disabled={isRequesting}
            >
              {isRequesting ? 'Sending Request...' : 'Request This Ride'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ProfileModal
