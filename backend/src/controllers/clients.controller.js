const clientsModel = require("../models/clients");

const getAll = async (req, res) => {
  try { res.json(await clientsModel.getAll()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const data = await clientsModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  try {
    const { firstName, lastName, documentType, document, email, phone, address, image } = req.body;
    if (!firstName || !lastName || !email)
      return res.status(400).json({ error: "Nombre, apellido y correo son requeridos" });
    const data = await clientsModel.create({ firstName, lastName, documentType, document, email, phone, address, image });
    res.status(201).json({ ok: true, id: data.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const update = async (req, res) => {
  try {
    await clientsModel.update(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const setStatus = async (req, res) => {
  try {
    await clientsModel.setStatus(req.params.id, req.body.isActive);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    await clientsModel.deactivate(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getOne, create, update, setStatus, remove };