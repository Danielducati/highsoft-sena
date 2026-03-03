const express = require("express");
const router = express.Router();
const { pool, sql } = require("../config/db");


// ==========================================
// GET → OBTENER TODAS LAS CATEGORÍAS
// ==========================================
router.get("/", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request().query(`
    SELECT 
        PK_id_categoria_servicios AS id,
        Nombre,
        descripcion,
        color,
        Estado
    FROM Categoria_servicios
    ORDER BY Nombre ASC
    `);

    res.json(result.recordset);

} catch (error) {
    console.error("ERROR categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
}
});


// ==========================================
// GET → OBTENER UNA CATEGORÍA POR ID
// ==========================================
router.get("/:id", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request()
    .input("id", sql.Int, req.params.id)
    .query(`
        SELECT 
        PK_id_categoria_servicios AS id,
        Nombre,
        descripcion,
        color,
        Estado
        FROM Categoria_servicios
        WHERE PK_id_categoria_servicios = @id
    `);

    if (result.recordset.length === 0) {
    return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.recordset[0]);

} catch (error) {
    console.error("ERROR categoría:", error);
    res.status(500).json({ error: "Error al obtener categoría" });
}
});


// ==========================================
// POST → CREAR CATEGORÍA
// ==========================================
router.post("/", async (req, res) => {
try {
    const { Nombre, descripcion, color, Estado = "Activo" } = req.body;

    if (!Nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const connection = await pool;

    const result = await connection.request()
    .input("Nombre", sql.VarChar(100), Nombre)
    .input("descripcion", sql.VarChar(600), descripcion)
    .input("color", sql.VarChar(20), color)
    .input("Estado", sql.VarChar(30), Estado)
    .query(`
        INSERT INTO Categoria_servicios (Nombre, descripcion, color, Estado)
        OUTPUT INSERTED.*
        VALUES (@Nombre, @descripcion, @color, @Estado)
    `);

    res.status(201).json(result.recordset[0]);

} catch (error) {
    console.error("ERROR crear categoría:", error);
    res.status(500).json({ error: "Error al crear categoría" });
}
});


// ==========================================
// PUT → ACTUALIZAR CATEGORÍA
// ==========================================
router.put("/:id", async (req, res) => {
try {
    const { Nombre, descripcion, color, Estado } = req.body;

    const connection = await pool;

    const result = await connection.request()
    .input("id", sql.Int, req.params.id)
    .input("Nombre", sql.VarChar(100), Nombre)
    .input("descripcion", sql.VarChar(600), descripcion)
    .input("color", sql.VarChar(20), color)
    .input("Estado", sql.VarChar(30), Estado)
    .query(`
        UPDATE Categoria_servicios
        SET Nombre = @Nombre,
            descripcion = @descripcion,
            color = @color,
            Estado = @Estado
        OUTPUT INSERTED.*
        WHERE PK_id_categoria_servicios = @id
    `);

    if (result.recordset.length === 0) {
    return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.recordset[0]);

} catch (error) {
    console.error("ERROR actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar categoría" });
}
});


// ==========================================
// DELETE → DESACTIVAR CATEGORÍA (soft delete)
// ==========================================
router.delete("/:id", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request()
    .input("id", sql.Int, req.params.id)
    .query(`
        UPDATE Categoria_servicios
        SET Estado = 'Inactivo'
        OUTPUT INSERTED.*
        WHERE PK_id_categoria_servicios = @id
    `);

    if (result.recordset.length === 0) {
    return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría desactivada correctamente", data: result.recordset[0] });

} catch (error) {
    console.error("ERROR eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
}
});


module.exports = router;