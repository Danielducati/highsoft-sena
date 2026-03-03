// src/controllers/employees.controller.js
const employeesModel = require("../models/employees");

const getAll = async (req, res) => {
try {
    const data = await employeesModel.getAll();
    res.json(data);
} catch (err) {
    res.status(500).json({ error: err.message });
}
};

const getOne = async (req, res) => {
try {
    const data = await employeesModel.getById(req.params.id);
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

    if (!nombre || !apellido || !correo)
    return res.status(400).json({ error: "Nombre, apellido y correo son requeridos" });

    const data = await employeesModel.create({
    nombre, apellido,
    tipoDocumento:   tipo_documento,
    numeroDocumento: numero_documento,
    correo, telefono, ciudad, especialidad, direccion,
    fotoPerfil: foto_perfil,
    contrasena, idRol: id_rol,
    });
    res.status(201).json({ mensaje: "Empleado creado exitosamente", id: data.id });
} catch (err) {
    if (err.code === "P2002") // unique constraint (correo duplicado)
    return res.status(409).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: err.message });
}
};

const update = async (req, res) => {
try {
    const { nombre, apellido, tipo_documento, numero_documento, correo,
            telefono, ciudad, especialidad, direccion, foto_perfil, Estado } = req.body;

    await employeesModel.update(req.params.id, {
    nombre, apellido,
    tipoDocumento:   tipo_documento,
    numeroDocumento: numero_documento,
    correo, telefono, ciudad, especialidad, direccion,
    fotoPerfil: foto_perfil,
    estado: Estado,
    });
    res.json({ mensaje: "Empleado actualizado exitosamente" });
} catch (err) {
    res.status(500).json({ error: err.message });
}
};

const remove = async (req, res) => {
try {
    await employeesModel.deactivate(req.params.id);
    res.json({ mensaje: "Empleado desactivado exitosamente" });
} catch (err) {
    res.status(500).json({ error: err.message });
}
};

module.exports = { getAll, getOne, create, update, remove };