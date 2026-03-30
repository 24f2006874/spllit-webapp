import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Users, Clock, Plus, MessageCircle } from 'lucide-react'
import axios from 'axios'
import RideCard from '../components/RideCard'
import ProfileModal from '../components/ProfileModal'
import RideRequestNotification from '../components/RideRequestNotification'
import AcceptanceNotification from '../components/AcceptanceNotification'
import ChatWindow from '../components/ChatWindow'
import './Dashboard.css'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://localhost:8090'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('available')
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [isAddRideOpen, setIsAddRideOpen] = useState(false)
  const [isSubmittingRide, setIsSubmittingRide] = useState(false)
  const [rides, setRides] = useState([])
  const [ridesLoading, setRidesLoading] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileType, setProfileType] = useState(null)
  const [selectedSharer, setSelectedSharer] = useState(null)
  const [requestingRideId, setRequestingRideId] = useState(null)
  const [incomingRequest, setIncomingRequest] = useState(null)
  const [isRequestNotificationOpen, setIsRequestNotificationOpen] = useState(false)
  const [isAcceptanceOpen, setIsAcceptanceOpen] = useState(false)
  const [acceptanceRequest, setAcceptanceRequest] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentChatRequest, setCurrentChatRequest] = useState(null)
  const [shownRequestIds, setShownRequestIds] = useState(new Set())
  const [shownAcceptanceIds, setShownAcceptanceIds] = useState(new Set())
  const [myApprovedRequests, setMyApprovedRequests] = useState({})
  const [driverApprovedRequests, setDriverApprovedRequests] = useState({})

  useEffect(() => {
    const stored = localStorage.getItem('shownRequestIds')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setShownRequestIds(new Set(parsed))
      } catch {
        localStorage.removeItem('shownRequestIds')
      }
    }
  }, [])

  useEffect(() => {
    if (shownRequestIds.size > 0) {
      localStorage.setItem('shownRequestIds', JSON.stringify([...shownRequestIds]))
    }
  }, [shownRequestIds])

  useEffect(() => {
    const stored = localStorage.getItem('shownAcceptanceIds')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setShownAcceptanceIds(new Set(parsed))
      } catch {
        localStorage.removeItem('shownAcceptanceIds')
      }
    }
  }, [])

  useEffect(() => {
    if (shownAcceptanceIds.size > 0) {
      localStorage.setItem('shownAcceptanceIds', JSON.stringify([...shownAcceptanceIds]))
    }
  }, [shownAcceptanceIds])

  const [rideForm, setRideForm] = useState({
    pickup: '',
    dropoff: '',
    dateTime: '',
    seats: '',
    notes: '',
  })

  const getUserName = useCallback(() => {
    if (!user) return 'Driver'
    if (user.displayName) return user.displayName
    if (user.email) {
      const parts = user.email.split('@')
      return parts[0] || 'Driver'
    }
    return 'Driver'
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
    }
  }

  const handleAddRide = () => {
    setIsAddRideOpen(true)
  }

  const closeAddRideModal = () => {
    setIsAddRideOpen(false)
  }

  const handleRideFieldChange = (event) => {
    const { name, value } = event.target
    setRideForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRideSubmit = async (event) => {
    event.preventDefault()
    if (!user) return

    try {
      setIsSubmittingRide(true)
      await axios.post(`${PB_URL}/api/collections/rides/records`, {
        pickup: rideForm.pickup,
        dropoff: rideForm.dropoff,
        dateTime: rideForm.dateTime,
        seats: Number(rideForm.seats),
        notes: rideForm.notes,
        status: 'available',
        createdBy: user.uid,
        createdByEmail: user.email || '',
        driverName: getUserName(),
        createdAt: new Date().toISOString(),
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      setRideForm({
        pickup: '',
        dropoff: '',
        dateTime: '',
        seats: '',
        notes: '',
      })
      setIsAddRideOpen(false)
    } catch {
      alert('Failed to publish ride. Please try again.')
    } finally {
      setIsSubmittingRide(false)
    }
  }

  const isRideExpired = useCallback((ride) => {
    if (!ride.createdAt) return false
    try {
      const rideCreatedTime = new Date(ride.createdAt)
      const currentTime = new Date()
      const hoursDifference = (currentTime - rideCreatedTime) / (1000 * 60 * 60)
      return hoursDifference > 48
    } catch {
      return false
    }
  }, [])

  const completeRide = useCallback(async (rideId) => {
    try {
      await axios.patch(`${PB_URL}/api/collections/rides/records/${rideId}`, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch {
    }
  }, [])

  const handleCompleteRide = async (rideId) => {
    if (window.confirm('Are you sure you want to end this ride? It will move to your history.')) {
      try {
        await completeRide(rideId)
      } catch {
        alert('Failed to complete ride. Please try again.')
      }
    }
  }

  const openSharerProfile = (ride) => {
    setSelectedSharer({
      id: ride.createdBy,
      name: ride.driverName,
      email: ride.createdByEmail,
      rideId: ride.id,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      dateTime: ride.dateTime,
      seats: ride.seats,
      notes: ride.notes,
    })
    setProfileType('sharer')
    setIsProfileOpen(true)
  }

  const openMyProfile = () => {
    setProfileType('user')
    setIsProfileOpen(true)
  }

  const handleRequestRide = async (ride) => {
    if (!user) return

    try {
      setRequestingRideId(ride.id)
      
      const existing = await axios.get(
        `${PB_URL}/api/collections/rideRequests/records`,
        {
          params: {
            sort: '-createdAt',
            perPage: 200
          }
        }
      )

      const alreadyRequested = (existing.data.items || []).some(
        req => req.rideId === ride.id && 
              req.passengerId === user.uid && 
              (req.status === 'pending' || req.status === 'approved')
      )

      if (alreadyRequested) {
        alert('You have already requested this ride.')
        return
      }
      
      await axios.post(`${PB_URL}/api/collections/rideRequests/records`, {
        rideId: ride.id,
        driverId: ride.createdBy,
        driverName: ride.driverName,
        sharerEmail: ride.createdByEmail,
        passengerId: user.uid,
        passengerName: getUserName(),
        passengerEmail: user.email,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        dateTime: ride.dateTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      alert('Ride request sent! Waiting for driver approval.')
      setIsProfileOpen(false)
    } catch {
          alert('Failed to send ride request. Please try again.')
      } finally {
          setRequestingRideId(null)
      }
  }

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.patch(`${PB_URL}/api/collections/rideRequests/records/${requestId}`, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      setIsRequestNotificationOpen(false)
      setIncomingRequest(null)
      setShownRequestIds(prev => new Set(prev).add(requestId))
      alert('Ride request approved!')
    } catch {
      alert('Failed to approve request.')
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.patch(`${PB_URL}/api/collections/rideRequests/records/${requestId}`, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      setIsRequestNotificationOpen(false)
      setIncomingRequest(null)
      setShownRequestIds(prev => new Set(prev).add(requestId))
    } catch {
      alert('Failed to reject request.')
    }
  }

  const handleOpenChat = (request) => {
    const chatRequest = {
      id: request.id,
      rideId: request.rideId,
      sharerId: request.driverId,
      sharerName: request.driverName,
      sharerEmail: request.sharerEmail,
      passengerId: request.passengerId,
      passengerName: request.passengerName,
      passengerEmail: request.passengerEmail,
      pickup: request.pickup,
      dropoff: request.dropoff,
      dateTime: request.dateTime,
    }
    setCurrentChatRequest(chatRequest)
    setIsChatOpen(true)
    setIsAcceptanceOpen(false)
    if (request.id) {
      setShownAcceptanceIds(prev => new Set(prev).add(request.id))
    }
  }

  const handleCloseAcceptance = () => {
    if (acceptanceRequest) {
      setShownAcceptanceIds(prev => new Set(prev).add(acceptanceRequest.id))
    }
    setIsAcceptanceOpen(false)
    setAcceptanceRequest(null)
  }

  useEffect(() => {
    const loadRides = async () => {
      try {
        const response = await axios.get(
          `${PB_URL}/api/collections/rides/records?sort=-createdAt&perPage=100`,
          { headers: { 'Content-Type': 'application/json' } }
        )
        
        let liveRides = (response.data.items || []).map(item => ({
          id: item.id,
          ...item
        }))
        
        for (const ride of liveRides) {
          if (ride.status === 'available' && isRideExpired(ride)) {
            await completeRide(ride.id)
          }
        }
        
        liveRides = liveRides.filter(r => r.id)
        setRides(liveRides)
      } catch (error) {
        console.error('Failed to load rides:', error)
      } finally {
        setRidesLoading(false)
      }
    }

    loadRides()
    const interval = setInterval(loadRides, 5000)
    return () => clearInterval(interval)
  }, [isRideExpired, completeRide])

  useEffect(() => {
    if (!user?.uid) return

    const checkNewRequests = async () => {
      try {
        const response = await axios.get(
          `${PB_URL}/api/collections/rideRequests/records`,
          {
            params: {
              sort: '-createdAt',
              perPage: 200
            }
          }
        )
        
        const requests = (response.data.items || []).filter(req => req.status === 'pending')
        const myRequests = requests.filter(req => req.driverId === user.uid)
        
        if (myRequests.length > 0) {
          const req = myRequests[0]
          if (!shownRequestIds.has(req.id)) {
            setIncomingRequest({
              id: req.id,
              ...req
            })
            setIsRequestNotificationOpen(true)
          }
        }
      } catch (error) {
        console.error('Failed to check requests:', error)
      }
    }

    checkNewRequests()
    const interval = setInterval(checkNewRequests, 5000)
    return () => clearInterval(interval)
  }, [user?.uid, shownRequestIds])

  useEffect(() => {
    if (!user?.uid) return

    const loadApprovedRequests = async () => {
      try {
        const response = await axios.get(
          `${PB_URL}/api/collections/rideRequests/records`,
          {
            params: {
              sort: '-createdAt',
              perPage: 200
            }
          }
        )
        
        const approved = {}
        ;(response.data.items || [])
          .filter(item => item.passengerId === user.uid && item.status === 'approved')
          .forEach(item => {
            approved[item.id] = { id: item.id, ...item }
          })
        setMyApprovedRequests(approved)

        const driverApproved = {}
        ;(response.data.items || [])
          .filter(item => item.driverId === user.uid && item.status === 'approved')
          .forEach(item => {
            driverApproved[item.id] = { id: item.id, ...item }
          })
        setDriverApprovedRequests(driverApproved)
      } catch (error) {
        console.error('Failed to load approved requests:', error)
      }
    }

    loadApprovedRequests()
    const interval = setInterval(loadApprovedRequests, 5000)
    return () => clearInterval(interval)
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return

    const checkAcceptances = async () => {
      try {
        const response = await axios.get(
          `${PB_URL}/api/collections/rideRequests/records`,
          {
            params: {
              sort: '-createdAt',
              perPage: 200
            }
          }
        )
        
        const approved = (response.data.items || [])
          .filter(item => item.passengerId === user.uid && item.status === 'approved')
        
        for (const item of approved) {
          if (!shownAcceptanceIds.has(item.id)) {
            setAcceptanceRequest({
              id: item.id,
              rideId: item.rideId,
              pickup: item.pickup,
              dropoff: item.dropoff,
              dateTime: item.dateTime,
              sharerId: item.driverId,
              sharerName: item.driverName,
              sharerEmail: item.sharerEmail,
              passengerId: item.passengerId,
              passengerName: item.passengerName,
            })
            setIsAcceptanceOpen(true)
            break
          }
        }
      } catch (error) {
        console.error('Failed to check acceptances:', error)
      }
    }

    checkAcceptances()
    const interval = setInterval(checkAcceptances, 5000)
    return () => clearInterval(interval)
  }, [user?.uid, shownAcceptanceIds])

  const getApprovedRequestForRide = useCallback((rideId) => {
    return Object.values(myApprovedRequests).find(req => req.rideId === rideId) || null
  }, [myApprovedRequests])

  const availableRides = useMemo(() => {
    return rides.filter((ride) => ride.status !== 'completed' && ride.createdBy !== user?.uid)
  }, [rides, user?.uid])

  const myRides = useMemo(() => {
    return rides.filter((ride) => ride.createdBy === user?.uid && ride.status !== 'completed')
  }, [rides, user?.uid])

  const completedRides = useMemo(() => {
    return rides.filter((ride) => ride.status === 'completed' && ride.createdBy === user?.uid)
  }, [rides, user?.uid])

  const allChats = useMemo(() => {
    const passengerChats = Object.values(myApprovedRequests).map(req => ({
      ...req,
      chatRole: 'passenger'
    }))
    const driverChats = Object.values(driverApprovedRequests).map(req => ({
      ...req,
      chatRole: 'driver'
    }))
    return [...passengerChats, ...driverChats]
  }, [myApprovedRequests, driverApprovedRequests])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <img src="/icons.png" alt="SPLLIT" />
          </div>
        </div>
        <div className="header-center">
        </div>
        <div className="header-right">
          <div className="user-info">
            <button 
              className="user-avatar-btn"
              onClick={openMyProfile}
              title="View your profile"
            >
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="action-sidebar">
        <button onClick={handleAddRide} className="action-btn add-ride-btn" title="Add a new ride">
          <Plus size={28} />
        </button>
      </div>

      {isAddRideOpen && (
        <div className="ride-modal-overlay" onClick={closeAddRideModal}>
          <div className="ride-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ride-modal-header">
              <h3>Add New Ride</h3>
              <button type="button" className="ride-modal-close" onClick={closeAddRideModal}>
                x
              </button>
            </div>

            <form className="ride-form" onSubmit={handleRideSubmit}>
              <div className="ride-form-group">
                <label htmlFor="pickup">Start Point</label>
                <input
                  id="pickup"
                  type="text"
                  name="pickup"
                  value={rideForm.pickup}
                  onChange={handleRideFieldChange}
                  placeholder="Enter start point"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="ride-form-group">
                <label htmlFor="dropoff">Destination</label>
                <input
                  id="dropoff"
                  type="text"
                  name="dropoff"
                  value={rideForm.dropoff}
                  onChange={handleRideFieldChange}
                  placeholder="Enter destination"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="ride-form-group">
                <label htmlFor="dateTime">Date and Time</label>
                <input
                  id="dateTime"
                  type="datetime-local"
                  name="dateTime"
                  value={rideForm.dateTime}
                  onChange={handleRideFieldChange}
                  required
                />
              </div>

              <div className="ride-form-group">
                <label htmlFor="seats">Available Seats</label>
                <input
                  id="seats"
                  type="number"
                  min="1"
                  max="6"
                  name="seats"
                  value={rideForm.seats}
                  onChange={handleRideFieldChange}
                  placeholder="Enter seats"
                  required
                />
              </div>

              <div className="ride-form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={rideForm.notes}
                  onChange={handleRideFieldChange}
                  placeholder="Provide more details (optional)"
                  rows="3"
                />
              </div>

              <div className="ride-form-actions">
                <button type="button" className="btn-cancel-ride" onClick={closeAddRideModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-ride">
                  {isSubmittingRide ? 'Publishing...' : 'Publish Ride'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Welcome back, {getUserName()}!</h2>
          <p>Find and book rides with verified drivers</p>
        </section>

        <section className="search-filters">
          <div className="search-inputs">
            <input
              type="text"
              placeholder="From"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="To"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="input-field"
            />
          </div>
        </section>

        <section className="tabs-section">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              <MapPin size={20} />
              Available Rides
            </button>
            <button
              className={`tab-button ${activeTab === 'myrides' ? 'active' : ''}`}
              onClick={() => setActiveTab('myrides')}
            >
              <Users size={20} />
              My Rides
            </button>
            <button
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Clock size={20} />
              History
            </button>
            <button
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageCircle size={20} />
              Messages
            </button>
          </div>
        </section>

        {activeTab === 'available' && (
          <section className="groups-list-section">
            <h3>Available Rides</h3>
            {ridesLoading ? (
              <div className="empty-state">
                <p>Loading rides...</p>
              </div>
            ) : availableRides.length === 0 ? (
              <div className="empty-state">
                <MapPin size={48} />
                <p>No rides available yet</p>
                <p className="subtitle">Be the first to publish a ride</p>
              </div>
            ) : (
              <div className="group-cards">
                {availableRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onOpenProfile={openSharerProfile}
                    onRequestRide={handleRequestRide}
                    isRequesting={requestingRideId}
                    showEndButton={false}
                    approvedRequest={getApprovedRequestForRide(ride.id)}
                    onStartChat={handleOpenChat}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'myrides' && (
          <section className="groups-list-section">
            <h3>My Rides</h3>
            {myRides.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>No active rides</p>
                <p className="subtitle">Your published rides will appear here</p>
              </div>
            ) : (
              <div className="group-cards">
                {myRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onEndRide={handleCompleteRide}
                    showEndButton={true}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="groups-list-section">
            <h3>Ride History</h3>
            {completedRides.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} />
                <p>No completed rides</p>
                <p className="subtitle">Your completed rides will appear here</p>
              </div>
            ) : (
              <div className="group-cards">
                {completedRides.map((ride) => (
                  <div key={ride.id} className="group-card ride-card">
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
                        <span className="detail-value">{ride.dateTime ? new Date(ride.dateTime).toLocaleString() : 'Not set'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Seats</span>
                        <span className="detail-value">{ride.seats}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Completed</span>
                        <span className="detail-value">Done</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="groups-list-section">
            <h3>Messages</h3>
            {allChats.length === 0 ? (
              <div className="empty-state">
                <MessageCircle size={48} />
                <p>No active chats</p>
                <p className="subtitle">Chat will appear here when your ride is approved or you approve a request</p>
              </div>
            ) : (
              <div className="messages-list">
                {allChats.map((request) => {
                  const otherPersonName = request.chatRole === 'driver' 
                    ? request.passengerName 
                    : request.driverName
                  
                  return (
                    <div
                      key={request.id}
                      className="message-item"
                      onClick={() => handleOpenChat(request)}
                    >
                      <div className="message-avatar">
                        {otherPersonName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-name">{otherPersonName}</span>
                          <span className="message-time">
                            {request.dateTime ? new Date(request.dateTime).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="message-preview">
                          <span className="route-preview">
                            {request.pickup} → {request.dropoff}
                          </span>
                        </div>
                        <div className="message-status">
                          <span className="status-indicator active">
                            {request.chatRole === 'driver' ? 'Chat with Passenger' : 'Chat with Driver'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <ProfileModal
        isOpen={isProfileOpen}
        profileType={profileType}
        user={user}
        selectedSharer={selectedSharer}
        onClose={() => setIsProfileOpen(false)}
        onRequestRide={(ride) => handleRequestRide(ride)}
        isRequesting={requestingRideId}
        rides={rides}
      />

      {isRequestNotificationOpen && (
        <RideRequestNotification
        request={incomingRequest}
        onApprove={handleApproveRequest}
         onReject={() => {
          if (incomingRequest?.id) {
            handleRejectRequest(incomingRequest.id)
          }
        }}
      />
      )}

      <AcceptanceNotification
        isOpen={isAcceptanceOpen}
        request={acceptanceRequest}
        onClose={handleCloseAcceptance}
        onOpenChat={handleOpenChat}
      />

      {isChatOpen && (
        <ChatWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          user={user}
          request={currentChatRequest}
        />
      )}
    </div>
  )
}

export default Dashboard
