const salesModel = require("../models/sales");

const getAll = async (req, res) => {
  try { res.json(await salesModel.getAll()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getAvailableAppointments = async (req, res) => {
  try { res.json(await salesModel.getAvailableAppointments()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  try {
    const id = await salesModel.create(req.body);
    res.status(201).json({ ok: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    await salesModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getAvailableAppointments, create, remove };