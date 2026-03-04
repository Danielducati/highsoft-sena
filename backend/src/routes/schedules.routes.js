const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/schedules.controller");

router.get("/",                              ctrl.getAll);
router.post("/",                             ctrl.create);
router.put("/:employeeId/:weekStartDate",    ctrl.update);
router.delete("/:employeeId/:weekStartDate", ctrl.remove);

module.exports = router;