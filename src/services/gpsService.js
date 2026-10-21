const axios = require("axios");
const { Bus, BusGpsTracking } = require("../models");
const { sequelize } = require("../config/database");

const WHEELSEYE_TOKEN = process.env.WHEELSEYE_TOKEN || "98a3355b-4498-48bb-8b70-7b0b04475788";
const WHEELSEYE_URL = `https://api.wheelseye.com/currentLoc?accessToken=${WHEELSEYE_TOKEN}`;

async function syncWheelseyeData() {
  try {
    console.log("[GPS] Fetching Wheelseye data...");
    const res = await axios.get(WHEELSEYE_URL, { timeout: 15000 });
    const list = res.data?.data?.list || [];
    const serverTime = res.data?.data?.serverTime;

    if (!list.length) {
      console.log("[GPS] No vehicles in response");
      return { success: true, count: 0 };
    }

    const vehicleNumbers = list.map((v) => v.vehicleNumber);
    const buses = await Bus.findAll({
      where: { bus_number: vehicleNumbers },
      attributes: ["id", "bus_number"],
    });
    const busMap = new Map(buses.map((b) => [b.bus_number, b.id]));

    // Get or create a fallback bus for unmatched vehicles
    let fallbackBus = await Bus.findOne({ where: { bus_number: 'UNKNOWN_GPS' } });
    if (!fallbackBus) {
      fallbackBus = await Bus.create({
        bus_number: 'UNKNOWN_GPS',
        bus_type: 'UNKNOWN',
        registration_number: 'UNKNOWN',
        seating_capacity: 52,
        status: 'INACTIVE',
      });
    }
    const fallbackBusId = fallbackBus.id;

    const records = list.map((v) => ({
      bus_id: busMap.get(v.vehicleNumber) || fallbackBusId,
      vehicle_number: v.vehicleNumber,
      device_number: v.deviceNumber,
      vendor_code: v.vendorCode,
      vendor_name: v.venndorName,
      latitude: v.latitude,
      longitude: v.longitude,
      speed: v.speed,
      angle: v.angle,
      ignition: v.ignition,
      accurate: v.accurate,
      provider: v.provider,
      vehicle_type: v.vehicleType,
      created_date: v.createdDate,
      created_date_readable: v.createdDateReadable,
      dttime: v.dttime,
      dttime_in_epoch: v.dttimeInEpoch,
      server_time: serverTime,
      raw_data: v,
    }));

    await BusGpsTracking.bulkCreate(records, { ignoreDuplicates: false });
    console.log(`[GPS] Saved ${records.length} GPS records`);

    await updateBusCurrentLocation(records);
    return { success: true, count: records.length };
  } catch (e) {
    console.error("[GPS] Sync failed:", e.message);
    return { success: false, error: e.message };
  }
}

async function updateBusCurrentLocation(records) {
  for (const r of records) {
    if (!r.bus_id) continue;
    await Bus.update(
      {
        gps_device_id: r.device_number,
        gps_api_details: JSON.stringify({
          latitude: r.latitude,
          longitude: r.longitude,
          speed: r.speed,
          ignition: r.ignition,
          last_update: new Date().toISOString(),
        }),
      },
      { where: { id: r.bus_id } }
    );
  }
}

async function startWheelseyeCron(intervalMs = 30000) {
  console.log(`[GPS] Starting Wheelseye cron every ${intervalMs}ms`);
  const tick = async () => {
    await syncWheelseyeData();
  };
  await tick();
  return setInterval(tick, intervalMs);
}

module.exports = { syncWheelseyeData, startWheelseyeCron };