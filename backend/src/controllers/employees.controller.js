// src/controllers/employees.controller.js
const employeesModel = require("../models/employees");

const getAll = async (req, res) => {
  try {
    const soloActivos = req.query.all !== "true";
    const data = await employeesModel.getAll({ soloActivos });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID inválido" });

    const data = await employeesModel.getById(id);
    if (!data) return res.status(404).json({ error: "Empleado no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, apellido, tipo_documento, numero_documento, correo,
            telefono, ciudad, especialidad, direccion, foto_perfil,
            contrasena, id_rol } = req.body;

    // Campos obligatorios
    if (!nombre || nombre.trim() === "")
      return res.status(400).json({ error: "El nombre es obligatorio" });

    if (!apellido || apellido.trim() === "")
      return res.status(400).json({ error: "El apellido es obligatorio" });

    if (!correo || correo.trim() === "")
      return res.status(400).json({ error: "El correo es obligatorio" });

    // Formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo))
      return res.status(400).json({ error: "El correo no tiene un formato válido" });

    // Longitudes
    if (nombre.trim().length > 100)
      return res.status(400).json({ error: "El nombre no puede superar 100 caracteres" });

    if (apellido.trim().length > 100)
      return res.status(400).json({ error: "El apellido no puede superar 100 caracteres" });

    if (telefono && !/^\d{7,15}$/.test(telefono.replace(/\s/g, "")))
      return res.status(400).json({ error: "El teléfono debe tener entre 7 y 15 dígitos" });

    const TIPOS_DOC = ["CC", "CE", "TI", "Pasaporte", "NIT"];
    if (tipo_documento && !TIPOS_DOC.includes(tipo_documento))
      return res.status(400).json({ error: `Tipo de documento inválido. Valores permitidos: ${TIPOS_DOC.join(", ")}` });

    const data = await employeesModel.create({
      nombre:          nombre.trim(),
      apellido:        apellido.trim(),
      tipoDocumento:   tipo_documento   ?? null,
      numeroDocumento: numero_documento ?? null,
      correo:          correo.trim().toLowerCase(),
      telefono:        telefono         ?? null,
      ciudad:          ciudad           ?? null,
      especialidad:    especialidad     ?? null,
      direccion:       direccion        ?? null,
      fotoPerfil:      foto_perfil      ?? null,
      contrasena,
      idRol:           id_rol           ?? null,
    });

    res.status(201).json({ mensaje: "Empleado creado exitosamente", id: data.id });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID inválido" });

    const { nombre, apellido, tipo_documento, numero_documento, correo,
            telefono, ciudad, especialidad, direccion, foto_perfil, Estado } = req.body;

    if (nombre !== undefined && nombre.trim() === "")
      return res.status(400).json({ error: "El nombre no puede estar vacío" });

    if (apellido !== undefined && apellido.trim() === "")
      return res.status(400).json({ error: "El apellido no puede estar vacío" });

    if (correo !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo))
        return res.status(400).json({ error: "El correo no tiene un formato válido" });
    }

    if (telefono && !/^\d{7,15}$/.test(telefono.replace(/\s/g, "")))
      return res.status(400).json({ error: "El teléfono debe tener entre 7 y 15 dígitos" });

    const ESTADOS_VALIDOS = ["Activo", "Inactivo"];
    if (Estado && !ESTADOS_VALIDOS.includes(Estado))
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}` });

    await employeesModel.update(id, {
      nombre:          nombre?.trim(),
      apellido:        apellido?.trim(),
      tipoDocumento:   tipo_documento   ?? null,
      numeroDocumento: numero_documento ?? null,
      correo:          correo?.trim().toLowerCase(),
      telefono:        telefono         ?? null,
      ciudad:          ciudad           ?? null,
      especialidad:    especialidad     ?? null,
      direccion:       direccion        ?? null,
      fotoPerfil:      foto_perfil      ?? null,
      estado:          Estado,
    });

    res.json({ mensaje: "Empleado actualizado exitosamente" });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Empleado no encontrado" });
    if (err.code === "P2002")
      return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID inválido" });

    await employeesModel.deactivate(id);
    res.json({ mensaje: "Empleado desactivado exitosamente" });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Empleado no encontrado" });
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };