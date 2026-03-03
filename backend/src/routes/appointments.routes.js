const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/appointments.controller");

// Appointments no requiere auth por ahora — activar cuando el frontend envíe token
router.get("/",             ctrl.getAll);
router.get("/:id",          ctrl.getOne);
router.post("/",            ctrl.create);
router.put("/:id",          ctrl.update);
router.patch("/:id/status", ctrl.updateStatus);
router.patch("/:id/cancel", ctrl.cancel);
router.delete("/:id",       ctrl.remove);

module.exports = router;