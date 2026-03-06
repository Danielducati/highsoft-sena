// src/controllers/servicesController.js
const servicesModel = require("../models/services");
const { categoriesModel } = require("../models/services");

// ─── SERVICIOS ───────────────────────────────────────────────────────────────

const getAllServices = async (req, res) => {
try {
    const soloActivos = req.query.all === "true" ? false : true;
    const services = await servicesModel.getAll({ soloActivos });
    res.json({ ok: true, data: services });
} catch (error) {
    console.error("getAllServices:", error);
    res.status(500).json({ ok: false, message: "Error al obtener servicios" });
}
};

const getServiceById = async (req, res) => {
try {
    const service = await servicesModel.getById(req.params.id);
    if (!service)
    return res.status(404).json({ ok: false, message: "Servicio no encontrado" });
    res.json({ ok: true, data: service });
} catch (error) {
    console.error("getServiceById:", error);
    res.status(500).json({ ok: false, message: "Error al obtener el servicio" });
}
};

const createService = async (req, res) => {
try {
    const { nombre, descripcion, categoriaId, duracion, precio, imagenServicio } = req.body;

    if (!nombre || !categoriaId)
    return res.status(400).json({ ok: false, message: "nombre y categoriaId son requeridos" });

    const service = await servicesModel.create({
    nombre,
    descripcion,
    categoriaId,
    duracion,
    precio,
    imagenServicio,
    });
    res.status(201).json({ ok: true, data: service });
} catch (error) {
    console.error("createService:", error);
    res.status(500).json({ ok: false, message: "Error al crear el servicio" });
}
};

const updateService = async (req, res) => {
try {
    const { nombre, descripcion, categoriaId, duracion, precio, imagenServicio, estado } = req.body;

    if (!nombre || !categoriaId)
    return res.status(400).json({ ok: false, message: "nombre y categoriaId son requeridos" });

    const service = await servicesModel.update(req.params.id, {
    nombre,
    descripcion,
    categoriaId,
    duracion,
    precio,
    imagenServicio,
    estado,
    });
    res.json({ ok: true, data: service });
} catch (error) {
    if (error.code === "P2025")
    return res.status(404).json({ ok: false, message: "Servicio no encontrado" });
    console.error("updateService:", error);
    res.status(500).json({ ok: false, message: "Error al actualizar el servicio" });
}
};

const deactivateService = async (req, res) => {
try {
    await servicesModel.deactivate(req.params.id);
    res.json({ ok: true, message: "Servicio desactivado correctamente" });
} catch (error) {
    if (error.code === "P2025")
    return res.status(404).json({ ok: false, message: "Servicio no encontrado" });
    console.error("deactivateService:", error);
    res.status(500).json({ ok: false, message: "Error al desactivar el servicio" });
}
};

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────

const getAllCategories = async (req, res) => {
try {
    const categories = await categoriesModel.getAll();
    res.json({ ok: true, data: categories });
} catch (error) {
    console.error("getAllCategories:", error);
    res.status(500).json({ ok: false, message: "Error al obtener categorías" });
}
};

const getCategoryById = async (req, res) => {
try {
    const category = await categoriesModel.getById(req.params.id);
    if (!category)
    return res.status(404).json({ ok: false, message: "Categoría no encontrada" });
    res.json({ ok: true, data: category });
} catch (error) {
    console.error("getCategoryById:", error);
    res.status(500).json({ ok: false, message: "Error al obtener la categoría" });
}
};

const createCategory = async (req, res) => {
try {
    const { nombre, descripcion, color } = req.body;

    if (!nombre)
    return res.status(400).json({ ok: false, message: "nombre es requerido" });

    const category = await categoriesModel.create({ nombre, descripcion, color });
    res.status(201).json({ ok: true, data: category });
} catch (error) {
    console.error("createCategory:", error);
    res.status(500).json({ ok: false, message: "Error al crear la categoría" });
}
};

const updateCategory = async (req, res) => {
try {
    const { nombre, descripcion, color, estado } = req.body;

    if (!nombre)
    return res.status(400).json({ ok: false, message: "nombre es requerido" });

    const category = await categoriesModel.update(req.params.id, {
    nombre,
    descripcion,
    color,
    estado,
    });
    res.json({ ok: true, data: category });
} catch (error) {
    if (error.code === "P2025")
    return res.status(404).json({ ok: false, message: "Categoría no encontrada" });
    console.error("updateCategory:", error);
    res.status(500).json({ ok: false, message: "Error al actualizar la categoría" });
}
};

const deactivateCategory = async (req, res) => {
try {
    await categoriesModel.deactivate(req.params.id);
    res.json({ ok: true, message: "Categoría desactivada correctamente" });
} catch (error) {
    if (error.code === "P2025")
    return res.status(404).json({ ok: false, message: "Categoría no encontrada" });
    console.error("deactivateCategory:", error);
    res.status(500).json({ ok: false, message: "Error al desactivar la categoría" });
}
};

module.exports = {
// Servicios
getAllServices,
getServiceById,
createService,
updateService,
deactivateService,
// Categorías
getAllCategories,
getCategoryById,
createCategory,
updateCategory,
deactivateCategory,
};