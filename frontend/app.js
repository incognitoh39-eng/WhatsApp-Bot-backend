const SERVER_URL = window.location.origin
let sessionId = localStorage.getItem('panel_session_id') || null
let socket = null

const rutaPuntos = {
  termux: document.querySelector('[data-punto="termux"]'),
  whatsapp: document.querySelector('[data-punto="whatsapp"]'),
  groq: document.querySelector('[data-punto="groq"]'),
  panel: document.querySelector('[data-punto="panel"]')
}

function marcarRuta(nombre, estado) {
  if (rutaPuntos[nombre]) rutaPuntos[nombre].dataset.estado = estado
}

function irAPaso(numero) {
  document.querySelectorAll('.paso').forEach(el => (el.dataset.activo = 'false'))
  document.getElementById(`paso-${numero}`).dataset.activo = 'true'
}

function conectarSocket() {
  if (socket) return
  socket = io(SERVER_URL)

  socket.on('connect', () => {
    socket.emit('client:join', { sessionId })
  })

  socket.on('server:error', ({ mensaje }) => {
    alert(mensaje)
  })

  socket.on('server:status', ({ status, hasApiKey, contacts }) => {
    document.getElementById('pie-sesion').textContent = `sesión ${sessionId}`

    if (status === 'esperando_termux') {
      marcarRuta('termux', 'pendiente')
      document.getElementById('texto-estado-termux').textContent = 'Esperando que ejecutes el comando en Termux…'
    }
    if (status === 'solicitando_codigo') {
      marcarRuta('termux', 'activo')
      document.getElementById('texto-estado-termux').textContent = 'Termux conectado, generando código de vinculación…'
    }
    if (status === 'conectado') {
      marcarRuta('termux', 'hecho')
      marcarRuta('whatsapp', 'hecho')
      document.getElementById('bloque-pairing').hidden = true
      document.getElementById('estado-espera-termux').style.display = 'none'

      if (hasApiKey) {
        marcarRuta('groq', 'hecho')
        marcarRuta('panel', 'activo')
        irAPaso(3)
        pintarContactos(contacts || [])
      } else {
        marcarRuta('groq', 'activo')
        irAPaso(2)
      }
    }
    if (status === 'desconectado') {
      document.getElementById('estado-espera-termux').style.display = 'flex'
      document.getElementById('texto-estado-termux').textContent = 'El worker de Termux se desconectó. Vuelve a correr el comando.'
      marcarRuta('termux', 'pendiente')
    }
  })

  socket.on('server:pairing_code', ({ code }) => {
    document.getElementById('bloque-pairing').hidden = false
    document.getElementById('codigo-pairing').textContent = code
    document.getElementById('estado-espera-termux').style.display = 'none'
  })

  socket.on('server:apikey_ack', ({ ok }) => {
    if (ok) {
      marcarRuta('groq', 'hecho')
      marcarRuta('panel', 'activo')
      irAPaso(3)
      socket.emit('client:get_contacts', { sessionId })
    }
  })

  socket.on('server:contacts', ({ contacts }) => {
    pintarContactos(contacts || [])
  })
}

// --- Paso 1: generar comando para Termux ---
document.getElementById('form-telefono').addEventListener('submit', async e => {
  e.preventDefault()
  const telefono = document.getElementById('input-telefono').value.trim()
  if (!telefono) return

  const resp = await fetch(`${SERVER_URL}/api/session/new`, { method: 'POST' })
  const datos = await resp.json()
  sessionId = datos.sessionId
  localStorage.setItem('panel_session_id', sessionId)
  localStorage.setItem('panel_telefono', telefono)

  const comando = `SESSION_ID=${sessionId} SERVER_URL=${datos.serverUrl} node bot.js`
  document.getElementById('texto-comando').textContent = comando
  document.getElementById('bloque-comando').hidden = false

  conectarSocket()

  // En cuanto el worker se conecte, le pedimos el código de emparejamiento con este número.
  const esperarWorker = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('client:request_pairing', { sessionId, phone: telefono })
      clearInterval(esperarWorker)
    }
  }, 1500)
})

document.getElementById('boton-copiar-comando').addEventListener('click', () => {
  const texto = document.getElementById('texto-comando').textContent
  navigator.clipboard.writeText(texto)
  const boton = document.getElementById('boton-copiar-comando')
  const original = boton.textContent
  boton.textContent = '¡Copiado!'
  setTimeout(() => (boton.textContent = original), 1500)
})

// --- Paso 2: API key de Groq ---
document.getElementById('form-apikey').addEventListener('submit', e => {
  e.preventDefault()
  const apiKey = document.getElementById('input-apikey').value.trim()
  if (!apiKey || !socket) return
  socket.emit('client:set_apikey', { sessionId, apiKey })
})

// --- Paso 3: contactos ---
let contactosActuales = []

function pintarContactos(lista) {
  contactosActuales = lista
  const contenedor = document.getElementById('lista-contactos')
  const filtro = document.getElementById('input-filtro').value.trim().toLowerCase()

  const filtrados = lista.filter(c =>
    !filtro || c.nombre.toLowerCase().includes(filtro) || c.numero.includes(filtro)
  )

  if (filtrados.length === 0) {
    contenedor.innerHTML = `<p class="texto-ayuda">${lista.length === 0 ? 'Aún no llegan contactos desde tu worker. Escríbete algún chat en WhatsApp o pulsa «Refrescar».' : 'Ningún contacto coincide con la búsqueda.'}</p>`
    return
  }

  contenedor.innerHTML = filtrados.map(c => `
    <div class="contacto-fila">
      <div class="contacto-info">
        <span class="contacto-nombre">${escaparHtml(c.nombre)}</span>
        <span class="contacto-numero">+${escaparHtml(c.numero)}</span>
      </div>
      <label class="interruptor">
        <input type="checkbox" data-id="${escaparHtml(c.id)}" ${c.iaActiva ? 'checked' : ''} />
        <span class="interruptor-slider"></span>
      </label>
    </div>
  `).join('')

  contenedor.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      socket.emit('client:toggle_contact', {
        sessionId,
        contactId: input.dataset.id,
        enabled: input.checked
      })
    })
  })
}

document.getElementById('input-filtro').addEventListener('input', () => pintarContactos(contactosActuales))

document.getElementById('boton-refrescar').addEventListener('click', () => {
  if (socket) socket.emit('client:get_contacts', { sessionId })
})

function escaparHtml(texto) {
  const div = document.createElement('div')
  div.textContent = String(texto ?? '')
  return div.innerHTML
}

// Si ya había una sesión guardada (recarga de página), reconecta directo.
if (sessionId) {
  const telefonoGuardado = localStorage.getItem('panel_telefono') || ''
  document.getElementById('input-telefono').value = telefonoGuardado
  conectarSocket()
}
