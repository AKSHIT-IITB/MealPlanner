import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteLeft } from 'react-icons/fa';
import './Home.css';
import pic1 from './pic1.jpg';
import pic2 from './pic2.jpg';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/daily-plan');
  };

  return (
    <div className="home-wrapper">
      {/* CTA Section */}
      <section className="cta-section">
        <h1>Plan Smarter. Eat Better.</h1>
        <p>Your simple and easy meal planner starts here.</p>
        <button onClick={handleGetStarted}>Start Planning Today</button>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section">
        <h2>What Our Fans Say</h2>
        <div className="testimonial-list">
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p><strong>🍕 Why did the tomato blush?</strong><br />Because it saw the salad dressing!</p>
            <div className="user-info">
              <img src={pic1} alt="Fridge Whisperer" />
              <div>
                <strong>Fridge Whisperer</strong>
                <span>Spicy Market</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p><strong>🍟 Why don’t eggs tell jokes?</strong><br />Because they’d crack each other up!</p>
            <div className="user-info">
              <img src={pic2} alt="Chef Disaster" />
              <div>
                <strong>Chef Disaster</strong>
                <span>Slice of Red</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
