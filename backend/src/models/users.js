const express = require("express");
const router = express.Router();
const { pool, sql } = require("../config/db");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────────────────────────────────────
// GET /users — Lista todos los usuarios con datos personales
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT
        u.PK_id_usuario                         AS id,
        u.Correo                                AS email,
        u.Estado                                AS estado,
        r.nombre                                AS rol,
        r.PK_id_rol                             AS rolId,

        -- Datos de Empleado (si existe)
        e.PK_id_empleado                        AS empleadoId,
        e.nombre                                AS empNombre,
        e.apellido                              AS empApellido,
        e.tipo_documento                        AS empTipoDoc,
        e.numero_documento                      AS empNumDoc,
        e.telefono                              AS empTelefono,
        e.especialidad                          AS empEspecialidad,
        e.foto_perfil                           AS empFoto,

        -- Datos de Cliente (si existe)
        c.PK_id_cliente                         AS clienteId,
        c.nombre                                AS cliNombre,
        c.apellido                              AS cliApellido,
        c.tipo_documento                        AS cliTipoDoc,
        c.numero_documento                      AS cliNumDoc,
        c.telefono                              AS cliTelefono,
        c.foto_perfil                           AS cliFoto
      FROM Usuarios u
      JOIN Roles r ON r.PK_id_rol = u.FK_id_rol
      LEFT JOIN Empleado e ON e.fk_id_usuario = u.PK_id_usuario
      LEFT JOIN Cliente  c ON c.fk_id_usuario  = u.PK_id_usuario
      ORDER BY u.PK_id_usuario DESC
    `);

    const users = result.recordset.map(row => {
      const isEmpleado = !!row.empleadoId;
      const nombre   = isEmpleado ? row.empNombre   : row.cliNombre;
      const apellido = isEmpleado ? row.empApellido : row.cliApellido;
      return {
        id:               row.id,
        email:            row.email,
        name:             `${nombre ?? ""} ${apellido ?? ""}`.trim() || row.email,
        firstName:        nombre   ?? "",
        lastName:         apellido ?? "",
        phone:            (isEmpleado ? row.empTelefono  : row.cliTelefono)  ?? "",
        documentType:     (isEmpleado ? row.empTipoDoc   : row.cliTipoDoc)   ?? "",
        document:         (isEmpleado ? row.empNumDoc    : row.cliNumDoc)    ?? "",
        role:             row.rol,
        rolId:            row.rolId,
        specialty:        row.empEspecialidad ?? "",
        photo:            (isEmpleado ? row.empFoto : row.cliFoto) ?? "",
        isActive:         row.estado === "Activo",
        createdAt:        "",
        lastLogin:        "-",
        assignedServices: [],
      };
    });

    res.json(users);
  } catch (err) {
    console.error("Error GET /users:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /users/roles — Lista roles disponibles
// ─────────────────────────────────────────────────────────────────────────────
router.get("/roles", async (req, res) => {
  try {
    const connection = await pool;
    const result = await connection.request().query(
      `SELECT PK_id_rol AS id, nombre FROM Roles ORDER BY nombre`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error GET /users/roles:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /users — Crear usuario + perfil (Empleado o Cliente según rol)
// Body: { firstName, lastName, documentType, document, email, phone, role (nombre), password }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { firstName, lastName, documentType, document, email, phone, role, password = "Highlife2024*" } = req.body;

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ error: "Nombre, apellido, email y rol son requeridos" });
  }

  try {
    const connection = await pool;

    // Buscar id del rol
    const rolResult = await connection.request()
      .input("nombre", sql.VarChar(100), role)
      .query(`SELECT PK_id_rol FROM Roles WHERE nombre = @nombre`);

    if (rolResult.recordset.length === 0)
      return res.status(400).json({ error: `Rol '${role}' no encontrado` });

    const rolId = rolResult.recordset[0].PK_id_rol;

    // Hash de contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar en Usuarios
    const usuResult = await connection.request()
      .input("correo",    sql.VarChar(100), email)
      .input("contrasena",sql.VarChar(256), hash)
      .input("rolId",     sql.Int,          rolId)
      .query(`
        INSERT INTO Usuarios (Correo, Contrasena, Estado, FK_id_rol)
        OUTPUT INSERTED.PK_id_usuario
        VALUES (@correo, @contrasena, 'Activo', @rolId)
      `);

    const usuId = usuResult.recordset[0].PK_id_usuario;

    // Insertar en Empleado o Cliente según rol
    const esCliente = role.toLowerCase() === "cliente";
    if (esCliente) {
      await connection.request()
        .input("nombre",    sql.VarChar(100), firstName)
        .input("apellido",  sql.VarChar(100), lastName)
        .input("tipoDoc",   sql.VarChar(30),  documentType || null)
        .input("numDoc",    sql.VarChar(20),  document     || null)
        .input("correo",    sql.VarChar(100), email)
        .input("telefono",  sql.VarChar(20),  phone        || null)
        .input("usuId",     sql.Int,          usuId)
        .query(`
          INSERT INTO Cliente (nombre, apellido, tipo_documento, numero_documento, correo, telefono, foto_perfil, Estado, fk_id_usuario)
          VALUES (@nombre, @apellido, @tipoDoc, @numDoc, @correo, @telefono, '', 'Activo', @usuId)
        `);
    } else {
      await connection.request()
        .input("nombre",    sql.VarChar(100), firstName)
        .input("apellido",  sql.VarChar(100), lastName)
        .input("tipoDoc",   sql.VarChar(30),  documentType || null)
        .input("numDoc",    sql.VarChar(20),  document     || null)
        .input("correo",    sql.VarChar(100), email)
        .input("telefono",  sql.VarChar(20),  phone        || null)
        .input("usuId",     sql.Int,          usuId)
        .query(`
          INSERT INTO Empleado (nombre, apellido, tipo_documento, numero_documento, correo, telefono, foto_perfil, Estado, fk_id_usuario)
          VALUES (@nombre, @apellido, @tipoDoc, @numDoc, @correo, @telefono, '', 'Activo', @usuId)
        `);
    }

    res.status(201).json({ ok: true, id: usuId });
  } catch (err) {
    console.error("Error POST /users:", err);
    if (err.message?.includes("UNIQUE") || err.number === 2627)
      return res.status(400).json({ error: "El correo ya está registrado" });
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /users/:id — Actualizar datos personales y rol
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { firstName, lastName, documentType, document, email, phone, role } = req.body;
  const usuId = Number(req.params.id);

  try {
    const connection = await pool;

    // Actualizar email/rol en Usuarios
    if (role) {
      const rolResult = await connection.request()
        .input("nombre", sql.VarChar(100), role)
        .query(`SELECT PK_id_rol FROM Roles WHERE nombre = @nombre`);

      if (rolResult.recordset.length > 0) {
        const rolId = rolResult.recordset[0].PK_id_rol;
        await connection.request()
          .input("id",     sql.Int,          usuId)
          .input("correo", sql.VarChar(100), email)
          .input("rolId",  sql.Int,          rolId)
          .query(`UPDATE Usuarios SET Correo = @correo, FK_id_rol = @rolId WHERE PK_id_usuario = @id`);
      }
    }

    // Actualizar Empleado si existe
    await connection.request()
      .input("id",       sql.Int,         usuId)
      .input("nombre",   sql.VarChar(100),firstName  || "")
      .input("apellido", sql.VarChar(100),lastName   || "")
      .input("tipoDoc",  sql.VarChar(30), documentType || null)
      .input("numDoc",   sql.VarChar(20), document     || null)
      .input("correo",   sql.VarChar(100),email        || "")
      .input("telefono", sql.VarChar(20), phone        || null)
      .query(`
        UPDATE Empleado SET
          nombre = @nombre, apellido = @apellido,
          tipo_documento = @tipoDoc, numero_documento = @numDoc,
          correo = @correo, telefono = @telefono
        WHERE fk_id_usuario = @id
      `);

    // Actualizar Cliente si existe
    await connection.request()
      .input("id",       sql.Int,         usuId)
      .input("nombre",   sql.VarChar(100),firstName  || "")
      .input("apellido", sql.VarChar(100),lastName   || "")
      .input("tipoDoc",  sql.VarChar(30), documentType || null)
      .input("numDoc",   sql.VarChar(20), document     || null)
      .input("correo",   sql.VarChar(100),email        || "")
      .input("telefono", sql.VarChar(20), phone        || null)
      .query(`
        UPDATE Cliente SET
          nombre = @nombre, apellido = @apellido,
          tipo_documento = @tipoDoc, numero_documento = @numDoc,
          correo = @correo, telefono = @telefono
        WHERE fk_id_usuario = @id
      `);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error PUT /users/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /users/:id/status — Activar / desactivar usuario
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  const { isActive } = req.body;
  const estado = isActive ? "Activo" : "Inactivo";

  try {
    const connection = await pool;
    await connection.request()
      .input("id",     sql.Int,         Number(req.params.id))
      .input("estado", sql.VarChar(30), estado)
      .query(`UPDATE Usuarios SET Estado = @estado WHERE PK_id_usuario = @id`);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error PATCH /users/:id/status:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /users/:id — Eliminar usuario y su perfil
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const usuId = Number(req.params.id);
  try {
    const connection = await pool;
    // Borrar perfiles primero (FK)
    await connection.request().input("id", sql.Int, usuId)
      .query(`DELETE FROM Empleado WHERE fk_id_usuario = @id`);
    await connection.request().input("id", sql.Int, usuId)
      .query(`DELETE FROM Cliente WHERE fk_id_usuario = @id`);
    await connection.request().input("id", sql.Int, usuId)
      .query(`DELETE FROM Usuarios WHERE PK_id_usuario = @id`);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /users/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;