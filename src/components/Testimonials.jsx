import React from "react";
import Slider from "react-slick";

const Testimonials = () => {
    const reviews = [
        { name: "John", comment: "Excellent service!", rating: 5 },
        { name: "Doe", comment: "Very reliable.", rating: 4 },
    ];

    const settings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1 };

    return (
        <Slider {...settings}>
            {reviews.map((review, index) => (
                <div key={index}>
                    <h3>{review.name}</h3>
                    <p>{review.comment}</p>
                    <p>Rating: {review.rating}/5</p>
                </div>
            ))}
        </Slider>
    );
};

export default Testimonials;
