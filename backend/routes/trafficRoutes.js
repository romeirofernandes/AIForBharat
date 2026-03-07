const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const trafficController = require("../controllers/trafficController");

// Public: fine catalog
router.get("/fines", trafficController.getFines);

// Protected: vehicle management
router.post("/vehicles", requireAuth, trafficController.addVehicle);
router.get("/vehicles", requireAuth, trafficController.getVehicles);
router.delete("/vehicles/:id", requireAuth, trafficController.removeVehicle);

// Protected: challans
router.get("/challans", requireAuth, trafficController.getChallans);
router.get("/challans/:id", requireAuth, trafficController.getChallanById);

module.exports = router;
