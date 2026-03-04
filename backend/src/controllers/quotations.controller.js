// src/controllers/quotations.controller.js
const quotationsModel = require("../models/quotations");

const getAll = async (req, res) => {
  try {
    res.json(await quotationsModel.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const data = await quotationsModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Cotización no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { id_cliente, fecha, hora_inicio, notas, descuento, servicios } = req.body;

    if (!id_cliente || !servicios || servicios.length === 0)
      return res.status(400).json({ error: "Cliente y al menos un servicio son requeridos" });

    const id = await quotationsModel.create({
      clienteId:  id_cliente,
      fecha,
      horaInicio: hora_inicio,
      notas,
      descuento:  descuento ?? 0,
      servicios,
    });

    res.status(201).json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id_cliente, fecha, hora_inicio, notas, descuento, servicios } = req.body;

    if (!servicios || servicios.length === 0)
      return res.status(400).json({ error: "Al menos un servicio es requerido" });

    await quotationsModel.update(req.params.id, {
      clienteId:  id_cliente,
      fecha,
      horaInicio: hora_inicio,
      notas,
      descuento:  descuento ?? 0,
      servicios,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: "Estado es requerido" });
    await quotationsModel.updateEstado(req.params.id, estado);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, updateEstado };