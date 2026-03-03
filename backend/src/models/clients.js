// src/models/clients.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

function formatClient(c) {
  return {
    id:               c.id,
    firstName:        c.nombre,
    lastName:         c.apellido,
    name:             `${c.nombre} ${c.apellido}`,
    email:            c.correo    ?? "",
    phone:            c.telefono  ?? "",
    address:          c.direccion ?? "",
    tipo_documento:   c.tipoDocumento   ?? "",
    numero_documento: c.numeroDocumento ?? "",
    image:            c.fotoPerfil ?? "",
    isActive:         c.estado === "Activo",
    totalVisits: 0,
    totalSpent:  0,
    lastVisit:   "-",
  };
}

const getAll = async () => {
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: "asc" } });
  return clientes.map(formatClient);
};

const getById = async (id) => {
  const c = await prisma.cliente.findUnique({ where: { id: Number(id) } });
  return c ? formatClient(c) : null;
};

const create = async ({ firstName, lastName, documentType, document,
                        email, phone, address, image }) => {
  // Crear Usuario + Cliente en transacción (igual que empleados)
  return prisma.$transaction(async (tx) => {
    // Verificar si ya existe un usuario con ese correo
    const existente = await tx.usuario.findUnique({ where: { correo: email } });
    if (existente) {
      throw new Error(`Ya existe un usuario registrado con el correo ${email}`);
    }

    const hashed = await bcrypt.hash(document ?? "cliente123", 10);

    const usuario = await tx.usuario.create({
      data: {
        correo:     email,
        contrasena: hashed,
        estado:     "Activo",
        rolId:      3, // rol Cliente
      },
    });

    const cliente = await tx.cliente.create({
      data: {
        nombre:          firstName,
        apellido:        lastName,
        tipoDocumento:   documentType ?? null,
        numeroDocumento: document     ?? null,
        correo:          email        ?? null,
        telefono:        phone        ?? null,
        direccion:       address      ?? null,
        fotoPerfil:      image        ?? "",
        estado:          "Activo",
        usuarioId:       usuario.id,
      },
    });

    return formatClient(cliente);
  });
};

const update = async (id, { firstName, lastName, documentType, document,
                              email, phone, address, image, estado }) => {
  const c = await prisma.cliente.update({
    where: { id: Number(id) },
    data: {
      nombre:          firstName,
      apellido:        lastName,
      tipoDocumento:   documentType ?? null,
      numeroDocumento: document     ?? null,
      correo:          email        ?? null,
      telefono:        phone        ?? null,
      direccion:       address      ?? null,
      fotoPerfil:      image        ?? "",
      estado:          estado       ?? "Activo",
    },
  });
  return formatClient(c);
};

const setStatus = async (id, isActive) => {
  return prisma.cliente.update({
    where: { id: Number(id) },
    data:  { estado: isActive ? "Activo" : "Inactivo" },
  });
};

const deactivate = async (id) => setStatus(id, false);

module.exports = { getAll, getById, create, update, setStatus, deactivate };