import { sql } from "./neon-config.js";

export async function registrarUsuario(nombre, correo, contrasena) {
  try {
    const existe = await sql`SELECT id FROM usuarios WHERE correo = ${correo};`;
    if (existe.length > 0) {
      return { exito: false, mensaje: "El correo ya se encuentra registrado." };
    }
    await sql`
      INSERT INTO usuarios (nombre, correo, contrasena, rol, turno)
      VALUES (${nombre}, ${correo}, ${contrasena}, 'cliente', '24/7');
    `;
    return { exito: true, mensaje: "Cuenta creada exitosamente. Ahora puedes iniciar sesión." };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { exito: false, mensaje: "Error de conexión con la base de datos." };
  }
}

export async function iniciarSesion(correo, contrasena) {
  try {
    const filas = await sql`
      SELECT id, nombre, correo, rol, turno
      FROM usuarios
      WHERE correo = ${correo} AND contrasena = ${contrasena};
    `;
    if (filas.length === 0) {
      return { exito: false, mensaje: "Correo o contraseña incorrectos." };
    }
    const usuario = filas[0];
    sessionStorage.setItem("usuario", JSON.stringify(usuario));
    return { exito: true, usuario };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { exito: false, mensaje: "Error de conexión con el servidor." };
  }
}

export function obtenerUsuarioActual() {
  const guardado = sessionStorage.getItem("usuario");
  return guardado ? JSON.parse(guardado) : null;
}

export function cerrarSesion() {
  sessionStorage.removeItem("usuario");
  localStorage.removeItem("usuario");
}

export function rutaInicioSegunRol(rol) {
  const rutas = { cliente: "/", administrador: "/panel", empleado: "/panel", cajero: "/caja" };
  return rutas[rol] ?? "/";
}