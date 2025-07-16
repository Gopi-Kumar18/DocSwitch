import React, { useState } from "react";
import axios from "axios";
import "../Styles/ContactUs.css"; 
import support from "../assets/support.png";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg("");

    try {
     
      const payload = {
        enquiryType: "grievance",
        ...formData,
      };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, payload);
      setFeedbackMsg("Your grievance has been submitted successfully!");
      setFormData({
        fullName: "",
        email: "",
        countryCode: "+91",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg(
        "Something went wrong. Please try again later or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      <div className="contact-us-container">

        <div className="contact-left">
          <h2>Contact Us</h2>
          <p>
            For any queries, please reach out to us. Our Support team will get
            back to you within 24 hours.
          </p>
          <ul className="static-contact-info">
            <li>
              <i className="fas fa-envelope"></i> gptz1811@gmail.com
            </li>
            <li>
              <i className="fas fa-phone"></i> +91 6300965097
            </li>
          </ul>
          <div className="illustration">

            <img
              src={support}
              alt="Customer support illustration"
            />
          </div>
        </div>

        <div className="contact-right">
          <h3 className="grievance-heading">Grievance Box</h3>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group phone-group">
              <label htmlFor="phone">
                Phone *
                <span className="country-code-selector">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="+91">IN +91</option>
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                  </select>
                </span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Your message *</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Type your grievance here"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group submit-group">
              <button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>

            {feedbackMsg && <p className="feedback">{feedbackMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
