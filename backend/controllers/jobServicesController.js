// controllers/jobServicesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/jobs/:jobId/services - Get all services for a job
exports.getJobServices = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const services = await prisma.jobLineItem.findMany({
      where: {
        jobId: parseInt(jobId)
      },
      include: {
        service: true // Include the original service reference if it exists
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching job services:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs/:jobId/services - Add a service to a job
exports.addJobService = async (req, res) => {
  const { jobId } = req.params;
  const {
    serviceId,
    serviceName,
    description,
    quantity,
    unitPrice,
    unitCost,
    totalPrice,
    totalCost,
    notes
  } = req.body;
  
  try {
    // Validation
    if (!serviceName || !serviceName.trim()) {
      return res.status(400).json({ error: 'Service name is required' });
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get the highest sort order for this job
    const lastItem = await prisma.jobLineItem.findFirst({
      where: { jobId: parseInt(jobId) },
      orderBy: { sortOrder: 'desc' }
    });
    
    const nextSortOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    // Create the job line item
    const newService = await prisma.jobLineItem.create({
      data: {
        jobId: parseInt(jobId),
        serviceId: serviceId ? parseInt(serviceId) : null,
        serviceName: serviceName.trim(),
        description: description?.trim() || null,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice || 0),
        unitCost: unitCost ? parseFloat(unitCost) : null,
        totalPrice: parseFloat(totalPrice || 0),
        totalCost: totalCost ? parseFloat(totalCost) : null,
        notes: notes?.trim() || null,
        sortOrder: nextSortOrder
      }
    });

    // Update job totals
    await updateJobTotals(parseInt(jobId));
    
    // Return the created service with service reference if applicable
    const serviceWithRelations = await prisma.jobLineItem.findUnique({
      where: { id: newService.id },
      include: { service: true }
    });
    
    res.status(201).json(serviceWithRelations);
  } catch (error) {
    console.error('Error adding job service:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/jobs/:jobId/services/:serviceId - Update a service on a job
exports.updateJobService = async (req, res) => {
  const { jobId, serviceId } = req.params;
  const {
    serviceName,
    description,
    quantity,
    unitPrice,
    unitCost,
    totalPrice,
    totalCost,
    notes
  } = req.body;
  
  try {
    // Validation
    if (!serviceName || !serviceName.trim()) {
      return res.status(400).json({ error: 'Service name is required' });
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Verify the line item exists and belongs to this job
    const existingService = await prisma.jobLineItem.findFirst({
      where: {
        id: parseInt(serviceId),
        jobId: parseInt(jobId)
      }
    });
    
    if (!existingService) {
      return res.status(404).json({ error: 'Service not found on this job' });
    }

    // Update the job line item
    const updatedService = await prisma.jobLineItem.update({
      where: { id: parseInt(serviceId) },
      data: {
        serviceName: serviceName.trim(),
        description: description?.trim() || null,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice || 0),
        unitCost: unitCost ? parseFloat(unitCost) : null,
        totalPrice: parseFloat(totalPrice || 0),
        totalCost: totalCost ? parseFloat(totalCost) : null,
        notes: notes?.trim() || null
      }
    });

    // Update job totals
    await updateJobTotals(parseInt(jobId));
    
    // Return the updated service with service reference if applicable
    const serviceWithRelations = await prisma.jobLineItem.findUnique({
      where: { id: updatedService.id },
      include: { service: true }
    });
    
    res.json(serviceWithRelations);
  } catch (error) {
    console.error('Error updating job service:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/jobs/:jobId/services/:serviceId - Remove a service from a job
exports.deleteJobService = async (req, res) => {
  const { jobId, serviceId } = req.params;
  
  try {
    // Verify the line item exists and belongs to this job
    const existingService = await prisma.jobLineItem.findFirst({
      where: {
        id: parseInt(serviceId),
        jobId: parseInt(jobId)
      }
    });
    
    if (!existingService) {
      return res.status(404).json({ error: 'Service not found on this job' });
    }

    // Delete the job line item
    await prisma.jobLineItem.delete({
      where: { id: parseInt(serviceId) }
    });

    // Update job totals
    await updateJobTotals(parseInt(jobId));
    
    res.json({ message: 'Service removed from job successfully' });
  } catch (error) {
    console.error('Error deleting job service:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs/:jobId/services/reorder - Reorder services on a job
exports.reorderJobServices = async (req, res) => {
  const { jobId } = req.params;
  const { serviceIds } = req.body; // Array of service IDs in new order
  
  try {
    // Verify all services belong to this job
    const existingServices = await prisma.jobLineItem.findMany({
      where: {
        jobId: parseInt(jobId),
        id: { in: serviceIds.map(id => parseInt(id)) }
      }
    });
    
    if (existingServices.length !== serviceIds.length) {
      return res.status(400).json({ error: 'Some services do not belong to this job' });
    }

    // Update sort orders
    const updatePromises = serviceIds.map((serviceId, index) =>
      prisma.jobLineItem.update({
        where: { id: parseInt(serviceId) },
        data: { sortOrder: index }
      })
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Services reordered successfully' });
  } catch (error) {
    console.error('Error reordering job services:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update job totals
async function updateJobTotals(jobId) {
  try {
    // Calculate totals from all line items
    const lineItems = await prisma.jobLineItem.findMany({
      where: { jobId: jobId }
    });
    
    const totalPrice = lineItems.reduce((sum, item) => 
      sum + parseFloat(item.totalPrice || 0), 0
    );
    
    const totalCost = lineItems.reduce((sum, item) => 
      sum + parseFloat(item.totalCost || 0), 0
    );
    
    const profitMargin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;
    
    // Update the job record
    await prisma.job.update({
      where: { id: jobId },
      data: {
        totalPrice,
        totalCost,
        profitMargin
      }
    });
    
    return { totalPrice, totalCost, profitMargin };
  } catch (error) {
    console.error('Error updating job totals:', error);
    throw error;
  }
}

module.exports = exports;