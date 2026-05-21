import User from "../models/User.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
    expiresIn: '30d'
  });
};

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  height: user.height,
  weight: user.weight,
  activityLevel: user.activityLevel,
  goal: user.goal,
  targetCalories: user.targetCalories,
  targetProtein: user.targetProtein,
  targetCarbs: user.targetCarbs,
  targetFat: user.targetFat,
  token: generateToken(user._id)
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json(userResponse(user));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json(userResponse(user));
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { age, height, weight, gender, activityLevel, goal, targets } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.age = age || user.age;
      user.height = height || user.height;
      user.weight = weight || user.weight;
      user.gender = gender || user.gender;
      user.activityLevel = activityLevel || user.activityLevel;
      user.goal = goal || user.goal;
      
      if (targets) {
        user.targetCalories = targets.calories;
        user.targetProtein = targets.protein;
        user.targetCarbs = targets.carbs;
        user.targetFat = targets.fat;
      }

      const updatedUser = await user.save();

      res.json(userResponse(updatedUser));
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json(userResponse(req.user));
};

export const startGoogleAuth = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173/api/auth/google/callback";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

export const handleGoogleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173/api/auth/google/callback";

  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth credentials are not configured");
    }

    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=google_auth_cancelled`);
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });

    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",
      tokenParams,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { data: googleUser } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    let user = await User.findOne({ $or: [{ googleId: googleUser.id }, { email: googleUser.email }] });

    if (user) {
      user.googleId = user.googleId || googleUser.id;
      user.name = user.name || googleUser.name;
      await user.save();
    } else {
      user = await User.create({
        googleId: googleUser.id,
        name: googleUser.name,
        email: googleUser.email
      });
    }

    res.redirect(`${clientUrl}/auth/google/callback?token=${generateToken(user._id)}`);
  } catch (error) {
    console.error("Google auth error:", error.response?.data || error.message);
    res.redirect(`${clientUrl}/login?error=google_auth_failed`);
  }
};
