const express = require("express");
const router  = express.Router();
const prisma  = require("../config/prisma");

router.get("/", async (req, res) => {
try {
    const data = await prisma.categoriaServicio.findMany({
    where:   { estado: "Activo" },
    orderBy: { nombre: "asc" },
    });
    res.json(data);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.post("/", async (req, res) => {
try {
    const { nombre, descripcion, color } = req.body;
    const data = await prisma.categoriaServicio.create({
    data: { nombre, descripcion: descripcion ?? null, color: color ?? null, estado: "Activo" },
    });
    res.status(201).json(data);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.put("/:id", async (req, res) => {
try {
    const { nombre, descripcion, color, estado } = req.body;
    const data = await prisma.categoriaServicio.update({
    where: { id: Number(req.params.id) },
    data:  { nombre, descripcion: descripcion ?? null, color: color ?? null, estado: estado ?? "Activo" },
    });
    res.json(data);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.delete("/:id", async (req, res) => {
try {
    await prisma.categoriaServicio.update({
    where: { id: Number(req.params.id) },
    data:  { estado: "Inactivo" },
    });
    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;