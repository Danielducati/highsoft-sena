// src/controllers/sales.controller.js
const salesModel = require("../models/sales");

const getAll = async (req, res) => {
  try {
    res.json(await salesModel.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const data = await salesModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAvailableAppointments = async (req, res) => {
  try {
    res.json(await salesModel.getAvailableAppointments());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    // Acepta tanto camelCase (nuevo) como snake_case (legacy)
    const {
      tipo,
      clienteId,
      clienteNombre,
      citaId,     id_cita,       // ambas formas
      servicios,
      descuento,
      metodoPago, metodo_pago,   // ambas formas
    } = req.body;

    const id = await salesModel.create({
      tipo,
      clienteId,
      clienteNombre,
      citaId:     citaId     ?? id_cita,
      servicios,
      descuento:  descuento  ?? 0,
      metodoPago: metodoPago ?? metodo_pago ?? null,
    });

    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("Error crear venta:", err);
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await salesModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, getAvailableAppointments, create, remove };