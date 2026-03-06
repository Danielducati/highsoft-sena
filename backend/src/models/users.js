// src/models/users.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// ── Helpers ───────────────────────────────────────────────────
function formatUser(u) {
  const isEmpleado = !!u.empleado;
  const perfil     = isEmpleado ? u.empleado : u.cliente;

  return {
    id:               u.id,
    email:            u.correo,
    name:             perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : u.correo,
    firstName:        perfil?.nombre        ?? "",
    lastName:         perfil?.apellido      ?? "",
    phone:            perfil?.telefono      ?? "",
    documentType:     isEmpleado ? (u.empleado?.tipoDocumento  ?? "") : (u.cliente?.tipoDocumento  ?? ""),
    document:         isEmpleado ? (u.empleado?.numeroDocumento ?? "") : (u.cliente?.numeroDocumento ?? ""),
    role:             u.rol?.nombre         ?? "",
    rolId:            u.rolId,
    specialty:        u.empleado?.especialidad ?? "",
    photo:            perfil?.fotoPerfil    ?? "",
    isActive:         u.estado === "Activo",
    estado:           u.estado,
    createdAt:        "",
    lastLogin:        "-",
    assignedServices: [],
  };
}

// ── Queries ───────────────────────────────────────────────────
const getAll = async () => {
  const usuarios = await prisma.usuario.findMany({
    include: {
      rol:      true,
      empleado: true,
      cliente:  true,
    },
    orderBy: { id: "desc" },
  });
  return usuarios.map(formatUser);
};

const getById = async (id) => {
  const u = await prisma.usuario.findUnique({
    where:   { id: Number(id) },
    include: { rol: true, empleado: true, cliente: true },
  });
  return u ? formatUser(u) : null;
};

const getRoles = async () => {
  return prisma.rol.findMany({
    where:   { estado: "Activo" },
    orderBy: { nombre: "asc" },
    select:  { id: true, nombre: true },
  });
};

const create = async ({ firstName, lastName, documentType, document, email, phone, role, password = "Highlife2024*" }) => {
  const rolFound = await prisma.rol.findFirst({ where: { nombre: role } });
  if (!rolFound) throw new Error(`Rol '${role}' no encontrado`);

  const hash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        correo:     email,
        contrasena: hash,
        estado:     "Activo",
        rolId:      rolFound.id,
      },
    });

    const esCliente = role.toLowerCase() === "cliente";

    if (esCliente) {
      await tx.cliente.create({
        data: {
          nombre:          firstName,
          apellido:        lastName,
          tipoDocumento:   documentType ?? null,
          numeroDocumento: document     ?? null,
          correo:          email,
          telefono:        phone        ?? null,
          fotoPerfil:      "",
          estado:          "Activo",
          usuarioId:       usuario.id,
        },
      });
    } else {
      await tx.empleado.create({
        data: {
          nombre:          firstName,
          apellido:        lastName,
          tipoDocumento:   documentType ?? null,
          numeroDocumento: document     ?? null,
          correo:          email,
          telefono:        phone        ?? null,
          fotoPerfil:      null,
          estado:          "Activo",
          usuarioId:       usuario.id,
        },
      });
    }

    return { ok: true, id: usuario.id };
  });
};

const update = async (id, { firstName, lastName, documentType, document, email, phone, role }) => {
  return prisma.$transaction(async (tx) => {
    // Actualizar rol si viene
    if (role) {
      const rolFound = await tx.rol.findFirst({ where: { nombre: role } });
      if (rolFound) {
        await tx.usuario.update({
          where: { id: Number(id) },
          data:  { correo: email, rolId: rolFound.id },
        });
      }
    }

    const data = {
      nombre:          firstName    || "",
      apellido:        lastName     || "",
      tipoDocumento:   documentType ?? null,
      numeroDocumento: document     ?? null,
      correo:          email        || "",
      telefono:        phone        ?? null,
    };

    // Actualizar empleado si existe
    const empleado = await tx.empleado.findFirst({ where: { usuarioId: Number(id) } });
    if (empleado) await tx.empleado.update({ where: { id: empleado.id }, data });

    // Actualizar cliente si existe
    const cliente = await tx.cliente.findFirst({ where: { usuarioId: Number(id) } });
    if (cliente) await tx.cliente.update({ where: { id: cliente.id }, data });

    return { ok: true };
  });
};

const updateStatus = async (id, isActive) => {
  return prisma.usuario.update({
    where: { id: Number(id) },
    data:  { estado: isActive ? "Activo" : "Inactivo" },
  });
};

const remove = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.empleado.deleteMany({ where: { usuarioId: Number(id) } });
    await tx.cliente.deleteMany({  where: { usuarioId: Number(id) } });
    await tx.usuario.delete({      where: { id: Number(id) } });
    return { ok: true };
  });
};

module.exports = { getAll, getById, getRoles, create, update, updateStatus, remove };