const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption key management
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_encryption_key_for_development';
const IV_LENGTH = 16; // For AES, this is always 16

// Encryption utility functions
function encrypt(text) {
  if (!text) return text;
  
  try {
    // Create a cipher
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

function decrypt(text) {
  if (!text) return text;
  
  try {
    // Check if it's a legacy encrypted format or new format
    const textParts = text.split(':');
    
    // New format with IV and encrypted text
    if (textParts.length === 2) {
      const iv = Buffer.from(textParts[0], 'hex');
      const encryptedText = Buffer.from(textParts[1], 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    }
    
    // Legacy format or potentially unencrypted text
    console.warn('Potential legacy or unencrypted text detected');
    return text;
  } catch (error) {
    console.error('Decryption error:', error);
    return text;
  }
}

// Date encryption and decryption functions
function encryptDate(date) {
  if (!date) return date;
  
  try {
    // Convert date to ISO string for consistent encryption
    return encrypt(date instanceof Date ? date.toISOString() : date);
  } catch (error) {
    console.error('Date encryption error:', error);
    return date;
  }
}

function decryptDate(encryptedDate) {
  if (!encryptedDate) return encryptedDate;
  
  try {
    // Attempt to decrypt
    const decryptedDateString = decrypt(encryptedDate);
    
    // Validate if the decrypted string is a valid date
    const parsedDate = new Date(decryptedDateString);
    
    // Check if the parsed date is valid
    return isNaN(parsedDate.getTime()) ? encryptedDate : parsedDate;
  } catch (error) {
    console.error('Date decryption error:', error);
    return encryptedDate;
  }
}

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => 'APT' + Date.now().toString().slice(-6)
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  patientName: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  dentistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dentist',
    validate: {
      validator: function(v) {
        console.log('Validating dentistId:', v);
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid ObjectId!`
    }
  },
  appointmentTime: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  appointmentDate: {
    type: String, // Changed to String to support encryption
    required: true,
    set: encryptDate,
    get: decryptDate
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },
  requirements: {
    schoolId: {
      fileId: String,
      webViewLink: String,
      fileName: String,
      uploadedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Add a method to manually decrypt specific fields
appointmentSchema.methods.decryptSensitiveFields = function() {
  const decryptedAppointment = this.toObject();
  decryptedAppointment.patientName = this.patientName;
  decryptedAppointment.appointmentTime = this.appointmentTime;
  decryptedAppointment.appointmentDate = this.appointmentDate;
  return decryptedAppointment;
};

// Static method to find and decrypt appointments
appointmentSchema.statics.findDecryptedAppointments = async function(query) {
  const appointments = await this.find(query);
  return appointments.map(appointment => appointment.decryptSensitiveFields());
};

// Ensure encryption key is set
if (!process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY is not set. Using default key which is NOT secure for production!');
}

module.exports = mongoose.model('Appointment', appointmentSchema);  