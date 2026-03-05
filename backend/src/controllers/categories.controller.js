const model = require("../models/categories");

const getAll = async (req, res) => {
try { res.json(await model.getAll()); }
catch (err) { res.status(500).json({ error: err.message }); }
};

const getOne = async (req, res) => {
try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(data);
} catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
const { Nombre } = req.body;
if (!Nombre) return res.status(400).json({ error: "El nombre es obligatorio" });
try {
    const data = await model.create(req.body);
    res.status(201).json(data);
} catch (err) { res.status(500).json({ error: err.message }); }
};

const update = async (req, res) => {
try {
    const data = await model.update(req.params.id, req.body);
    res.json(data);
} catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async (req, res) => {
try {
    const data = await model.deactivate(req.params.id);
    res.json({ mensaje: "Categoría desactivada correctamente", data });
} catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getOne, create, update, remove };