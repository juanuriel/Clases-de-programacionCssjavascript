/**
 * server.js — Backend mínimo para el Quiz VoIP en vivo.
 *
 * Reemplaza la función `window.storage` (que solo existe dentro de los
 * artifacts de Claude.ai) por un almacén clave-valor real en memoria,
 * accesible vía HTTP. El front-end (public/quiz_voip_live.html) usa estos
 * endpoints para que el anfitrión y los jugadores puedan sincronizarse
 * entre sí desde sus propios dispositivos.
 */
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Almacén en memoria: { "clave": "valor (string)" }
// Se reinicia si el servidor se reinicia — suficiente para una sesión de clase en vivo.
const store = new Map();

// Obtener un valor
app.get("/api/kv/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key);
  if (store.has(key)) return res.json({ value: store.get(key) });
  return res.status(404).json({ value: null });
});

// Guardar un valor
app.post("/api/kv/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const { value } = req.body || {};
  store.set(key, value);
  res.json({ ok: true });
});

// Borrar un valor
app.delete("/api/kv/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key);
  store.delete(key);
  res.json({ ok: true });
});

// Listar claves que empiezan con un prefijo (para saber qué jugadores/respuestas hay)
app.get("/api/kv-list", (req, res) => {
  const prefix = req.query.prefix || "";
  const keys = [...store.keys()].filter((k) => k.startsWith(prefix));
  res.json({ keys });
});

// Endpoint simple de salud, útil para verificar que el deploy quedó bien
app.get("/api/health", (req, res) => {
  res.json({ ok: true, keys: store.size });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Quiz VoIP server escuchando en el puerto " + PORT);
});
