import { mongoose } from '../utils/coreModules.js';

const ContactMessageSchema = new mongoose.Schema({
  enquiryType: {
    type: String,
    enum: ["grievance"],
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  countryCode: {
    type: String,
    default: "+91",
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
