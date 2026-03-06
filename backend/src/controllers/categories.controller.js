const categoriesModel = require("../models/categories");

const getAllCategories = async (req, res) => {
try {
    const soloActivos = req.query.all !== "true";
    res.json(await categoriesModel.getAll({ soloActivos }));
} catch (err) {
    console.error("Error GET /categories:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
}
};

const getCategoryById = async (req, res) => {
try {
    const cat = await categoriesModel.getById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(cat);
} catch (err) {
    console.error("Error GET /categories/:id:", err);
    res.status(500).json({ error: "Error al obtener la categoría" });
}
};

const createCategory = async (req, res) => {
try {
    const { nombre, descripcion, color } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    const cat = await categoriesModel.create({ nombre, descripcion, color });
    res.status(201).json(cat);
} catch (err) {
    console.error("Error POST /categories:", err);
    res.status(500).json({ error: "Error al crear la categoría" });
}
};

const updateCategory = async (req, res) => {
try {
    const { nombre, descripcion, color, estado } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    const cat = await categoriesModel.update(req.params.id, { nombre, descripcion, color, estado });
    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(cat);
} catch (err) {
    if (err.code === "P2025")
    return res.status(404).json({ error: "Categoría no encontrada" });
    console.error("Error PUT /categories/:id:", err);
    res.status(500).json({ error: "Error al actualizar la categoría" });
}
};

const deactivateCategory = async (req, res) => {
try {
    await categoriesModel.deactivate(req.params.id);
    res.json({ mensaje: "Categoría desactivada correctamente" });
} catch (err) {
    if (err.code === "P2025")
    return res.status(404).json({ error: "Categoría no encontrada" });
    console.error("Error DELETE /categories/:id:", err);
    res.status(500).json({ error: "Error al desactivar la categoría" });
}
};

module.exports = {
getAllCategories, getCategoryById,
createCategory, updateCategory, deactivateCategory,
};