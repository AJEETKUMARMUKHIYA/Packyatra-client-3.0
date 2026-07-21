// src/components/BookingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getUserInfo } from '../utils/auth';
import { getUserBookings } from '../utils/userService';
import '../styles/BookingSection.css';

const BookingSection = ({ initialBookings = [] }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(!initialBookings.length);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const userId = getUserInfo()?.userId || getUserInfo()?.id;

  useEffect(() => {
    const loadBookings = async () => {
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading bookings for user:', userId);
        const userBookings = await getUserBookings(userId);
        
        console.log('Loaded bookings:', userBookings);
        setBookings(userBookings);
        setCurrentPage(1); // Reset to first page when bookings load
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only load if no initial bookings provided
    if (initialBookings.length === 0) {
      loadBookings();
    } else {
      setLoading(false);
    }

    // Listen for booking updates
    const handleBookingUpdate = () => {
      loadBookings();
    };

    window.addEventListener('booking-update', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('booking-update', handleBookingUpdate);
    };
  }, [userId, initialBookings.length]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
      })
      .filter(booking => {
        if (!search) return true;
        const searchString = JSON.stringify(booking).toLowerCase();
        return searchString.includes(search.toLowerCase());
      });
  }, [bookings, filter, search]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Pagination functions
  const paginate = (pageNumber) => {
    if (typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    
    // Recalculate which item should be first based on current position
    const newIndexOfFirstItem = (currentPage - 1) * newItemsPerPage;
    if (newIndexOfFirstItem >= filteredBookings.length) {
      // If current page would be empty, go to last page
      const newPage = Math.ceil(filteredBookings.length / newItemsPerPage);
      setCurrentPage(newPage || 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'Home') goToFirstPage();
      if (e.key === 'End') goToLastPage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const handleViewBooking = (bookingId) => {
    alert(`View details for booking: ${bookingId}`);
  };

  const handleTrackBooking = (trackingId) => {
    alert(`Track shipment: ${trackingId}`);
  };

  const handleModifyBooking = (bookingId) => {
    alert(`Modify booking: ${bookingId}`);
  };

  const handleNewBooking = () => {
    window.location.href = '/book-service';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <section className="booking-section">
        <div className="section-header">
          <i className="fas fa-suitcase"></i>
          <h2>My Bookings</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="booking-section">
        <div className="section-header">
          <i className="fas fa-suitcase"></i>
          <h2>My Bookings</h2>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Bookings</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleNewBooking}
            >
              Create Booking
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="booking-section">
      <div className="section-header">
        <i className="fas fa-suitcase"></i>
        <h2>My Bookings</h2>
        {bookings.length > 0 && (
          <span className="booking-count">{bookings.length} bookings</span>
        )}
        <button 
          className="btn btn-primary new-booking-btn"
          onClick={handleNewBooking}
        >
          <i className="fas fa-plus"></i> New Booking
        </button>
      </div>

      {/* Filters and Search */}
      <div className="booking-filters">
        <div className="filter-options">
          {[
            { value: 'all', label: 'All Bookings' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' }
          ].map(({ value, label }) => (
            <button
              key={value}
              className={`filter-btn ${filter === value ? 'active' : ''}`}
              onClick={() => {
                setFilter(value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
            >
              {label}
              {value !== 'all' && (
                <span className="filter-count">
                  {bookings.filter(b => b.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by ID, location, items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
          {search && (
            <button 
              className="clear-search"
              onClick={() => setSearch('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              <i className="fas fa-suitcase"></i>
            </div>
            <h3>No Bookings Found</h3>
            <p>
              {search 
                ? 'No bookings match your search criteria'
                : 'You have no bookings yet'
              }
            </p>
            {!search && (
              <button 
                className="btn btn-primary"
                onClick={handleNewBooking}
              >
                <i className="fas fa-plus"></i> Create Your First Booking
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {currentBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                {/* Card Header */}
                <div className="booking-header">
                  <div className="booking-id">{booking.id} - {booking.type}</div>
                  <div className={`booking-status status-${booking.status}`}>
                    {booking.statusText}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="booking-details">
                  <div className="booking-item">
                    <h4><i className="fas fa-map-marker-alt"></i> From</h4>
                    <p>{booking.from}</p>
                  </div>
                  <div className="booking-item">
                    <h4><i className="fas fa-flag-checkered"></i> To</h4>
                    <p>{booking.to}</p>
                  </div>
                  <div className="booking-item">
                    <h4><i className="fas fa-calendar"></i> Date</h4>
                    <p>{booking.date}</p>
                  </div>
                  <div className="booking-item">
                    <h4><i className="fas fa-box"></i> Items</h4>
                    <p>{booking.items}</p>
                  </div>
                  <div className="booking-item">
                    <h4><i className="fas fa-shipping-fast"></i> Tracking ID</h4>
                    <div className="tracking-id-container">
                      <p className="tracking-id">{booking.trackingId}</p>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(booking.trackingId)}
                        title="Copy tracking ID"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="booking-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewBooking(booking.id)}
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleTrackBooking(booking.trackingId)}
                  >
                    <i className="fas fa-map-marker-alt"></i> Track
                  </button>
                  
                  {booking.status === 'pending' && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleModifyBooking(booking.id)}
                    >
                      <i className="fas fa-edit"></i> Modify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - Only show if there are more than 1 page */}
      {filteredBookings.length > 0 && totalPages > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <div className="items-per-page-selector">
              <label htmlFor="itemsPerPage">Items per page:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                aria-label="Select number of items per page"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={filteredBookings.length}>All ({filteredBookings.length})</option>
              </select>
            </div>
            
            <div className="page-info">
              Showing <span>{indexOfFirstItem + 1}</span> to <span>{Math.min(indexOfLastItem, filteredBookings.length)}</span> of <span>{filteredBookings.length}</span> bookings
              {filter !== 'all' && (
                <span className="filter-info"> (filtered by {filter})</span>
              )}
            </div>
          </div>
          
          {/* Desktop Pagination */}
          <div className="pagination-controls desktop-pagination">
            {/* First Page Button */}
            <button
              className="pagination-btn first-btn"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <i className="fas fa-angle-double-left"></i>
              First
            </button>
            
            {/* Previous Button */}
            <button
              className="pagination-btn prev-btn"
              onClick={prevPage}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <i className="fas fa-chevron-left"></i>
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="page-numbers" aria-label="Page navigation">
              {getPageNumbers().map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span key={`ellipsis-${index}`} className="page-number ellipsis" aria-hidden="true">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => paginate(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              ))}
            </div>
            
            {/* Next Button */}
            <button
              className="pagination-btn next-btn"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next
              <i className="fas fa-chevron-right"></i>
            </button>
            
            {/* Last Page Button */}
            <button
              className="pagination-btn last-btn"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              Last
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
          
          {/* Mobile Pagination */}
          <div className="mobile-pagination">
            <div className="mobile-pagination-controls">
              <button
                className="mobile-pagination-btn"
                onClick={prevPage}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <i className="fas fa-chevron-left"></i>
                Prev
              </button>
              
              <div className="mobile-page-indicator">
                Page <span>{currentPage}</span> of <span>{totalPages}</span>
              </div>
              
              <button
                className="mobile-pagination-btn"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            {/* Jump to page on mobile */}
            <div className="mobile-page-jump">
              <label htmlFor="mobilePageInput">Go to page:</label>
              <input
                id="mobilePageInput"
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    paginate(page);
                  }
                }}
                aria-label="Enter page number"
              />
              <span className="total-pages">/ {totalPages}</span>
            </div>
          </div>
          
          {/* Page Summary */}
          <div className="page-summary">
            <span className="page-total">Total: {filteredBookings.length} bookings</span>
            <span className="page-status">
              {currentPage === 1 && totalPages === 1 ? 'Only page' : 
               currentPage === 1 ? 'First page' :
               currentPage === totalPages ? 'Last page' :
               `Page ${currentPage} of ${totalPages}`}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingSection;