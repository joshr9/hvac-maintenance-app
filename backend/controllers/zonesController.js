// controllers/zonesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllZones = async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        properties: {
          include: {
            property: true
          }
        },
        _count: {
          select: {
            properties: true,
            jobs: true,
            recurringTemplates: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getZoneById = async (req, res) => {
  const { id } = req.params;
  try {
    const zone = await prisma.zone.findUnique({
      where: { id: parseInt(id) },
      include: {
        properties: {
          include: {
            property: true
          }
        },
        jobs: {
          include: {
            property: true,
            recurringTemplate: true
          },
          orderBy: { scheduledDate: 'desc' }
        },
        recurringTemplates: {
          include: {
            _count: {
              select: {
                generatedJobs: true
              }
            }
          }
        }
      }
    });
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    res.json(zone);
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createZone = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Zone name is required' });
  }
  
  try {
    const zone = await prisma.zone.create({
      data: { 
        name: name.trim(), 
        description: description?.trim() || null,
        isActive: true
      }
    });
    res.status(201).json(zone);
  } catch (error) {
    console.error('Error creating zone:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Zone name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateZone = async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;
  
  try {
    const zone = await prisma.zone.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json(zone);
  } catch (error) {
    console.error('Error updating zone:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if zone has any jobs or templates
    const zone = await prisma.zone.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            jobs: true,
            recurringTemplates: true,
            properties: true
          }
        }
      }
    });

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    if (zone._count.jobs > 0 || zone._count.recurringTemplates > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete zone that has jobs or recurring templates. Please reassign them first.' 
      });
    }

    await prisma.zone.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getZoneProperties = async (req, res) => {
  const { id } = req.params;
  
  try {
    const zoneProperties = await prisma.propertyZone.findMany({
      where: { zoneId: parseInt(id) },
      include: {
        property: {
          include: {
            suites: true,
            _count: {
              select: {
                jobs: true
              }
            }
          }
        }
      }
    });

    const properties = zoneProperties.map(zp => zp.property);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching zone properties:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.assignPropertyToZone = async (req, res) => {
  const { id } = req.params; // zone id
  const { propertyId, isPrimary = true } = req.body;
  
  try {
    // Check if property already assigned to this zone
    const existingAssignment = await prisma.propertyZone.findUnique({
      where: {
        propertyId_zoneId: {
          propertyId: parseInt(propertyId),
          zoneId: parseInt(id)
        }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Property already assigned to this zone' });
    }

    const assignment = await prisma.propertyZone.create({
      data: {
        zoneId: parseInt(id),
        propertyId: parseInt(propertyId),
        isPrimary,
        assignedBy: 'System' // TODO: Add actual user tracking
      },
      include: {
        property: true,
        zone: true
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning property to zone:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removePropertyFromZone = async (req, res) => {
  const { id, propertyId } = req.params;
  
  try {
    await prisma.propertyZone.delete({
      where: {
        propertyId_zoneId: {
          propertyId: parseInt(propertyId),
          zoneId: parseInt(id)
        }
      }
    });

    res.json({ message: 'Property removed from zone successfully' });
  } catch (error) {
    console.error('Error removing property from zone:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property assignment not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

