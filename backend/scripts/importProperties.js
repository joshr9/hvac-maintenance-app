require('dotenv').config({ path: '.env' }); // Optional: Only if using .env

const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

const FILE_PATH = path.join(__dirname, '../../', 'HVAC_Properties.xlsx');

async function main() {
  let workbook;
  try {
    workbook = xlsx.readFile(FILE_PATH);
  } catch (err) {
    console.error("Could not open Excel file:", FILE_PATH, err);
    process.exit(1);
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Clear all data before importing (dev/staging only)
  await prisma.hvacUnit.deleteMany({});
  await prisma.suite.deleteMany({});
  await prisma.property.deleteMany({});
  console.log("Cleared Property, Suite, and HVACUnit tables.");

  for (const row of rows.slice(1)) { // Skip header row
    const status = row[0]?.toString().trim();
    const propertyAddress = row[1]?.toString().trim();
    const suiteName = row[2]?.toString().trim();
    const labelCell = row[3]?.toString().trim();
    const model = row[5]?.toString().trim();
    const serial = row[6]?.toString().trim();
    const filterSize = row[7]?.toString().trim();
    const year = parseInt(row[8]);
    const notes = row[9]?.toString().trim() || null;

    // Skip blank/header property rows
    if (!propertyAddress || propertyAddress === "Property") continue;

    // Upsert property from the address in this row
    let property;
    try {
      property = await prisma.property.upsert({
        where: { address: propertyAddress },
        update: {},
        create: {
          name: propertyAddress,
          address: propertyAddress,
        }
      });
    } catch (err) {
      console.error(`Failed to upsert property: ${propertyAddress}`, err);
      continue;
    }

    // Skip if suite column is blank/header
    if (!suiteName || suiteName === "Suite") continue;

    // Upsert suite for this property
    let suiteRecord;
    try {
      suiteRecord = await prisma.suite.upsert({
        where: {
          name_propertyId: {
            name: suiteName,
            propertyId: property.id
          }
        },
        update: {},
        create: {
          name: suiteName,
          tenant: status?.toLowerCase().includes('tenant') || false,
          propertyId: property.id
        }
      });
    } catch (err) {
      console.error(`Failed to upsert suite: ${suiteName} for property: ${propertyAddress}`, err);
      continue;
    }

    // Only skip if model or serial is missing
    if (!model || !serial) continue;
    const cleanedSerial = serial.trim().toUpperCase();
    const cleanedModel = model.trim().toUpperCase();
    if (!cleanedSerial || cleanedSerial === 'N/A') continue;

    // Generate fallback label if labelCell is blank
    let hvacLabel = labelCell;
    if (!hvacLabel) {
      if (cleanedSerial && cleanedSerial !== 'N/A') {
        hvacLabel = cleanedSerial;
      } else if (cleanedModel && cleanedModel !== 'N/A') {
        hvacLabel = cleanedModel;
      } else if (filterSize && filterSize !== 'N/A') {
        hvacLabel = filterSize;
      } else {
        hvacLabel = `Unit for Suite ${suiteName}`;
      }
    }

    let installDate = new Date('2000-01-01T00:00:00Z');
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      installDate = new Date(`${year}-01-01T00:00:00Z`);
    }

    // Check for duplicate HVAC unit by serial number
    const existing = await prisma.hvacUnit.findUnique({
      where: { serialNumber: cleanedSerial }
    });
    if (existing) continue;

    // Create HVAC Unit
    const hvacUnitData = {
      label: hvacLabel,
      serialNumber: cleanedSerial,
      model: cleanedModel,
      installDate: installDate,
      filterSize: filterSize,
      notes: notes,
      suiteId: suiteRecord.id,
    };

    try {
      await prisma.hvacUnit.create({ data: hvacUnitData });
    } catch (err) {
      console.error(`Failed to insert HVAC unit: ${cleanedSerial}`, err);
    }
  }

  // Ensure every property has at least one suite
  let mainSuitesAdded = 0;
  const allProperties = await prisma.property.findMany({ include: { suites: true } });
  for (const prop of allProperties) {
    if (!prop.suites || prop.suites.length === 0) {
      await prisma.suite.create({
        data: {
          name: 'Main',
          tenant: false,
          propertyId: prop.id
        }
      });
      mainSuitesAdded += 1;
    }
  }
  if (mainSuitesAdded > 0) {
    console.log(`Added ${mainSuitesAdded} main suites for properties with no suites.`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Script error:", e);
  process.exit(1);
});