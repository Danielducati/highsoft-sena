const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

router.get("/", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request().query(`
    SELECT 
        PK_id_rol,
        Nombre,
        Estado
    FROM Roles
    ORDER BY Nombre
    `);

    res.json(result.recordset);

} catch (error) {
    console.error("ERROR roles:", error);
    res.status(500).json({ error: "Error al obtener roles" });
}
});

module.exports = router;
