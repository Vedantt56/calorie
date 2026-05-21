import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Profile Stats
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', null], default: null },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  activityLevel: { type: Number }, // PAL multiplier
  goal: { type: String, enum: ['maintenance', 'bulking', 'cutting', 'recomp', null], default: null },
  
  // Targets
  targetCalories: { type: Number, default: 2000 },
  targetProtein: { type: Number, default: 150 },
  targetCarbs: { type: Number, default: 250 },
  targetFat: { type: Number, default: 70 }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
