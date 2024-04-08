const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const axios = require("axios"); // Import Axios to make HTTP requests
const cors = require("cors"); // Import the CORS middleware
const { MongoClient } = require("mongodb");

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000/isAuthenticated", // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Session configuration
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1096220527316-apgu21nl03gbfa8c43tmdn53i2389o3k.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Here, you can handle user authentication logic
      // For simplicity, we'll just return the user profile

      // Call done to indicate successful authentication
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout(); // Logout the user
  res.redirect("/"); // Redirect to the home page after logout
});

// Protected route
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Profile route
app.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile");
});


// Define the /login route
app.get('/login', async (req, res) => {
    try {
        // Fetch the profile page from Learn IT Tech
        console.log("inside login")
        const response = await fetch('http://localhost:3000/profile');
        //const data = await response.json();
        //console.log(response);
       res.send(response);
    } catch (error) {
        console.log(error)
        // Handle any errors that occur during the fetch request
        res.send("Error")
        res.status(500).send('Internal server error');
    }
});



// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err,
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

