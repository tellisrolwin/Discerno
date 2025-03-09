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

// --- News Route ---
app.get("/news", async (req, res) => {
  try {
    // Placeholder data (replace with your actual news data fetching)
    const newsData = {
      Technology: [
        {
          title:
            "Samsung's Galaxy S24 Ultra is a subtle refinement of a fantastic phone",
          link: "https://www.theverge.com/24039691/samsung-galaxy-s24-ultra-review",
          summary:
            "Samsung’s Galaxy S24 Ultra is a subtle refinement of a very good phone formula. It’s not cheap, but it comes with a lot of features and one of the best screens I’ve ever seen.",
          source: "Verge",
        },
      ],
      Business: [
        {
          title: "Microsoft briefly hit a $3 trillion market cap",
          link: "https://www.theverge.com/2024/1/24/24049951/microsoft-3-trillion-market-cap-intraday-trading",
          summary:
            "Microsoft briefly hit a $3 trillion market cap for the first time during trading today, before settling back down slightly below that historic mark. It took Microsoft just over two years to go from $2 trillion to $3 trillion, after taking more than 33 years to reach its first trillion-dollar valuation.",
          source: "Verge",
        },
      ],
      Politics: [
        {
          title: "Trump wins New Hampshire primary",
          link: "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary",
          summary:
            "Donald Trump has won the Republican primary in New Hampshire, according to AP calls of the race, marking another key win for the former president in his bid to retake the White House.",
          source: "Verge",
        },
      ],
      Sports: [
        {
          title: "Taylor Swift attends",
          link: "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary",
          summary:
            "Taylor Swift attends as a spectator, causing shares to rise drastically.",
          source: "Verge",
        },
      ],
    };

    res.json(newsData); // Corrected this line
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

app.get("/article", async (req, res) => {
  try {
    const { link } = req.query;

    // Very simple placeholder (replace with your actual article fetching logic)
    let articleContent = "";
    if (
      link ===
      "https://www.theverge.com/24039691/samsung-galaxy-s24-ultra-review"
    ) {
      articleContent =
        "Samsung’s Galaxy S24 Ultra is a subtle refinement of a very good phone formula. It’s not cheap, but it comes with a lot of features and one of the best screens I’ve ever seen. There’s a titanium frame! You can circle stuff with the S Pen to search for it! The telephoto camera has more megapixels! All of this adds up to a phone that offers an unmatched experience — provided you’re down to pay for it.";
    } else if (
      link ===
      "https://www.theverge.com/2024/1/24/24049951/microsoft-3-trillion-market-cap-intraday-trading"
    ) {
      articleContent =
        "Microsoft briefly hit a $3 trillion market cap for the first time during trading today, before settling back down slightly below that historic mark. It took Microsoft just over two years to go from $2 trillion to $3 trillion, after taking more than 33 years to reach its first trillion-dollar valuation.";
    } else if (
      link ===
      "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary"
    ) {
      articleContent =
        "Donald Trump has won the Republican primary in New Hampshire, according to AP calls of the race, marking another key win for the former president in his bid to retake the White House.";
    } else if (
      link ===
      "https://www.theverge.com/2024/1/23/24048817/trump-wins-new-hampshire-primary"
    ) {
      articleContent =
        "Donald Trump has won the Republican primary in New Hampshire, according to AP calls of the race, marking another key win for the former president in his bid to retake the White House.";
    } else {
      articleContent = "Article content not found.";
    }

    res.json({ article: articleContent });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ message: "Failed to fetch article" });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
