const express = require("express");
const cors = require("cors");

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const hvacRoutes = require('./routes/hvacUnits')
app.use('/api/hvac-units', hvacRoutes)

// Root Route
app.get("/", (req, res) => {
  res.send("HVAC Maintenance API is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});