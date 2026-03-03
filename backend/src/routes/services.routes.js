const express = require("express");
const router  = express.Router();
const prisma  = require("../config/prisma");

function formatService(s) {
return {
    id:          s.id,
    name:        s.nombre,
    descripcion: s.descripcion ?? "",
    duration:    s.duracion   ?? 0,
    price:       Number(s.precio ?? 0),
    category:    s.categoria?.nombre ?? "",
    categoryId:  s.categoriaId,
    imagen:      s.imagenServicio ?? "",
    estado:      s.estado,
};
}

// GET /services
router.get("/", async (req, res) => {
try {
    const data = await prisma.servicio.findMany({
    include:  { categoria: true },
    orderBy:  { nombre: "asc" },
    });
    res.json(data.map(formatService));
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// GET /services/:id
router.get("/:id", async (req, res) => {
try {
    const s = await prisma.servicio.findUnique({
    where:   { id: Number(req.params.id) },
    include: { categoria: true },
    });
    if (!s) return res.status(404).json({ error: "Servicio no encontrado" });
    res.json(formatService(s));
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// POST /services
router.post("/", async (req, res) => {
try {
    const { nombre, descripcion, Duracion, Precio, FK_categoria_servicios, imagen_servicio, Estado } = req.body;

    if (!nombre || !FK_categoria_servicios)
    return res.status(400).json({ error: "nombre y categoría son requeridos" });

    const s = await prisma.servicio.create({
    data: {
        nombre,
        descripcion:    descripcion    ?? null,
        duracion:       Duracion       ?? null,
        precio:         Precio         ?? null,
        categoriaId:    Number(FK_categoria_servicios),
        imagenServicio: imagen_servicio ?? null,
        estado:         Estado         ?? "Activo",
    },
    include: { categoria: true },
    });

    res.status(201).json({ ok: true, id: s.id });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// PUT /services/:id
router.put("/:id", async (req, res) => {
try {
    const { nombre, descripcion, Duracion, Precio, FK_categoria_servicios, imagen_servicio, Estado } = req.body;

    const data = {};
    if (nombre              !== undefined) data.nombre         = nombre;
    if (descripcion         !== undefined) data.descripcion    = descripcion;
    if (Duracion            !== undefined) data.duracion       = Duracion;
    if (Precio              !== undefined) data.precio         = Precio;
    if (FK_categoria_servicios !== undefined) data.categoriaId = Number(FK_categoria_servicios);
    if (imagen_servicio     !== undefined) data.imagenServicio = imagen_servicio;
    if (Estado              !== undefined) data.estado         = Estado;

    await prisma.servicio.update({
    where: { id: Number(req.params.id) },
    data,
    });

    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// DELETE /services/:id — soft delete
router.delete("/:id", async (req, res) => {
try {
    await prisma.servicio.update({
    where: { id: Number(req.params.id) },
    data:  { estado: "Inactivo" },
    });
    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;