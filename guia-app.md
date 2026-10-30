# Guía paso a paso: crear una app React con Vite y Axios

Esta guía explica cómo crear una aplicación frontend con React que se conecta a un backend y muestra una lista de productos. Al hacer clic en un producto, se muestra el detalle.

Vamos a usar:

- **Vite**: herramienta para crear proyectos de React de forma rápida.
- **Axios**: librería para hacer peticiones HTTP al backend.
- **React**: biblioteca para construir interfaces de usuario.

---

## 1. ¿Qué vamos a construir?

Una app que:

1. Al iniciar, pide al backend la lista de productos.
2. Muestra los productos en una lista.
3. Al hacer clic en un producto, pide los datos de ese producto por su ID.
4. Muestra el detalle del producto seleccionado.

---

## 2. Estructura de carpetas

Dentro de una carpeta llamada `app` vamos a crear esta estructura:

```
app/
├── index.html
├── package.json
├── vite.config.js
├── .env
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── api/
│   │   └── axios.js
│   └── components/
│       ├── ProductList.jsx
│       ├── ProductDetail.jsx
│       └── ProductItem.jsx
```

### ¿Qué es cada cosa?

- `index.html`: página HTML principal donde React se carga.
- `package.json`: lista de dependencias y scripts.
- `vite.config.js`: configuración de Vite.
- `.env`: variables de entorno, como la URL del backend.
- `src/main.jsx`: punto de entrada de React.
- `src/App.jsx`: componente principal que organiza todo.
- `src/App.css`: estilos.
- `src/api/axios.js`: configuración base de Axios.
- `src/components/ProductList.jsx`: componente que muestra la lista.
- `src/components/ProductDetail.jsx`: componente que muestra el detalle.
- `src/components/ProductItem.jsx`: componente para cada producto de la lista.

---

## 3. Crear la aplicación con Vite

Abrí la terminal en la carpeta donde querés crear la app y ejecutá:

```bash
npm create vite@latest app -- --template react
```

Esto crea una carpeta llamada `app` con un proyecto React listo para usar.

Después entrá a la carpeta e instalá las dependencias:

```bash
cd app
npm install
```

### ¿Qué es Vite?

Vite es una herramienta que crea el proyecto, levanta un servidor de desarrollo y empaqueta el código para producción. Es más rápida que otras opciones.

---

## 4. Instalar Axios

Ejecutá:

```bash
npm install axios
```

### ¿Qué es Axios?

Axios es una librería que facilita hacer peticiones a un backend. En lugar de escribir `fetch()` con muchas líneas, con Axios se hace más corto y claro.

---

## 5. Configurar el archivo `.env`

Creá el archivo `app/.env` con este contenido:

```env
VITE_API_URL=http://localhost:3000
```

### Importante

En Vite, las variables de entorno que se usan en el frontend deben empezar con `VITE_`. Después las leemos con `import.meta.env.VITE_API_URL`.

> El `.env` en el frontend no debería guardar secretos porque el código final se envía al navegador del usuario. Aquí solo guardamos la URL pública del backend.

---

## 6. Configurar Axios en `src/api/axios.js`

Este archivo crea una instancia de Axios con la URL base del backend. Así no tenemos que escribir la URL completa en cada petición.

```javascript
// Importamos axios.
import axios from 'axios';

// Creamos una instancia con la URL base del backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000, // Si la petición tarda más de 5 segundos, da error.
});

// Exportamos la instancia para usarla en otros archivos.
export default api;
```

### ¿Por qué crear una instancia?

Porque así toda la configuración queda en un solo lugar. Si cambia la URL del backend, solo la modificamos acá.

---

## 7. Crear el componente `ProductItem.jsx`

Este componente muestra un solo producto en la lista. Recibe el producto por props y ejecuta una función cuando se hace clic.

```jsx
// src/components/ProductItem.jsx

function ProductItem({ producto, onClick }) {
  return (
    <li
      onClick={() => onClick(producto.id)}
      style={{ cursor: 'pointer', marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}
    >
      <strong>{producto.nombre}</strong>
      <br />
      <span>Precio: ${producto.precio}</span>
    </li>
  );
}

export default ProductItem;
```

### ¿Qué son las props?

Son datos que un componente recibe desde otro. Acá `ProductItem` recibe `producto` (un objeto con los datos) y `onClick` (una función que se ejecuta al hacer clic).

---

## 8. Crear el componente `ProductList.jsx`

Este componente recibe la lista de productos y muestra cada uno usando `ProductItem`.

```jsx
// src/components/ProductList.jsx
import ProductItem from './ProductItem';

function ProductList({ productos, onSelectProducto }) {
  return (
    <div>
      <h2>Lista de productos</h2>
      {productos.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {productos.map((producto) => (
            <ProductItem
              key={producto.id}
              producto={producto}
              onClick={onSelectProducto}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;
```

### ¿Qué hace `productos.map(...)`?

Recorre el array de productos y devuelve un componente `ProductItem` por cada uno. Es como un `forEach` pero devuelve elementos JSX.

### ¿Qué es `key={producto.id}`?

React necesita una clave única para identificar cada elemento de la lista. Siempre usamos el ID del elemento.

---

## 9. Crear el componente `ProductDetail.jsx`

Este componente muestra la información completa de un producto.

```jsx
// src/components/ProductDetail.jsx

function ProductDetail({ producto }) {
  // Si todavía no se seleccionó ningún producto, mostramos un mensaje.
  if (!producto) {
    return <p>Hacé clic en un producto para ver el detalle.</p>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
      <h2>Detalle del producto</h2>
      <p><strong>ID:</strong> {producto.id}</p>
      <p><strong>Nombre:</strong> {producto.nombre}</p>
      <p><strong>Precio:</strong> ${producto.precio}</p>
      <p><strong>Categoría:</strong> {producto.categoria}</p>
      <p><strong>Stock:</strong> {producto.stock}</p>
      <p><strong>Descripción:</strong> {producto.descripcion}</p>
    </div>
  );
}

export default ProductDetail;
```

---

## 10. Crear el componente principal `App.jsx`

Este es el componente que controla todo: pide la lista de productos, guarda el producto seleccionado y muestra los componentes.

```jsx
// src/App.jsx
import { useEffect, useState } from 'react';
import api from './api/axios';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import './App.css';

function App() {
  // Estado para guardar la lista de productos.
  const [productos, setProductos] = useState([]);

  // Estado para guardar el producto seleccionado.
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estado para guardar mensajes de error o carga.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // useEffect se ejecuta cuando el componente se monta.
  // Acá pedimos la lista de productos al backend.
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setCargando(true);
        const response = await api.get('/productos');
        setProductos(response.data.data);
      } catch (err) {
        console.log('Error al obtener productos:', err);
        setError('No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  // Función que se ejecuta al hacer clic en un producto.
  const handleSelectProducto = async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      setProductoSeleccionado(response.data.data);
    } catch (err) {
      console.log('Error al obtener el producto:', err);
      setError('No se pudo cargar el detalle del producto.');
    }
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Catálogo de productos</h1>

      {cargando && <p>Cargando productos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ProductList
        productos={productos}
        onSelectProducto={handleSelectProducto}
      />

      <ProductDetail producto={productoSeleccionado} />
    </div>
  );
}

export default App;
```

### ¿Qué es `useState`?

Es una función de React que permite guardar datos que cambian con el tiempo. Cada vez que cambia el estado, React vuelve a dibujar el componente.

### ¿Qué es `useEffect`?

Es una función que se ejecuta en ciertos momentos del ciclo de vida del componente. En este caso, se ejecuta una sola vez al cargar la página porque el array de dependencias está vacío `[]`.

### ¿Por qué `async / await` dentro de `useEffect`?

Porque la petición al backend es asíncrona: no sabemos cuánto va a tardar. `async / await` permite esperar la respuesta sin bloquear la interfaz.

### ¿Qué es `response.data.data`?

- `response`: es la respuesta completa de Axios.
- `response.data`: es el cuerpo de la respuesta, que en nuestro backend viene como `{ estado: true, data: [...] }`.
- `response.data.data`: es el array de productos o el objeto producto.

---

## 11. Agregar estilos básicos en `App.css`

Este archivo da un estilo simple para que la app se vea ordenada. Podés modificarlo a gusto.

```css
/* src/App.css */

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

h1 {
  color: #333;
}

ul {
  padding: 0;
}

li {
  background-color: #fff;
  border-radius: 5px;
  transition: background-color 0.2s;
}

li:hover {
  background-color: #e6f7ff;
}
```

---

## 12. Cómo iniciar la app

Asegurate de que el backend esté corriendo en `http://localhost:3000`.

Después, en la terminal de la carpeta `app`, ejecutá:

```bash
npm run dev
```

Vite va a mostrar una URL, generalmente:

```
http://localhost:5173
```

Abrí esa URL en el navegador y deberías ver la lista de productos. Al hacer clic en uno, se muestra el detalle.

---

## 13. Cómo probar que todo funciona

1. Verificá que el backend responda:

```bash
curl http://localhost:3000/productos
```

2. Si eso funciona, levantá el frontend con `npm run dev`.
3. Abrí las herramientas de desarrollo del navegador (F12), pestaña **Console**, y fijate si hay errores.
4. En la pestaña **Network**, podés ver las peticiones que hace Axios al backend.

---

## 14. Resumen de conceptos importantes

| Concepto | Explicación simple |
| --- | --- |
| React | Biblioteca para construir interfaces de usuario con componentes. |
| Vite | Herramienta para crear y ejecutar proyectos de React. |
| Axios | Librería para hacer peticiones HTTP al backend. |
| Componente | Función que devuelve JSX y representa una parte de la interfaz. |
| Props | Datos que se pasan de un componente a otro. |
| Estado | Datos internos de un componente que pueden cambiar. |
| `useState` | Hook para crear y modificar el estado. |
| `useEffect` | Hook para ejecutar código cuando cambia algo o al cargar el componente. |
| `async / await` | Forma de esperar respuestas sin bloquear la app. |
| `map` | Método para recorrer un array y crear una lista de elementos. |

---

## 15. Consejos para los alumnos

1. **Empezar por el backend**: antes de armar el frontend, asegurate de que las rutas `GET /productos` y `GET /productos/:id` funcionen con `curl`.
2. **Usar `console.log`**: si algo no funciona, mostrá en consola `response.data` para ver qué devuelve el backend.
3. **Revisar CORS**: si el frontend no puede comunicarse con el backend, fijate que el backend tenga instalado y configurado `cors`.
4. **Probar componente por componente**: primero mostrá la lista estática, después conectá Axios, y por último agregá el detalle.
5. **No guardar secretos en el frontend**: el `.env` del frontend es público, solo guarda URLs.

---

## 16. Mini desafío para practicar

Una vez que funcione la lista y el detalle, intentá agregar:

1. Un botón para **volver a la lista** o limpiar el detalle.
2. Un **mensaje de carga** mientras se obtiene el detalle.
3. Un **formulario** para crear un nuevo producto (necesita `POST` en el backend).
4. Un **botón de eliminar** en cada producto de la lista (necesita `DELETE` en el backend).

---

## 17. Código completo de `App.jsx` simplificado

Si querés una versión más compacta para copiar y pegar, acá va:

```jsx
import { useEffect, useState } from 'react';
import api from './api/axios';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';

function App() {
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/productos')
      .then((res) => setProductos(res.data.data))
      .catch((err) => console.log('Error:', err))
      .finally(() => setCargando(false));
  }, []);

  const verDetalle = (id) => {
    api.get(`/productos/${id}`)
      .then((res) => setProducto(res.data.data))
      .catch((err) => console.log('Error:', err));
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Productos</h1>
      <ProductList productos={productos} onSelectProducto={verDetalle} />
      <ProductDetail producto={producto} />
    </div>
  );
}

export default App;
```

En esta versión usamos `.then()` y `.catch()` en lugar de `async/await`, para que veas que ambas formas son válidas.