import React from "react";
import "./twinkle.css";

const TwinklingStars = () => {
  const numberOfStars = 800;
  const stars = Array.from({ length: numberOfStars }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100, 
    size: Math.random() * 2 + 1, 
    duration: Math.random() * 2 + 1, 
    delay: Math.random() * 3, 
  }));

  return (
    <div className="stars-container">
      {stars.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default TwinklingStars;
