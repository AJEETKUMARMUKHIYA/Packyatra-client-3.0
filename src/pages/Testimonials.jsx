import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
//import "../styles/Testimonials.css";

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Moved from Mumbai to Bangalore",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text:
      "Packyatra made our interstate move from Mumbai to Bangalore completely stress-free. Their team was professional, careful with our belongings, and completed the move ahead of schedule. Highly recommended!",
  },
  {
    name: "Priya Verma",
    location: "Office Relocation in Delhi",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.5,
    text:
      "Excellent service! The packers were very careful with our fragile items. Everything reached safely without any damage. Their pricing was transparent with no hidden charges.",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>Customer Feedback</h2>
        </div>

        <div className="testimonial-slider">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`testimonial-item ${
                index === activeIndex ? "active" : ""
              }`}
            >
              {/* Rating */}
              <div className="testimonial-rating">
                {[...Array(Math.floor(item.rating))].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
                {item.rating % 1 !== 0 && (
                  <FontAwesomeIcon icon={faStarHalfAlt} />
                )}
              </div>

              {/* Text */}
              <p className="testimonial-text">"{item.text}"</p>

              {/* Author */}
              <div className="testimonial-author">
                {/* <div className="author-img">
                  <img src={item.image} alt={item.name} />
                </div> */}
                <div className="author-info">
                  <h4>{item.name}</h4>
                  <p>{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
