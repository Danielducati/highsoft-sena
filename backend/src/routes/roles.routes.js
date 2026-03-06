const express = require("express");
const router  = express.Router();
const {
getAllRoles,
getRolById,
createRol,
updateRol,
deactivateRol,
} = require("../controllers/roles.controller");

// Si ya tienes auth middleware, descomenta estas líneas:
// const { verifyToken } = require("../middlewares/auth.middleware");
// const soloAdmin = [verifyToken, (req, res, next) => {
//   if (req.user?.rol !== "Admin")
//     return res.status(403).json({ error: "Solo administradores" });
//   next();
// }];

router.get("/",        /* soloAdmin, */ getAllRoles);
router.get("/:id",     /* soloAdmin, */ getRolById);
router.post("/",       /* soloAdmin, */ createRol);
router.put("/:id",     /* soloAdmin, */ updateRol);
router.delete("/:id",  /* soloAdmin, */ deactivateRol);

module.exports = router;