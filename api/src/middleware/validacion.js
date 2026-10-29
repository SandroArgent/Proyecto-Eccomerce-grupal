// validacion.js contiene middlewares que revisan los datos que llegan en
// el body ANTES de que el controller intente guardarlos. Si algo no es
// válido, cortan la petición con un 400 y un mensaje claro — el
// controller ni se entera de que existió un dato malo.

// Validaciones para crear/editar un producto.
// Se usa tanto en POST (todo obligatorio) como en PUT (solo se valida lo
// que venga presente, porque PUT permite mandar apenas un campo).
export const validarProducto = (req, res, next) => {
  const { nombre, precio, stock, imagen } = req.body;
  const esCreacion = req.method === 'POST';
  const errores = [];

  // nombre: obligatorio en creación, y si viene, no puede ser vacío.
  if (esCreacion && (nombre === undefined || nombre === null)) {
    errores.push('El nombre es obligatorio.');
  } else if (nombre !== undefined && String(nombre).trim().length === 0) {
    errores.push('El nombre no puede estar vacío.');
  }

  // precio: obligatorio en creación, debe ser un número mayor a 0.
  if (esCreacion && (precio === undefined || precio === null)) {
    errores.push('El precio es obligatorio.');
  } else if (precio !== undefined) {
    const precioNum = Number(precio);
    if (Number.isNaN(precioNum) || precioNum <= 0) {
      errores.push('El precio debe ser un número mayor a 0.');
    }
  }

  // stock: obligatorio en creación, debe ser un entero mayor o igual a 0.
  if (esCreacion && (stock === undefined || stock === null)) {
    errores.push('El stock es obligatorio.');
  } else if (stock !== undefined) {
    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      errores.push('El stock debe ser un número entero mayor o igual a 0.');
    }
  }

  // imagen: si viene, tiene que ser un texto (una URL o un nombre de archivo).
  // No es obligatoria porque un producto podría cargarse y agregarle la
  // imagen después.
  if (imagen !== undefined && imagen !== null && typeof imagen !== 'string') {
    errores.push('La imagen debe ser un texto (URL o nombre de archivo).');
  }

  if (errores.length > 0) {
    return res.status(400).json({ estado: false, mensaje: 'Datos inválidos', errores });
  }

  next();
};

// Validaciones para crear/editar una categoría.
export const validarCategoria = (req, res, next) => {
  const { nombre } = req.body;
  const esCreacion = req.method === 'POST';
  const errores = [];

  if (esCreacion && (nombre === undefined || nombre === null)) {
    errores.push('El nombre es obligatorio.');
  } else if (nombre !== undefined && String(nombre).trim().length === 0) {
    errores.push('El nombre no puede estar vacío.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ estado: false, mensaje: 'Datos inválidos', errores });
  }

  next();
};
