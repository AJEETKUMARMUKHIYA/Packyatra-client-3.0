import React, { useEffect, useState } from "react";

const TestimonialSection = () => {
  const testimonials = ["Excellent service!", "Professional movers!", "Highly recommend PackYatra."];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent(prev => (prev + 1) % testimonials.length), 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="testimonial-section">
      <h2>Testimonials</h2>
      <p>{testimonials[current]}</p>
    </section>
  );
};

export default TestimonialSection;
