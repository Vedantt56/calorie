import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
    expiresIn: '30d'
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
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
      res.json({
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

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        activityLevel: updatedUser.activityLevel,
        goal: updatedUser.goal,
        targetCalories: updatedUser.targetCalories,
        targetProtein: updatedUser.targetProtein,
        targetCarbs: updatedUser.targetCarbs,
        targetFat: updatedUser.targetFat,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
