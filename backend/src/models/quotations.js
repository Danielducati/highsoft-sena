const express = require("express");
const router = express.Router();
const { pool, sql } = require("../config/db");
const { verificarToken } = require("./auth");

// Mapa de estados frontend → BD
const ESTADO_MAP = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    cancelled: "Cancelada",
    expired: "Expirada",
    };

    const ESTADO_MAP_REVERSE = {
    Pendiente: "pending",
    Aprobada: "approved",
    Rechazada: "rejected",
    Cancelada: "cancelled",
    Expirada: "expired",
    };

    // ==========================================
    // GET → OBTENER TODAS LAS COTIZACIONES
    // ==========================================
    router.get("/", async (req, res) => {
    try {
        const connection = await pool;

        const result = await connection.request().query(`
        SELECT 
            ce.PK_id_cotizacion AS id,
            ce.FK_id_cliente,
            c.nombre + ' ' + c.apellido AS clientName,
            c.correo AS clientEmail,
            ce.Fecha AS date,
            ce.Valor AS valor,
            ce.Iva AS iva,
            ce.Subtotal AS subtotal,
            ce.Descuento AS discount,
            ce.TOTAL AS total,
            ce.Notas AS notes,
            ce.Hora_inicio AS startTime,
            ce.Estado AS estado
        FROM Cotizacion_encabezado ce
        LEFT JOIN Cliente c ON ce.FK_id_cliente = c.PK_id_cliente
        ORDER BY ce.Fecha DESC
        `);

        // Para cada cotización obtener sus detalles
        const cotizaciones = await Promise.all(result.recordset.map(async (cot) => {
        const detalles = await connection.request()
            .input("id", sql.Int, cot.id)
            .query(`
            SELECT 
                dc.PK_id_detalle_cotizacion,
                dc.FK_id_servicio AS serviceId,
                s.nombre AS serviceName,
                dc.Precio AS price,
                dc.Cantidad AS quantity
            FROM Detalle_cotizacion dc
            JOIN Servicio s ON dc.FK_id_servicio = s.PK_id_servicio
            WHERE dc.FK_id_cotizacion = @id
            `);

        return {
            ...cot,
            status: ESTADO_MAP_REVERSE[cot.estado] || "pending",
            items: detalles.recordset,
        };
        }));

        res.json(cotizaciones);

    } catch (error) {
        console.error("ERROR cotizaciones:", error);
        res.status(500).json({ error: "Error al obtener cotizaciones" });
    }
    });


    // ==========================================
    // GET → OBTENER UNA COTIZACIÓN POR ID
    // ==========================================
    router.get("/:id", async (req, res) => {
    try {
        const connection = await pool;

        const result = await connection.request()
        .input("id", sql.Int, req.params.id)
        .query(`
            SELECT 
            ce.PK_id_cotizacion AS id,
            ce.FK_id_cliente,
            c.nombre + ' ' + c.apellido AS clientName,
            c.correo AS clientEmail,
            ce.Fecha AS date,
            ce.Subtotal AS subtotal,
            ce.Descuento AS discount,
            ce.TOTAL AS total,
            ce.Notas AS notes,
            ce.Hora_inicio AS startTime,
            ce.Estado AS estado
            FROM Cotizacion_encabezado ce
            LEFT JOIN Cliente c ON ce.FK_id_cliente = c.PK_id_cliente
            WHERE ce.PK_id_cotizacion = @id
        `);

        if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Cotización no encontrada" });
        }

        const cot = result.recordset[0];

        const detalles = await connection.request()
        .input("id", sql.Int, cot.id)
        .query(`
            SELECT 
            dc.FK_id_servicio AS serviceId,
            s.nombre AS serviceName,
            dc.Precio AS price,
            dc.Cantidad AS quantity
            FROM Detalle_cotizacion dc
            JOIN Servicio s ON dc.FK_id_servicio = s.PK_id_servicio
            WHERE dc.FK_id_cotizacion = @id
        `);

        res.json({
        ...cot,
        status: ESTADO_MAP_REVERSE[cot.estado] || "pending",
        items: detalles.recordset,
        });

    } catch (error) {
        console.error("ERROR cotización:", error);
        res.status(500).json({ error: "Error al obtener cotización" });
    }
    });


    // ==========================================
    // POST → CREAR COTIZACIÓN
    // ==========================================
    router.post("/", verificarToken, async (req, res) => {
    try {
        const {
        id_cliente,
        fecha,
        hora_inicio,
        notas,
        descuento = 0,
        servicios, // [{ id_servicio, cantidad, precio }]
        } = req.body;

        if (!id_cliente || !servicios || servicios.length === 0) {
        return res.status(400).json({ error: "Cliente y al menos un servicio son requeridos" });
        }

        const connection = await pool;

        // Calcular totales
        const subtotal = servicios.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva - descuento;

        // Insertar encabezado
        const encabezado = await connection.request()
        .input("id_cliente", sql.Int, id_cliente)
        .input("id_usuario", sql.Int, req.usuario.id)
        .input("fecha", sql.Date, fecha || new Date())
        .input("hora_inicio", sql.VarChar(10), hora_inicio || null)
        .input("subtotal", sql.Decimal(12, 2), subtotal)
        .input("iva", sql.Decimal(12, 2), iva)
        .input("valor", sql.Decimal(12, 2), subtotal)
        .input("descuento", sql.Decimal(12, 2), descuento)
        .input("total", sql.Decimal(12, 2), total)
        .input("notas", sql.VarChar(500), notas || null)
        .query(`
            INSERT INTO Cotizacion_encabezado 
            (FK_id_cliente, FK_id_usuarios, Fecha, Hora_inicio, Subtotal, Iva, Valor, Descuento, TOTAL, Notas, Estado)
            OUTPUT INSERTED.*
            VALUES 
            (@id_cliente, @id_usuario, @fecha, @hora_inicio, @subtotal, @iva, @valor, @descuento, @total, @notas, 'Pendiente')
        `);

        const id_cotizacion = encabezado.recordset[0].PK_id_cotizacion;

        // Insertar detalles
        for (const servicio of servicios) {
        await connection.request()
            .input("id_cotizacion", sql.Int, id_cotizacion)
            .input("id_servicio", sql.Int, servicio.id_servicio)
            .input("precio", sql.Decimal(12, 2), servicio.precio)
            .input("cantidad", sql.Int, servicio.cantidad)
            .query(`
            INSERT INTO Detalle_cotizacion (FK_id_cotizacion, FK_id_servicio, Precio, Cantidad)
            VALUES (@id_cotizacion, @id_servicio, @precio, @cantidad)
            `);
        }

        res.status(201).json({ mensaje: "Cotización creada exitosamente", id: id_cotizacion });

    } catch (error) {
        console.error("ERROR crear cotización:", error);
        res.status(500).json({ error: "Error al crear cotización" });
    }
    });


    // ==========================================
    // PUT → ACTUALIZAR ESTADO DE COTIZACIÓN
    // ==========================================
    router.put("/:id/estado", verificarToken, async (req, res) => {
    try {
        const { estado } = req.body; // estado en formato frontend (pending, approved, etc.)
        const estadoBD = ESTADO_MAP[estado] || estado;

        const connection = await pool;

        const result = await connection.request()
        .input("id", sql.Int, req.params.id)
        .input("estado", sql.VarChar(30), estadoBD)
        .query(`
            UPDATE Cotizacion_encabezado
            SET Estado = @estado
            OUTPUT INSERTED.*
            WHERE PK_id_cotizacion = @id
        `);

        if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Cotización no encontrada" });
        }

        res.json({ mensaje: "Estado actualizado", data: result.recordset[0] });

    } catch (error) {
        console.error("ERROR actualizar estado:", error);
        res.status(500).json({ error: "Error al actualizar estado" });
    }
    });


    // ==========================================
    // PUT → ACTUALIZAR COTIZACIÓN COMPLETA
    // ==========================================
    router.put("/:id", verificarToken, async (req, res) => {
    try {
        const {
        id_cliente,
        fecha,
        hora_inicio,
        notas,
        descuento = 0,
        servicios,
        } = req.body;

        const connection = await pool;

        const subtotal = servicios.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva - descuento;

        await connection.request()
        .input("id", sql.Int, req.params.id)
        .input("id_cliente", sql.Int, id_cliente)
        .input("fecha", sql.Date, fecha)
        .input("hora_inicio", sql.VarChar(10), hora_inicio || null)
        .input("subtotal", sql.Decimal(12, 2), subtotal)
        .input("iva", sql.Decimal(12, 2), iva)
        .input("valor", sql.Decimal(12, 2), subtotal)
        .input("descuento", sql.Decimal(12, 2), descuento)
        .input("total", sql.Decimal(12, 2), total)
        .input("notas", sql.VarChar(500), notas || null)
        .query(`
            UPDATE Cotizacion_encabezado
            SET FK_id_cliente = @id_cliente, Fecha = @fecha, Hora_inicio = @hora_inicio,
                Subtotal = @subtotal, Iva = @iva, Valor = @valor,
                Descuento = @descuento, TOTAL = @total, Notas = @notas
            WHERE PK_id_cotizacion = @id
        `);

        // Eliminar detalles anteriores y reinsertar
        await connection.request()
        .input("id", sql.Int, req.params.id)
        .query(`DELETE FROM Detalle_cotizacion WHERE FK_id_cotizacion = @id`);

        for (const servicio of servicios) {
        await connection.request()
            .input("id_cotizacion", sql.Int, req.params.id)
            .input("id_servicio", sql.Int, servicio.id_servicio || servicio.serviceId)
            .input("precio", sql.Decimal(12, 2), servicio.precio || servicio.price)
            .input("cantidad", sql.Int, servicio.cantidad || servicio.quantity)
            .query(`
            INSERT INTO Detalle_cotizacion (FK_id_cotizacion, FK_id_servicio, Precio, Cantidad)
            VALUES (@id_cotizacion, @id_servicio, @precio, @cantidad)
            `);
        }

        res.json({ mensaje: "Cotización actualizada exitosamente" });

    } catch (error) {
        console.error("ERROR actualizar cotización:", error);
        res.status(500).json({ error: "Error al actualizar cotización" });
    }
    });

module.exports = router;