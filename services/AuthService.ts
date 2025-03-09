// AuthService.ts
import { Alert } from "react-native";

const YOUR_COMPUTER_IP = "192.168.0.106:8080"; // REPLACE WITH YOUR ACTUAL IP

// Utility function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

// Initialize storage (no-op now, as we're using a database)
export const initializeStorage = () => {
  // No initialization needed for the database.
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await fetch(`http://${YOUR_COMPUTER_IP}:8000/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    return handleApiResponse(response);
  } catch (error: any) {
    Alert.alert("Registration Error", error.message);
    throw error; // Re-throw to be handled by calling component
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`http://${YOUR_COMPUTER_IP}:8000/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleApiResponse(response);

    // Store user data in global scope (for simplicity in this example)
    if (data.user) {
      global.currentUser = data.user; // Store the entire user object
      global.isLoggedIn = true;
    }

    return data;
  } catch (error: any) {
    Alert.alert("Login Error", error.message);
    throw error;
  }
};

export const logout = () => {
  // Clear user data (using global scope for simplicity)
  global.currentUser = null;
  global.isLoggedIn = false;
  // No need to interact with the database on logout
};

export const isAuthenticated = () => {
  return !!global.isLoggedIn;
};
