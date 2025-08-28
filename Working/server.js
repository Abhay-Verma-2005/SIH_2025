import express from "express";
import fetch from "node-fetch";

const app = express();
const DIST_KEY = "YOUR_DISTANCE_MATRIX_AI_KEY"; // <- get from https://distancematrix.ai

app.get("/api/cabs", async (req, res) => {
  try {
    const { slat, slon, dlat, dlon } = req.query;
    if (!slat || !slon || !dlat || !dlon) {
      return res.status(400).json({ success: false, message: "Missing coordinates" });
    }

    // Call distancematrix.ai
    const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${slat},${slon}&destinations=${dlat},${dlon}&key=${DIST_KEY}`;
    const r = await fetch(url);
    const j = await r.json();

    let distanceKm = null, etaMin = null;
    if (j.rows?.[0]?.elements?.[0]?.status === "OK") {
      distanceKm = j.rows[0].elements[0].distance.value / 1000;
      etaMin = Math.round(j.rows[0].elements[0].duration.value / 60);
    }

    // Simulated drivers near the pickup
    const drivers = [
      { name: "Ramesh K", vehicle: "Dzire (AC)" },
      { name: "Aman S", vehicle: "WagonR (AC)" },
      { name: "Priya T", vehicle: "Etios (AC)" }
    ].map((d, i) => ({
      ...d,
      provider: "DemoCab",
      phoneMasked: "98******" + (10 + i),
      etaMin: etaMin ? etaMin + i * 2 : 5 + i * 2,
      distanceKm: distanceKm ? (distanceKm + i * 0.5).toFixed(1) : (1.0 + i * 0.5),
      fareINR: distanceKm ? Math.round(50 + distanceKm * 15 + i * 10) : 200 + i * 20
    }));

    res.json({
      success: true,
      source: { lat: Number(slat), lon: Number(slon) },
      destination: { lat: Number(dlat), lon: Number(dlon) },
      drivers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
