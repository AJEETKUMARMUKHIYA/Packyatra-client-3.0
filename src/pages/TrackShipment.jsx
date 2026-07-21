import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TrackShipment.css";

const TrackShipment = ({ onClose }) => {
  const [ticketNo, setTicketNo] = useState("");
  const [mobile, setMobile] = useState("");

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Lock page scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!ticketNo || !mobile) {
      setError("Please enter Ticket Number and Mobile Number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:7148/api/TicketTracking/track",
        {
          params: { phoneNumber: mobile, ticketNo },
        }
      );

      setTicket(res.data.ticket);
      setComments(res.data.comments || []);
    } catch {
      setError("Shipment not found. Please verify details.");
      setTicket(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-overlay">
      <div className="track-container">

        {/* ================= SCROLLABLE CONTENT ================= */}
        <div className="track-scroll-content">

          {/* FORM */}
          <div className="track-card">
            <h2>Track Your Shipment 🚚</h2>
            <p className="subtitle">
              Enter your Booking ID and registered mobile number to track your shipment.
            </p>

            <form onSubmit={handleTrack} className="track-form">
              <input
                type="text"
                placeholder="Ticket number"
                value={ticketNo}
                onChange={(e) => setTicketNo(e.target.value)}
              />

              <input
                type="tel"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Tracking..." : "Track shipment"}
              </button>
              <div className="rating-row">
                🔐 Secure tracking • Real-time updates
              </div>
            </form>

            {error && <p className="error">{error}</p>}
          </div>

          {/* STATUS */}
          {ticket && (
            <div className="status-card">
              <div className="status-header">
                <span className={`status-badge ${ticket.ticketStatus?.toLowerCase()}`}>
                  {ticket.ticketStatus}
                </span>
                <span className="ticket-no">
                  Ticket #{ticket.ticketNo}
                </span>
              </div>

              <div className="route">
                <div>
                  <label>From</label>
                  <p>{ticket.fromLocation}</p>
                </div>
                <div className="arrow">→</div>
                <div>
                  <label>To</label>
                  <p>{ticket.toLocation}</p>
                </div>
              </div>

              <div className="meta">
                Pickup Date:{" "}
                <strong>
                  {new Date(ticket.pickupDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {comments.length > 0 && (
            <div className="timeline-card">
              <h3>Tracking Updates</h3>

              <div className="timeline">
                {comments.map((c) => (
                  <div className="timeline-item" key={c.commentId}>
                    <div className="dot" />
                    <div className="content">
                      <div className="time">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                      <div className="type">{c.commentType}</div>
                      <div className="text">{c.commentText}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM ACTION ================= */}
        <div className="bottom-actions">
          <button className="close-bottom-btn" onClick={onClose}>
            Close Tracking
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrackShipment;
