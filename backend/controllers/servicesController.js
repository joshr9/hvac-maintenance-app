// controllers/servicesController.js
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/csv/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// GET /api/services - Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { category, active = 'true', search } = req.query;
    
    const where = {};
    
    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }
    
    // Filter by active status
    if (active !== 'all') {
      where.active = active === 'true';
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/services/categories - Get service categories
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await prisma.service.groupBy({
      by: ['category'],
      where: { active: true },
      _count: { _all: true },
      orderBy: { category: 'asc' }
    });
    
    res.json(categories.map(cat => ({
      name: cat.category,
      count: cat._count._all
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/services/:id - Get single service
exports.getServiceById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/services - Create new service
exports.createService = async (req, res) => {
  const {
    name,
    description,
    category,
    unitPrice,
    unitCost,
    durationMinutes,
    bookable,
    quantityEnabled,
    minimumQuantity,
    maximumQuantity,
    taxable,
    active
  } = req.body;
  
  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        unitCost: unitCost ? parseFloat(unitCost) : null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        bookable: bookable === true,
        quantityEnabled: quantityEnabled !== false,
        minimumQuantity: minimumQuantity ? parseFloat(minimumQuantity) : null,
        maximumQuantity: maximumQuantity ? parseFloat(maximumQuantity) : null,
        taxable: taxable !== false,
        active: active !== false
      }
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/services/:id - Update service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    // Process numeric fields
    const processedData = {
      ...updateData,
      ...(updateData.unitPrice && { unitPrice: parseFloat(updateData.unitPrice) }),
      ...(updateData.unitCost && { unitCost: parseFloat(updateData.unitCost) }),
      ...(updateData.durationMinutes && { durationMinutes: parseInt(updateData.durationMinutes) }),
      ...(updateData.minimumQuantity && { minimumQuantity: parseFloat(updateData.minimumQuantity) }),
      ...(updateData.maximumQuantity && { maximumQuantity: parseFloat(updateData.maximumQuantity) })
    };
    
    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: processedData
    });
    
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/services/:id - Delete service
exports.deleteService = async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/services/import-csv - Import services from CSV
exports.importServicesFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    const filePath = req.file.path;
    const services = [];
    
    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to our service model
          services.push({
            name: row.Name || '',
            description: row.Description || null,
            category: row.Category || 'Service',
            unitPrice: row['Unit Price'] ? parseFloat(row['Unit Price']) : null,
            unitCost: row['Unit Cost'] ? parseFloat(row['Unit Cost']) : null,
            durationMinutes: row['Duration Minutes'] ? parseInt(row['Duration Minutes']) : null,
            bookable: row.Bookable === 'true' || row.Bookable === true,
            quantityEnabled: row['Quantity Enabled'] !== 'false',
            minimumQuantity: row['Minimum Quantity'] ? parseFloat(row['Minimum Quantity']) : null,
            maximumQuantity: row['Maximum Quantity'] ? parseFloat(row['Maximum Quantity']) : null,
            taxable: row.Taxable === 'true' || row.Taxable === true,
            active: row.Active === 'true' || row.Active === true
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    if (services.length === 0) {
      return res.status(400).json({ error: 'No valid services found in CSV' });
    }
    
    // Import services to database
    const importResults = await prisma.$transaction(async (tx) => {
      const results = {
        imported: 0,
        skipped: 0,
        errors: []
      };
      
      for (const serviceData of services) {
        try {
          // Check if service already exists
          const existing = await tx.service.findFirst({
            where: { name: serviceData.name }
          });
          
          if (existing) {
            results.skipped++;
          } else {
            await tx.service.create({ data: serviceData });
            results.imported++;
          }
        } catch (error) {
          results.errors.push({
            service: serviceData.name,
            error: error.message
          });
        }
      }
      
      return results;
    });
    
    res.json({
      message: 'CSV import completed',
      results: importResults
    });
    
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/services/stats - Service statistics
exports.getServiceStats = async (req, res) => {
  try {
    const [
      totalServices,
      activeServices,
      categoryCounts,
      priceStats
    ] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),
      prisma.service.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { category: 'asc' }
      }),
      prisma.service.aggregate({
        _avg: { unitPrice: true },
        _min: { unitPrice: true },
        _max: { unitPrice: true },
        where: { 
          active: true,
          unitPrice: { gt: 0 }
        }
      })
    ]);
    
    res.json({
      totalServices,
      activeServices,
      categories: categoryCounts.map(cat => ({
        name: cat.category,
        count: cat._count._all
      })),
      pricing: {
        average: priceStats._avg.unitPrice || 0,
        minimum: priceStats._min.unitPrice || 0,
        maximum: priceStats._max.unitPrice || 0
      }
    });
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Middleware for CSV upload
exports.uploadCSV = upload.single('csvFile');