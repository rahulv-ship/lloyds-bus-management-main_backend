const { connectDatabase } = require("./config/database");
const { Bus, Vendor } = require("./models");

const WHEELSEYE_BUSES = [
  { bus_number: "MH34CQ3491", bus_type: "Open", registration_number: "MH34CQ3491", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "S. Kumar" },
  { bus_number: "MH34CQ3605", bus_type: "NA", registration_number: "MH34CQ3605", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "R. Sharma" },
  { bus_number: "MH34CQ3604", bus_type: "NA", registration_number: "MH34CQ3604", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "A. Patel" },
  { bus_number: "MH34CQ3492", bus_type: "NA", registration_number: "MH34CQ3492", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "M. Singh" },
  { bus_number: "MH34CQ3603", bus_type: "NA", registration_number: "MH34CQ3603", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "K. Reddy" },
  { bus_number: "MH34CQ3198", bus_type: "Open", registration_number: "MH34CQ3198", seating_capacity: 52, vendor_code: "WE9261812", driver_name: "V. Rao" },
];

const seedWheelseyeBuses = async () => {
  try {
    await connectDatabase();

    let vendor = await Vendor.findOne({ where: { vendor_code: "WE9261812" } });
    if (!vendor) {
      vendor = await Vendor.create({
        vendor_code: "WE9261812",
        vendor_name: "Sairaj Tours and Travels",
        contact_person: "Transport Manager",
        phone: "+91-9876543210",
        email: "transport@sairajtours.com",
        address: "Chandrapur, Maharashtra",
        status: "ACTIVE",
      });
      console.log("✅ Vendor created: Sairaj Tours and Travels");
    }

    for (const busData of WHEELSEYE_BUSES) {
      const [bus, created] = await Bus.findOrCreate({
        where: { bus_number: busData.bus_number },
        defaults: {
          bus_type: busData.bus_type,
          registration_number: busData.registration_number,
          seating_capacity: busData.seating_capacity,
          vendor_id: vendor.id,
          status: "ACTIVE",
          gps_device_id: null,
        },
      });

      if (created) {
        console.log(`✅ Bus created: ${busData.bus_number} (${busData.bus_type})`);
      } else {
        console.log(`ℹ️ Bus already exists: ${busData.bus_number}`);
      }
    }

    console.log("--------------------------------");
    console.log("Wheelseye buses seeded successfully");
    console.log("--------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Wheelseye bus seed failed:");
    console.error(error);
    process.exit(1);
  }
};

seedWheelseyeBuses();