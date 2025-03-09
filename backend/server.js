// backend/server.js
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const port = 8080;

// --- Database Configuration ---
const pool = new Pool({
  user: "postgres", // Your PostgreSQL username
  host: "localhost", // Or your database host
  database: "discernoDB", // The name of your database
  password: "9380", // Your PostgreSQL password - VERY IMPORTANT TO CHANGE THIS
  port: 5432, // Default PostgreSQL port
});

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies

app.use((err, req, res, next) => {
    console.error("Express error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  });

// --- Routes ---

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert the user into the database
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    
    // Initialize preferences for the new user
    await pool.query(
      "INSERT INTO preferences (id, categories) VALUES ($1, $2)",
      [result.rows[0].id, []]
    );

    // 3. Send back the newly created user (without the password!)
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2. Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Send back the user (without the password!)
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  // In a real application with sessions, you'd destroy the session here
  res.status(200).json({ message: "Logged out successfully" });
});

// Check Session Route - For checking if a user is currently logged in
app.get("/check-session", async (req, res) => {
  // In a real application with sessions, you'd check the session here
  // For now, just return a 401 to indicate no active session
  res.status(401).json({ message: "No active session" });
});

// --- News Route ---
app.get("/news", async (req, res) => {
  try {
    // Your actual API call or database query would go here
    // For now, we'll use simplified placeholder data
    const newsData = {
      Technology: [
        {
          title: "Samsung's Galaxy S24 Ultra is a subtle refinement of a fantastic phone",
          link: "https://www.theverge.com/24039691/samsung-galaxy-s24-ultra-review",
          summary: "Samsung's Galaxy S24 Ultra is a subtle refinement of a very good phone formula.",
          source: "Verge",
        },
      ],
      Business: [
        {
          title: "Microsoft briefly hit a $3 trillion market cap",
          link: "https://www.theverge.com/2024/1/24/24049951/microsoft-3-trillion-market-cap-intraday-trading",
          summary: "Microsoft briefly hit a $3 trillion market cap for the first time during trading today.",
          source: "Verge",
        },
      ],
      Politics: [
        {
          title: "Trump wins New Hampshire primary",
          link: "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary",
          summary: "Donald Trump has won the Republican primary in New Hampshire.",
          source: "Verge",
        },
      ],
      Sports: [
        {
          title: "Taylor Swift attends Chiefs game",
          link: "https://example.com/taylor-swift-chiefs-game",
          summary: "Taylor Swift attends as a spectator, causing shares to rise drastically.",
          source: "Verge",
        },
      ],
    };

    res.json(newsData);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

app.get("/article", async (req, res) => {
  try {
    const { link } = req.query;

    // Simple article content lookup
    // In a real app, you would fetch this from a database or external API
    const articleDatabase = {
      "https://www.theverge.com/24039691/samsung-galaxy-s24-ultra-review": 
        "Samsung's Galaxy S24 Ultra is a subtle refinement of a very good phone formula.",
      "https://www.theverge.com/2024/1/24/24049951/microsoft-3-trillion-market-cap-intraday-trading": 
        "Microsoft briefly hit a $3 trillion market cap for the first time during trading today.",
      "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary": 
        "Donald Trump has won the Republican primary in New Hampshire.",
      "https://example.com/taylor-swift-chiefs-game": 
        "Taylor Swift attends as a spectator at the Chiefs game."
    };

    const articleContent = articleDatabase[link] || "Article content not found.";
    res.json({ article: articleContent });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ message: "Failed to fetch article" });
  }
});

// Add new route to update user preferences
app.post("/preferences", async (req, res) => {
    try {
      const { userId, category } = req.body;
      
      console.log("Received preference update request:", req.body);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Explicitly set the content type to application/json
      res.setHeader('Content-Type', 'application/json');
      
      // Log received data
      console.log(`Received preference update: User ID: ${userId}, Category: ${category}`);
      
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
        "SELECT categories FROM preferences WHERE id = $1",
        [userId]
      );
      
      console.log("Current preferences query result:", currentPrefs.rows);
      
      if (currentPrefs.rows.length === 0) {
        // Initialize preferences if they don't exist
        console.log(`Creating new preferences for user ${userId}`);
        await pool.query(
          "INSERT INTO preferences (id, categories) VALUES ($1, $2)",
          [userId, [category]]
        );
        console.log(`Created preferences with category ${category}`);
      } else {
        // Update existing preferences if the category is not already in the array
        const existingCategories = currentPrefs.rows[0].categories || [];
        console.log("Existing categories:", existingCategories);
        
        if (!existingCategories.includes(category)) {
          const updatedCategories = [...existingCategories, category];
          console.log(`Updating preferences to: ${updatedCategories}`);
          
          await pool.query(
            "UPDATE preferences SET categories = $1 WHERE id = $2",
            [updatedCategories, userId]
          );
          console.log("Update successful");
        } else {
          console.log(`Category ${category} already in preferences`);
        }
      }
      
      // IMPORTANT: Return a JSON response
      return res.status(200).json({ 
        message: "Preferences updated successfully",
        success: true
      });
      
    } catch (error) {
      console.error("Error in /preferences route:", error);
      
      // IMPORTANT: Return a JSON error response
      // Explicitly set the content type to application/json
      res.setHeader('Content-Type', 'application/json');
      
      return res.status(500).json({ 
        message: "Failed to update preferences",
        error: error.message,
        success: false
      });
    }
  });

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});