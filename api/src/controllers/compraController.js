import { sequelize, Compra, CompraProducto, Producto, Usuario } from '../models/index.js';

// GET /compras — historial de compras DEL USUARIO LOGUEADO.
// Es el equivalente a "GET /api/orders/my-orders" de la consigna: tu DER
// ya tiene Compra/CompraProducto cumpliendo el rol de Order/OrderItem, así
// que no se crean tablas nuevas, se reusan estas.
//
// Importante: antes este endpoint devolvía TODAS las compras de TODOS los
// usuarios (bug de privacidad). Ahora se filtra por req.usuario.id, que
// viene del middleware verificarUsuario.
export const getCompras = async (req, res) => {
  const compras = await Compra.findAll({
    where: { idUsuario: req.usuario.id },
    include: [{ model: CompraProducto, include: [Producto] }],
    order: [['id', 'DESC']],
  });
  res.json({ estado: true, data: compras });
};

export const getTodasLasCompras = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'email'],
        },
        {
          model: CompraProducto,
          include: [Producto],
        },
      ],
      order: [['id', 'DESC']],
    });

    res.json({
      estado: true,
      data: compras,
    });
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({
      estado: false,
      mensaje: 'Error al obtener compras',
    });
  }
};




export const actualizarEstadoCompraAdmin = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id);

    if (!compra) {
      return res.status(404).json({
        estado: false,
        mensaje: 'Compra no encontrada',
      });
    }

    await compra.update({
      estadoEnvio: req.body.estadoEnvio,
    });

    res.json({
      estado: true,
      data: compra,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      estado: false,
      mensaje: 'Error al actualizar el estado',
    });
  }
};

// GET /compras/:id — detalle de una compra puntual, también restringido
// al dueño: si pedís el id de la compra de otro usuario, da 404 (no 403,
// a propósito: así no confirmamos ni siquiera que esa compra existe).
export const getCompraPorId = async (req, res) => {
  const compra = await Compra.findOne({
    where: { id: req.params.id, idUsuario: req.usuario.id },
    include: [{ model: CompraProducto, include: [Producto] }],
  });
  if (!compra) return res.status(404).json({ estado: false, mensaje: 'Compra no encontrada' });
  res.json({ estado: true, data: compra });
};

// POST /compras — el endpoint transaccional que pide la consigna
// ("POST /api/orders con descuento de stock").
//
// Body esperado: { items: [{ idProducto, cantidad }], medioPago }
//
// Todo pasa dentro de una transacción de Sequelize: si CUALQUIER producto
// no tiene stock suficiente, se cancela TODO (ningún producto se descuenta
// a medias). Esto evita el clásico bug de "vender" más stock del que hay
// cuando dos compras llegan casi al mismo tiempo.
export const crearCompra = async (req, res) => {
  const { items, medioPago } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ estado: false, mensaje: 'El carrito está vacío.' });
  }

  const t = await sequelize.transaction();

  try {
    let total = 0;
    const detalles = [];

    for (const item of items) {
      // lock: t.LOCK.UPDATE bloquea esa fila de producto hasta que la
      // transacción termine, para que dos compras simultáneas no lean el
      // mismo stock "viejo" y lo descuenten dos veces.
      const producto = await Producto.findByPk(item.idProducto, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!producto) {
        throw new Error(`El producto con id ${item.idProducto} no existe.`);
      }
      if (!item.cantidad || item.cantidad <= 0) {
        throw new Error(`Cantidad inválida para "${producto.nombre}".`);
      }
      if (producto.stock < item.cantidad) {
        throw new Error(`Sin stock suficiente de "${producto.nombre}" (quedan ${producto.stock}).`);
      }

      const precioUnitario = Number(producto.precio);
      const subTotal = precioUnitario * item.cantidad;
      total += subTotal;

      producto.stock -= item.cantidad;
      await producto.save({ transaction: t });

      detalles.push({
        idProducto: producto.id,
        cantidad: item.cantidad,
        precioUnitario,
        subTotal,
      });
    }

    const compra = await Compra.create({
      fecha: new Date(),
      total,
      medioPago: medioPago || 'efectivo',
      estadoPago: 'pendiente',
      estadoEnvio: 'pendiente',
      idUsuario: req.usuario.id,
    }, { transaction: t });

    for (const detalle of detalles) {
      await CompraProducto.create({ ...detalle, idCompra: compra.id }, { transaction: t });
    }

    // Si todo salió bien, recién acá se confirman los cambios en la base.
    await t.commit();

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [{ model: CompraProducto, include: [Producto] }],
    });

    res.status(201).json({
      estado: true,
      mensaje: 'Compra realizada con éxito',
      data: compraCompleta,
    });
  } catch (error) {
    // Si algo falló (stock insuficiente, producto inexistente, etc.),
    // deshacemos TODO: ningún stock quedó descontado, ninguna fila quedó
    // creada a medias.
    await t.rollback();
    console.error('Error al crear la compra:', error.message);
    res.status(400).json({ estado: false, mensaje: error.message });
  }
};

export const actualizarCompra = async (req, res) => {
  const compra = await Compra.findOne({ where: { id: req.params.id, idUsuario: req.usuario.id } });
  if (!compra) return res.status(404).json({ estado: false, mensaje: 'Compra no encontrada' });
  await compra.update(req.body);
  res.json({ estado: true, data: compra });
};

export const eliminarCompra = async (req, res) => {
  const compra = await Compra.findOne({ where: { id: req.params.id, idUsuario: req.usuario.id } });
  if (!compra) return res.status(404).json({ estado: false, mensaje: 'Compra no encontrada' });
  await compra.destroy();
  res.json({ estado: true, mensaje: 'Compra eliminada' });
};
