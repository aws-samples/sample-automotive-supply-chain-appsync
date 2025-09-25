const fs = require("fs");

// Function to generate random integers
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate random date between start and end
function getRandomDate(start, end) {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Part names and categories relevant to the automotive domain
const partNames = [
  "Engine",
  "Transmission",
  "Brake Pad",
  "Tire",
  "Battery",
  "Alternator",
  "Radiator",
  "Fuel Pump",
  "Muffler",
  "Spark Plug",
  "Oil Filter",
  "Air Filter",
  "Shock Absorber",
  "Windshield",
  "Headlight",
  "Tail Light",
  "Steering Wheel",
  "Dashboard",
  "Seat Belt",
  "Airbag",
  "Exhaust",
  "Catalytic Converter",
  "Timing Belt",
  "Water Pump",
  "Clutch",
  "Fuel Injector",
  "AC Compressor",
  "Brake Disc",
  "Brake Caliper",
  "Window Motor",
  "Door Lock",
  "Rearview Mirror",
  "Side Mirror",
  "Horn",
  "Windshield Wiper",
  "Sunroof",
  "Towing Hook",
  "Turbocharger",
  "Battery Cable",
  "Starter Motor",
  "Fender",
  "Hood",
  "Grille",
  "Bumper",
  "Spoiler",
  "Roof Rack",
  "Floor Mat",
  "Wheel Hub",
  "Tire Pressure Sensor",
  "Carburetor",
  "Ignition Coil",
  "Throttle Body",
  "Mass Airflow Sensor",
  "Oxygen Sensor",
  "Camshaft",
  "Crankshaft",
  "Piston",
  "Connecting Rod",
  "Cylinder Head",
  "Valve",
  "Engine Block",
  "Gasket",
  "Manifold",
  "Differential",
  "Drive Shaft",
  "Axle",
  "CV Joint",
  "Control Arm",
  "Ball Joint",
  "Tie Rod",
  "Wheel Bearing",
  "Suspension Spring",
  "Strut",
  "Stabilizer Bar",
  "Leaf Spring",
  "Air Suspension",
  "Torsion Bar",
  "Rack and Pinion",
  "Power Steering Pump",
  "Steering Column",
  "Ignition Switch",
  "Fuel Tank",
  "Fuel Cap",
  "Gas Pedal",
  "Brake Pedal",
  "Clutch Pedal",
  "Handbrake",
  "Shift Knob",
  "Transmission Fluid",
  "Coolant",
  "Brake Fluid",
  "Power Steering Fluid",
  "Engine Oil",
  "Gear Oil",
  "Windshield Washer Fluid",
];

const partCategories = [
  "Mechanical",
  "Electrical",
  "Braking",
  "Wheels",
  "Interior",
  "Exterior",
  "Engine",
  "Transmission",
  "Suspension",
  "Fuel System",
];

// Function to generate parts data
function generateParts() {
  const parts = [];
  for (let i = 1; i <= 100; i++) {
    const partName = partNames[i % partNames.length];
    const partCategory = partCategories[i % partCategories.length];
    const unitPrice = getRandomInt(20, 5000).toFixed(2);
    parts.push(`('${partName}', '${partCategory}', ${unitPrice})`);
  }
  return parts.join(",\n");
}

// Function to generate orders and shipments data
function generateOrdersAndShipments() {
  const orders = [];
  const shipments = [];
  const startDate = new Date(2022, 0, 1);
  const endDate = new Date(2023, 11, 31);
  for (let i = 1; i <= 1000; i++) {
    const partId = getRandomInt(1, 100);
    const orderDate = getRandomDate(startDate, endDate);
    const quantityOrdered = getRandomInt(1, 50);
    const fulfilled = Math.random() > 0.1 ? true : false; // 90% chance of being fulfilled
    orders.push(
      `(${partId}, '${orderDate}', ${quantityOrdered}, ${fulfilled})`
    );

    const shipmentDate = getRandomDate(new Date(orderDate), endDate);
    const quantityShipped = quantityOrdered; // Assuming all ordered quantity is shipped
    shipments.push(`(${partId}, '${shipmentDate}', ${quantityShipped})`);
  }
  return {
    orders,
    shipments,
  };
}

// Generate the SQL script
const parts = generateParts();
const { orders, shipments } = generateOrdersAndShipments();

const insertParts = `
-- Insert sample data into Parts table
INSERT INTO Parts (part_name, part_category, unit_price) VALUES
${parts};
`;

const chunkSize = 1000;

let insertOrders = `-- Insert sample data into Orders table\n`;
for (let i = 0; i < orders.length; i += chunkSize) {
  const chunk = orders.slice(i, i + chunkSize).join(",\n");
  insertOrders += `INSERT INTO Orders (part_id, order_date, quantity_ordered, fulfilled) VALUES\n${chunk};\n`;
}

let insertShipments = `-- Insert sample data into Shipments table\n`;
for (let i = 0; i < shipments.length; i += chunkSize) {
  const chunk = shipments.slice(i, i + chunkSize).join(",\n");
  insertShipments += `INSERT INTO Shipments (part_id, shipment_date, quantity_shipped) VALUES\n${chunk};\n`;
}

const sqlScript = `
-- Create Parts table
CREATE TABLE Parts (
    part_id SERIAL PRIMARY KEY,
    part_name VARCHAR(255) NOT NULL,
    part_category VARCHAR(255),
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Create Orders table
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    part_id INT NOT NULL,
    order_date VARCHAR(255) NOT NULL,
    quantity_ordered INT NOT NULL,
    fulfilled BOOLEAN NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Parts(part_id)
);

-- Create Shipments table
CREATE TABLE Shipments (
    shipment_id SERIAL PRIMARY KEY,
    part_id INT NOT NULL,
    shipment_date VARCHAR(255) NOT NULL,
    quantity_shipped INT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Parts(part_id)
);

${insertParts}
${insertOrders}
${insertShipments}
`;

// Write the SQL script to a file
fs.writeFileSync("generate_supply_chain_data.sql", sqlScript);

console.log("SQL script generated successfully!");
