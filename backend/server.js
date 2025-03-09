// backend/server.js
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const port = 8080;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "discernoDB",
  password: "9380",
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
    console.error("Express error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  });

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    // Use 'id' here, as it's the correct column name.
    await pool.query(
      "INSERT INTO preferences (id, categories) VALUES ($1, $2)",
      [result.rows[0].id, []]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

app.get("/check-session", async (req, res) => {
  res.status(401).json({ message: "No active session" });
});

app.get("/user-preferences", async (req, res) => {
    try {
        const userId = req.query.userId; // Get userId from query parameters

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Query the preferences table using the correct ID column
        const result = await pool.query(
            "SELECT categories FROM preferences WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User preferences not found", categories: [] }); // Return empty array
        }

        const preferences = result.rows[0];
        res.json({ categories: preferences.categories }); // Correctly return the categories
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        res.status(500).json({ message: "Server error fetching preferences" });
    }
});

app.post("/preferences", async (req, res) => {
    try {
      const { userId, category } = req.body;
      
      console.log("Received preference update request:", req.body);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // First check if the user exists
      const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
      );
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`User ${userId} verified in database`);
      
      // Get current preferences
      const currentPrefs = await pool.query(
        "SELECT categories FROM preferences WHERE id = $1", // Use 'id'
        [userId]
      );
      
      console.log("Current preferences query result:", currentPrefs.rows);
      
      if (currentPrefs.rows.length === 0) {
        // Initialize preferences if they don't exist
        console.log(`Creating new preferences for user ${userId}`);
        await pool.query(
          "INSERT INTO preferences (id, categories) VALUES ($1, $2)", // Use 'id'
          [userId, [category]]
        );
        console.log(`Created preferences with category ${category}`);
      } else {
        // Update existing preferences
        const existingCategories = currentPrefs.rows[0].categories || [];
        console.log("Existing categories:", existingCategories);
        
        if (!existingCategories.includes(category)) {
          const updatedCategories = [...existingCategories, category];
          console.log(`Updating preferences to: ${updatedCategories}`);
          
          await pool.query(
            "UPDATE preferences SET categories = $1 WHERE id = $2", // Use 'id'
            [updatedCategories, userId]
          );
          console.log("Update successful");
        } else {
          console.log(`Category ${category} already in preferences`);
        }
      }

      return res.status(200).json({ 
        message: "Preferences updated successfully",
        success: true
      });
      
    } catch (error) {
      console.error("Error in /preferences route:", error);
      
      return res.status(500).json({ 
        message: "Failed to update preferences",
        error: error.message,
        success: false
      });
    }
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});