// src/models/categories.js
const prisma = require("../config/prisma");

function formatCategoria(c) {
return {
    id:          c.id,
    Nombre:      c.nombre,
    descripcion: c.descripcion ?? "",
    color:       c.color       ?? "",
    Estado:      c.estado      ?? "Activo",
};
}

const getAll = async () => {
const data = await prisma.categoriaServicio.findMany({ orderBy: { nombre: "asc" } });
return data.map(formatCategoria);
};

const getById = async (id) => {
const c = await prisma.categoriaServicio.findUnique({ where: { id: Number(id) } });
return c ? formatCategoria(c) : null;
};

const create = async ({ Nombre, descripcion, color, Estado = "Activo" }) => {
const c = await prisma.categoriaServicio.create({
    data: { nombre: Nombre, descripcion, color, estado: Estado },
});
return formatCategoria(c);
};

const update = async (id, { Nombre, descripcion, color, Estado }) => {
const c = await prisma.categoriaServicio.update({
    where: { id: Number(id) },
    data:  { nombre: Nombre, descripcion, color, estado: Estado },
});
return formatCategoria(c);
};

const deactivate = async (id) => {
const c = await prisma.categoriaServicio.update({
    where: { id: Number(id) },
    data:  { estado: "Inactivo" },
});
return formatCategoria(c);
};

module.exports = { getAll, getById, create, update, deactivate };