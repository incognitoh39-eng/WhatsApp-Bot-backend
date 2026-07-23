const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const { Server } = require('socket.io')
const { randomBytes } = require('crypto')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'frontend')))

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

// Todas las sesiones viven en memoria mientras el proceso está vivo.
// sessionId -> { status, apiKey, contacts, settings, workerSocketId, clientSocketIds }
const sesiones = new Map()

function crearSesion() {
  const id = randomBytes(4).toString('hex').toUpperCase()
  sesiones.set(id, {
    status: 'esperando_termux',
    apiKey: null,
    contacts: [],
    settings: {},
    workerSocketId: null,
    clientSocketIds: new Set()
  })
  return id
}

function limpiarSesionesViejas() {
  // Evita que se acumulen sesiones abandonadas (sin worker ni clientes) por más de 2 horas.
  const ahora = Date.now()
  for (const [id, s] of sesiones.entries()) {
    if (!s.workerSocketId && s.clientSocketIds.size === 0 && s.creadaEn && ahora - s.creadaEn > 2 * 60 * 60 * 1000) {
      sesiones.delete(id)
    }
  }
}
setInterval(limpiarSesionesViejas, 30 * 60 * 1000)

app.post('/api/session/new', (req, res) => {
  const id = crearSesion()
  sesiones.get(id).creadaEn = Date.now()
  res.json({ sessionId: id, serverUrl: `${req.protocol}://${req.get('host')}` })
})

app.get('/api/session/:id/status', (req, res) => {
  const s = sesiones.get(req.params.id)
  if (!s) return res.status(404).json({ error: 'La sesión no existe o expiró' })
  res.json({ status: s.status, hasApiKey: !!s.apiKey, contacts: s.contacts })
})

io.on('connection', socket => {
  // --- El bot de Termux se identifica como "worker" de una sesión ---
  socket.on('worker:auth', ({ sessionId }) => {
    const s = sesiones.get(sessionId)
    if (!s) {
      socket.emit('server:error', { mensaje: 'Código de sesión inválido o expirado' })
      return
    }
    s.workerSocketId = socket.id
    socket.join(`worker:${sessionId}`)
    socket.data.sessionId = sessionId
    socket.data.rol = 'worker'
    io.to(`cliente:${sessionId}`).emit('server:status', { status: s.status, hasApiKey: !!s.apiKey, contacts: s.contacts })
  })

  // --- El navegador se une como "cliente" de una sesión ---
  socket.on('client:join', ({ sessionId }) => {
    const s = sesiones.get(sessionId)
    if (!s) {
      socket.emit('server:error', { mensaje: 'Código de sesión inválido o expirado' })
      return
    }
    s.clientSocketIds.add(socket.id)
    socket.join(`cliente:${sessionId}`)
    socket.data.sessionId = sessionId
    socket.data.rol = 'cliente'
    socket.emit('server:status', {
      status: s.workerSocketId ? s.status : 'esperando_termux',
      hasApiKey: !!s.apiKey,
      contacts: s.contacts
    })
  })

  socket.on('client:request_pairing', ({ sessionId, phone }) => {
    const s = sesiones.get(sessionId)
    if (!s || !s.workerSocketId) return
    s.status = 'solicitando_codigo'
    io.to(`worker:${sessionId}`).emit('server:request_pairing', { phone })
  })

  socket.on('worker:pairing_code', ({ sessionId, code }) => {
    if (!sesiones.get(sessionId)) return
    io.to(`cliente:${sessionId}`).emit('server:pairing_code', { code })
  })

  socket.on('worker:status', ({ sessionId, status }) => {
    const s = sesiones.get(sessionId)
    if (!s) return
    s.status = status
    io.to(`cliente:${sessionId}`).emit('server:status', { status: s.status, hasApiKey: !!s.apiKey, contacts: s.contacts })
  })

  socket.on('worker:contacts', ({ sessionId, contacts }) => {
    const s = sesiones.get(sessionId)
    if (!s) return
    s.contacts = contacts
    io.to(`cliente:${sessionId}`).emit('server:contacts', { contacts: s.contacts })
  })

  socket.on('client:set_apikey', ({ sessionId, apiKey }) => {
    const s = sesiones.get(sessionId)
    if (!s || !s.workerSocketId) return
    s.apiKey = apiKey
    io.to(`worker:${sessionId}`).emit('server:set_apikey', { apiKey })
  })

  socket.on('worker:apikey_ack', ({ sessionId, ok }) => {
    io.to(`cliente:${sessionId}`).emit('server:apikey_ack', { ok })
  })

  socket.on('client:toggle_contact', ({ sessionId, contactId, enabled }) => {
    const s = sesiones.get(sessionId)
    if (!s) return
    s.settings[contactId] = enabled
    const contacto = s.contacts.find(c => c.id === contactId)
    if (contacto) contacto.iaActiva = enabled
    io.to(`worker:${sessionId}`).emit('server:toggle_contact', { contactId, enabled })
  })

  socket.on('client:get_contacts', ({ sessionId }) => {
    const s = sesiones.get(sessionId)
    if (!s) return
    io.to(`worker:${sessionId}`).emit('server:refresh_contacts')
    socket.emit('server:contacts', { contacts: s.contacts })
  })

  socket.on('disconnect', () => {
    const sessionId = socket.data.sessionId
    if (!sessionId) return
    const s = sesiones.get(sessionId)
    if (!s) return
    if (socket.data.rol === 'worker' && s.workerSocketId === socket.id) {
      s.workerSocketId = null
      s.status = 'desconectado'
      io.to(`cliente:${sessionId}`).emit('server:status', { status: s.status, hasApiKey: !!s.apiKey, contacts: s.contacts })
    }
    if (socket.data.rol === 'cliente') {
      s.clientSocketIds.delete(socket.id)
    }
  })
})

const PUERTO = process.env.PORT || 3000
server.listen(PUERTO, () => console.log(`🌐 Panel corriendo en el puerto ${PUERTO}`))
