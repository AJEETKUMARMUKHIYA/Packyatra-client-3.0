import { useState } from 'react'


export default function BookingSection() {
const [filter, setFilter] = useState('all')
const [search, setSearch] = useState('')


const filtered = bookings
.filter(b => filter === 'all' || b.status === filter)
.filter(b => JSON.stringify(b).toLowerCase().includes(search))


return (
<section className="booking-section">
<div className="section-header">
<i className="fas fa-suitcase"></i>
<h2>Booking Details</h2>
</div>


<div className="booking-filters">
<div className="filter-options">
{['all','pending','confirmed','completed'].map(f => (
<button
key={f}
className={`filter-btn ${filter === f ? 'active' : ''}`}
onClick={() => setFilter(f)}
>
{f.charAt(0).toUpperCase() + f.slice(1)}
</button>
))}
</div>


<div className="search-box">
<i className="fas fa-search"></i>
<input
placeholder="Search bookings"
onChange={e => setSearch(e.target.value.toLowerCase())}
/>
</div>
</div>


<div className="bookings-container">
{filtered.map(b => (
<div key={b.id} className="booking-card">
<div className="booking-header">
<div className="booking-id">{b.id} - {b.type}</div>
<div className={`booking-status status-${b.status}`}>{b.statusText}</div>
</div>


<div className="booking-details">
<div className="booking-item"><h4>From</h4><p>{b.from}</p></div>
<div className="booking-item"><h4>To</h4><p>{b.to}</p></div>
<div className="booking-item"><h4>Date</h4><p>{b.date}</p></div>
<div className="booking-item"><h4>Items</h4><p>{b.items}</p></div>
<div className="booking-item"><h4>Tracking</h4><p>{b.trackingId}</p></div>
</div>


<div className="booking-actions">
<button className="btn btn-primary btn-sm">View</button>
<button className="btn btn-secondary btn-sm">Track</button>
{b.status === 'pending' && (
<button className="btn btn-secondary btn-sm">Modify</button>
)}
</div>
</div>
))}
</div>
</section>
)
}