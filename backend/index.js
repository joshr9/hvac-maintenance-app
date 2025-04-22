const express = require("express");
const cors = require("cors");

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const hvacRoutes = require('./routes/hvacUnits')
app.use('/api/hvac-units', hvacRoutes)

const propertyRoutes = require('./routes/properties')
app.use('/api/properties', propertyRoutes)

const maintenanceRoutes = require('./routes/maintenanceLogs')
app.use('/api/maintenance', maintenanceRoutes)

// Root Route
app.get("/", (req, res) => {
  res.send("HVAC Maintenance API is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});