require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path"); // for photos


// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// uploading photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const maintenancePhotosRoutes = require('./routes/maintenancePhotos');
app.use('/api/maintenance', maintenancePhotosRoutes);

const hvacRoutes = require('./routes/hvacUnits')
app.use('/api/hvac-units', hvacRoutes)

const propertyRoutes = require('./routes/properties')
app.use('/api/properties', propertyRoutes)

const maintenanceRoutes = require('./routes/maintenanceLogs')
app.use('/api/maintenance', maintenanceRoutes)

const scheduledMaintenanceRoutes = require('./routes/scheduledMaintenance');
app.use('/api/scheduled-maintenance', scheduledMaintenanceRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("HVAC Maintenance API is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});