const { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, jidNormalizedUser } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')
const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const CONFIG_PATH = path.join(__dirname, 'config.json')
const HISTORIAL_PATH = path.join(__dirname, 'historial.json')
const ACTIVIDAD_PATH = path.join(__dirname, 'actividad.json')
const REGISTRO_ACTIVIDAD_PATH = path.join(__dirname, 'registro-actividad.json')
const PUERTO = 3000
const MAX_MENSAJES_POR_CHAT = 20 // 10 pares pregunta/respuesta por chat
const COMANDOS_RESET = ['/reset', '/reiniciar', '/borrar', '/nuevo']
const UN_MES_MS = 30 * 24 * 60 * 60 * 1000
const MAX_EVENTOS_REGISTRO = 100

let numeroGuardado = null
let yaSolicitoCodigo = false
let servidorIniciado = false

let codigoLogin = null
let codigoLoginExpiraEn = 0

const sesiones = new Map()

let numeroPropio = null
let conectado = false
const inicioBot = Date.now()

// Referencia al socket de Baileys activo, para poder consultar grupos
// (groupFetchAllParticipating) desde las rutas HTTP del panel.
let socketActual = null

function cargarConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    }
  } catch (e) {}
  return {}
}

function guardarConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

function cargarHistoriales() {
  try {
    if (fs.existsSync(HISTORIAL_PATH)) {
      return JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf-8'))
    }
  } catch (e) {
    console.log('⚠️ No se pudo leer historial.json, se empieza desde cero.')
  }
  return {}
}

function guardarHistoriales(historiales) {
  try {
    fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(historiales, null, 2), 'utf-8')
  } catch (e) {
    console.log('⚠️ No se pudo guardar el historial:', e.message)
  }
}

function obtenerHistorialChat(id) {
  const historiales = cargarHistoriales()
  return historiales[id] || []
}

function agregarAlHistorial(id, textoUsuario, textoAsistente) {
  const historiales = cargarHistoriales()
  const historialChat = historiales[id] || []

  historialChat.push({ role: 'user', content: textoUsuario })
  if (textoAsistente) {
    historialChat.push({ role: 'assistant', content: textoAsistente })
  }

  // Recorta para no crecer indefinidamente ni gastar de más en tokens
  while (historialChat.length > MAX_MENSAJES_POR_CHAT) {
    historialChat.shift()
  }

  historiales[id] = historialChat
  guardarHistoriales(historiales)
}

function borrarHistorialChat(id) {
  const historiales = cargarHistoriales()
  delete historiales[id]
  guardarHistoriales(historiales)

  const actividad = cargarActividad()
  delete actividad[id]
  guardarActividad(actividad)
}

function borrarTodoElHistorial() {
  guardarHistoriales({})
  guardarActividad({})
}

// ====================
// ACTIVIDAD POR CONTACTO (para filtrar la lista de Contactos a "recientes")
// ====================
// actividad.json guarda { numero: timestampDelUltimoMensaje }.
// Se actualiza cada vez que llega un mensaje privado, sin importar si el
// bot responde o no, para reflejar "cuándo hablaste con esa persona".

function cargarActividad() {
  try {
    if (fs.existsSync(ACTIVIDAD_PATH)) {
      return JSON.parse(fs.readFileSync(ACTIVIDAD_PATH, 'utf-8'))
    }
  } catch (e) {}
  return {}
}

function guardarActividad(actividad) {
  try {
    fs.writeFileSync(ACTIVIDAD_PATH, JSON.stringify(actividad, null, 2), 'utf-8')
  } catch (e) {
    console.log('⚠️ No se pudo guardar actividad.json:', e.message)
  }
}

function marcarActividad(id) {
  const actividad = cargarActividad()
  actividad[id] = Date.now()
  guardarActividad(actividad)
}

// ====================
// REGISTRO DE ACTIVIDAD (feed para el dashboard: GET /api/actividad)
// ====================
// registro-actividad.json guarda un array de eventos recientes:
// [{ tipo, detalle, timestamp }], recortado a MAX_EVENTOS_REGISTRO.

function cargarRegistroActividad() {
  try {
    if (fs.existsSync(REGISTRO_ACTIVIDAD_PATH)) {
      return JSON.parse(fs.readFileSync(REGISTRO_ACTIVIDAD_PATH, 'utf-8'))
    }
  } catch (e) {}
  return []
}

function guardarRegistroActividad(eventos) {
  try {
    fs.writeFileSync(REGISTRO_ACTIVIDAD_PATH, JSON.stringify(eventos, null, 2), 'utf-8')
  } catch (e) {
    console.log('⚠️ No se pudo guardar registro-actividad.json:', e.message)
  }
}

function registrarEvento(tipo, detalle) {
  const eventos = cargarRegistroActividad()
  eventos.push({ tipo, detalle, timestamp: Date.now() })
  while (eventos.length > MAX_EVENTOS_REGISTRO) {
    eventos.shift()
  }
  guardarRegistroActividad(eventos)
}

function extraerNumero(jid) {
  if (!jid) return null
  const parte = jid.split('@')[0].split(':')[0]
  return parte.replace(/[^0-9]/g, '')
}

function generarCodigoLogin() {
  codigoLogin = Math.floor(100000 + Math.random() * 900000).toString()
  codigoLoginExpiraEn = Date.now() + 15 * 60 * 1000
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔐 CÓDIGO DE ACCESO A LA PÁGINA: ${codigoLogin}`)
  console.log(`⏳ Válido por 15 minutos.`)
  console.log(`🌐 Abre: http://localhost:${PUERTO}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

function crearToken() {
  const token = crypto.randomBytes(24).toString('hex')
  sesiones.set(token, Date.now() + 12 * 60 * 60 * 1000)
  return token
}

function tokenValido(token) {
  if (!token) return false
  const expira = sesiones.get(token)
  if (!expira) return false
  if (Date.now() > expira) {
    sesiones.delete(token)
    return false
  }
  return true
}

function middlewareAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!tokenValido(token)) {
    return res.status(401).json({ ok: false, mensaje: 'Sesión inválida o expirada.' })
  }
  next()
}

function formatUptime(ms) {
  const segundos = Math.floor(ms / 1000)
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  return `${h}h ${m}m ${s}s`
}

// ====================
// PERMISOS (contactos / grupos)
// ====================
// Todo se guarda dentro de config.json para no crear otro archivo:
//   contactosBloqueados: string[]   -> números (sin "+") a los que el bot NO responde
//   gruposActivadosGlobal: boolean  -> interruptor general de respuestas en grupos
//   gruposPermitidos: string[]      -> ids de grupo (xxx@g.us) permitidos cuando el global está activo

function contactoEstaActivo(config, numero) {
  const bloqueados = config.contactosBloqueados || []
  return !bloqueados.includes(numero)
}

function grupoEstaActivo(config, grupoId) {
  if (!config.gruposActivadosGlobal) return false
  const permitidos = config.gruposPermitidos || []
  return permitidos.includes(grupoId)
}

function iniciarServidorWeb() {
  if (servidorIniciado) return
  servidorIniciado = true

  const app = express()
  app.use(express.json())
  app.use(express.static(path.join(__dirname, 'public')))

  // ====================
  // LOGIN
  // ====================
  app.post('/api/login', (req, res) => {
    const { codigo } = req.body || {}
    if (!codigo) return res.status(400).json({ ok: false, mensaje: 'Falta el código.' })
    if (Date.now() > codigoLoginExpiraEn) return res.status(400).json({ ok: false, mensaje: 'El código expiró. Revisa la consola del bot para uno nuevo.' })
    if (codigo.trim() !== codigoLogin) return res.status(400).json({ ok: false, mensaje: 'Código incorrecto.' })
    const token = crearToken()
    return res.json({ ok: true, token })
  })

  // ====================
  // ESTADO
  // ====================
  app.get('/api/estado', middlewareAuth, (req, res) => {
    const config = cargarConfig()
    const historiales = cargarHistoriales()
    res.json({
      ok: true,
      conectado,
      numero: numeroPropio,
      uptime: formatUptime(Date.now() - inicioBot),
      groqVinculado: !!config.groqApiKey,
      groqKeyParcial: config.groqApiKey ? `${config.groqApiKey.slice(0, 6)}...${config.groqApiKey.slice(-4)}` : null,
      conversacionesGuardadas: Object.keys(historiales).length
    })
  })

  // ====================
  // ACTIVIDAD RECIENTE (feed para el dashboard)
  // ====================
  app.get('/api/actividad', middlewareAuth, (req, res) => {
    const limite = Math.min(parseInt(req.query.limite, 10) || 20, MAX_EVENTOS_REGISTRO)
    const eventos = cargarRegistroActividad()
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limite)
    res.json({ ok: true, actividad: eventos })
  })

  // ====================
  // GROQ
  // ====================
  app.post('/api/vincular-groq', middlewareAuth, (req, res) => {
    const { apiKey } = req.body || {}
    if (!apiKey || apiKey.trim().length < 10) return res.status(400).json({ ok: false, mensaje: 'API key inválida.' })
    const config = cargarConfig()
    config.groqApiKey = apiKey.trim()
    guardarConfig(config)
    console.log('✅ API key de Groq vinculada correctamente desde la página.')
    registrarEvento('groq_vinculado', 'Se vinculó una API key de Groq desde el panel.')
    return res.json({ ok: true, mensaje: 'API key vinculada con éxito.' })
  })

  app.post('/api/desvincular-groq', middlewareAuth, (req, res) => {
    const config = cargarConfig()
    delete config.groqApiKey
    guardarConfig(config)
    registrarEvento('groq_desvinculado', 'Se desvinculó la API key de Groq desde el panel.')
    return res.json({ ok: true, mensaje: 'API key eliminada.' })
  })

  // ====================
  // MEMORIA
  // ====================
  app.post('/api/borrar-historial', middlewareAuth, (req, res) => {
    borrarTodoElHistorial()
    console.log('🗑️ Historial de todas las conversaciones borrado desde la página.')
    registrarEvento('historial_borrado', 'Se borró el historial de todas las conversaciones desde el panel.')
    return res.json({ ok: true, mensaje: 'Historial borrado.' })
  })

  // ====================
  // CONTACTOS
  // ====================
  // No existe un directorio de contactos en Baileys sin un store adicional,
  // así que la lista se arma con los números que ya tienen historial de chat,
  // filtrados a solo los que han tenido actividad (mensaje recibido) en el
  // último mes según actividad.json. El nombre solo se muestra si WhatsApp
  // entrega un pushName reciente; si no, se muestra el número.
  app.get('/api/contactos', middlewareAuth, (req, res) => {
    const config = cargarConfig()
    const historiales = cargarHistoriales()
    const actividad = cargarActividad()
    const nombres = config.nombresContactos || {}
    const ahora = Date.now()

    const contactos = Object.keys(historiales)
      .filter(id => !id.endsWith('@g.us') && id.indexOf('@') === -1) // solo chats privados (guardados como número)
      .filter(numero => actividad[numero] && (ahora - actividad[numero]) <= UN_MES_MS) // solo contactos recientes (último mes)
      .sort((a, b) => (actividad[b] || 0) - (actividad[a] || 0)) // más reciente primero
      .map(numero => ({
        id: numero,
        nombre: nombres[numero] || numero,
        numero: `+${numero}`,
        avatar: null,
        botActivo: contactoEstaActivo(config, numero),
        ultimaActividad: actividad[numero]
      }))

    res.json({ ok: true, contactos })
  })

  app.post('/api/contactos/configurar', middlewareAuth, (req, res) => {
    const { contactoId, activo } = req.body || {}
    if (!contactoId) return res.status(400).json({ ok: false, mensaje: 'Falta contactoId.' })

    const config = cargarConfig()
    let bloqueados = config.contactosBloqueados || []

    if (activo) {
      bloqueados = bloqueados.filter(n => n !== contactoId)
    } else if (!bloqueados.includes(contactoId)) {
      bloqueados.push(contactoId)
    }

    config.contactosBloqueados = bloqueados
    guardarConfig(config)
    registrarEvento(
      activo ? 'contacto_activado' : 'contacto_desactivado',
      `Bot ${activo ? 'activado' : 'desactivado'} para el contacto +${contactoId}.`
    )
    res.json({ ok: true, mensaje: 'Configuración actualizada.' })
  })

  // ====================
  // GRUPOS
  // ====================
  app.get('/api/grupos', middlewareAuth, async (req, res) => {
    if (!socketActual || !conectado) {
      return res.status(503).json({ ok: false, mensaje: 'El bot todavía no está conectado a WhatsApp.' })
    }
    try {
      const config = cargarConfig()
      const gruposWA = await socketActual.groupFetchAllParticipating()
      const grupos = Object.values(gruposWA).map(g => ({
        id: g.id,
        nombre: g.subject || g.id,
        avatar: null,
        botActivo: grupoEstaActivo(config, g.id)
      }))
      res.json({ ok: true, grupos })
    } catch (e) {
      console.log('❌ Error al obtener grupos:', e.message)
      res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener los grupos de WhatsApp.' })
    }
  })

  app.get('/api/configuracion-grupos', middlewareAuth, (req, res) => {
    const config = cargarConfig()
    res.json({ ok: true, gruposActivados: !!config.gruposActivadosGlobal })
  })

  app.post('/api/configurar-grupos', middlewareAuth, (req, res) => {
    const { global: esGlobal, activo, grupoId } = req.body || {}
    const config = cargarConfig()

    if (esGlobal) {
      config.gruposActivadosGlobal = !!activo
      guardarConfig(config)
      registrarEvento('grupos_global', `Respuestas en grupos ${activo ? 'activadas' : 'desactivadas'} globalmente.`)
      return res.json({
        ok: true,
        mensaje: activo ? 'Respuestas en grupos activadas.' : 'Respuestas en grupos desactivadas.'
      })
    }

    if (!grupoId) return res.status(400).json({ ok: false, mensaje: 'Falta grupoId.' })

    let permitidos = config.gruposPermitidos || []
    if (activo) {
      if (!permitidos.includes(grupoId)) permitidos.push(grupoId)
    } else {
      permitidos = permitidos.filter(id => id !== grupoId)
    }

    config.gruposPermitidos = permitidos
    guardarConfig(config)
    registrarEvento(
      activo ? 'grupo_activado' : 'grupo_desactivado',
      `Bot ${activo ? 'activado' : 'desactivado'} para un grupo.`
    )
    res.json({ ok: true, mensaje: 'Grupo actualizado.' })
  })

  // ====================
  // PROBAR BOT
  // ====================
  // Usa la misma IA (Groq) que WhatsApp, pero con un historial aislado:
  // no lee ni escribe en historial.json, así que no afecta la memoria real.
  app.post('/api/probar-bot', middlewareAuth, async (req, res) => {
    const { mensaje } = req.body || {}
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el mensaje.' })
    }
    const config = cargarConfig()
    if (!config.groqApiKey) {
      return res.status(400).json({ ok: false, mensaje: 'Vincula una API key de Groq antes de probar el bot.' })
    }

    const respuesta = await responderConGroq([{ role: 'user', content: mensaje.trim() }])
    res.json({ ok: true, respuesta: respuesta || 'No se pudo generar una respuesta.' })
  })

  app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`🌐 Página disponible en http://localhost:${PUERTO}`)
  })
}

async function responderConGroq(historialChat) {
  const config = cargarConfig()
  if (!config.groqApiKey) return null

  try {
    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres un asistente útil que responde en español de forma clara y concisa. Recuerdas el contexto de la conversación previa con esta persona.' },
          ...historialChat
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    })

    if (!respuesta.ok) {
      const cuerpoError = await respuesta.text()
      console.log('❌ Error Groq HTTP:', respuesta.status, cuerpoError)
      return '❌ No se pudo generar una respuesta (revisa tu API key de Groq).'
    }

    const datos = await respuesta.json()
    return datos?.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.log('❌ Error al consultar Groq:', e.message)
    return '❌ Ocurrió un error al conectar con la IA.'
  }
}

function extraerTextoMensaje(mensajeOriginal) {
  if (!mensajeOriginal) return ''

  let contenido = mensajeOriginal

  // Los mensajes enviados desde tu propio teléfono (multi-dispositivo)
  // llegan envueltos en deviceSentMessage. Los efímeros vienen envueltos
  // en ephemeralMessage. Los "ver una vez" en viewOnceMessage(V2).
  if (contenido.deviceSentMessage?.message) {
    contenido = contenido.deviceSentMessage.message
  }
  if (contenido.ephemeralMessage?.message) {
    contenido = contenido.ephemeralMessage.message
  }
  if (contenido.viewOnceMessage?.message) {
    contenido = contenido.viewOnceMessage.message
  }
  if (contenido.viewOnceMessageV2?.message) {
    contenido = contenido.viewOnceMessageV2.message
  }

  return (
    contenido.conversation ||
    contenido.extendedTextMessage?.text ||
    contenido.imageMessage?.caption ||
    contenido.videoMessage?.caption ||
    ''
  ).trim()
}

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion')

  const socket = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: false
  })

  socketActual = socket

  if (!state.creds.registered && !yaSolicitoCodigo) {
    yaSolicitoCodigo = true
    await new Promise(r => setTimeout(r, 3000))

    if (!numeroGuardado) {
      numeroGuardado = await new Promise(resolve =>
        rl.question('📱 Escribe tu numero con codigo de pais (ej 573001234567): ', resolve)
      )
    }

    const numeroLimpio = numeroGuardado.trim().replace(/[^0-9]/g, '')

    try {
      const code = await socket.requestPairingCode(numeroLimpio)
      const codigoFormateado = code.match(/.{1,4}/g).join('-')
      console.log(`\n🔑 TU CODIGO DE WHATSAPP ES: ${codigoFormateado}\n`)
      console.log('⚠️ Tienes 60 segundos para ingresarlo en:')
      console.log('WhatsApp → Dispositivos vinculados → Vincular dispositivo → Vincular con numero de telefono\n')
    } catch (e) {
      console.log('\n❌ No se pudo generar el código de vinculación de WhatsApp.')
      console.log('Detalle del error:', e.message, '\n')
    }
  }

  socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp!')
      yaSolicitoCodigo = false
      conectado = true
      socketActual = socket
      const jidPropio = jidNormalizedUser(socket.user.id)
      numeroPropio = extraerNumero(jidPropio)
      console.log(`🪪 numeroPropio detectado: ${numeroPropio}`)
      generarCodigoLogin()
      iniciarServidorWeb()
    }
    if (connection === 'close') {
      conectado = false
      const motivo = lastDisconnect?.error?.message || 'desconocido'
      console.log(`Conexión cerrada (${motivo}). Reconectando...`)
      setTimeout(iniciar, 5000)
    }
  })

  socket.ev.on('creds.update', saveCreds)

  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg || !msg.message) return

    const remoteJidOriginal = msg.key.remoteJid
    const esFromMe = !!msg.key.fromMe
    const texto = extraerTextoMensaje(msg.message)
    if (!texto) return

    // ---- Mensajes de grupo (@g.us) ----
    if (remoteJidOriginal.endsWith('@g.us')) {
      if (esFromMe) return // ignora los mensajes que el propio bot envía al grupo

      const config = cargarConfig()
      if (!grupoEstaActivo(config, remoteJidOriginal)) return // grupo no permitido o interruptor global apagado
      if (!config.groqApiKey) return

      console.log(`📩 [Grupo ${remoteJidOriginal}]: "${texto}"`)
      registrarEvento('mensaje_grupo', `Mensaje recibido en un grupo.`)

      if (COMANDOS_RESET.includes(texto.trim().toLowerCase())) {
        borrarHistorialChat(remoteJidOriginal)
        await socket.sendMessage(remoteJidOriginal, { text: '🧹 Listo, borré el historial de este grupo. Empezamos de cero.' })
        registrarEvento('reset_chat', 'Se reinició el historial de un grupo por comando.')
        return
      }

      const historialPrevio = obtenerHistorialChat(remoteJidOriginal)
      const historialParaGroq = [...historialPrevio, { role: 'user', content: texto }]
      const respuestaIA = await responderConGroq(historialParaGroq)
      if (respuestaIA) {
        await socket.sendMessage(remoteJidOriginal, { text: respuestaIA })
        agregarAlHistorial(remoteJidOriginal, texto, respuestaIA)
        console.log(`✅ Respondido en grupo ${remoteJidOriginal}`)
        registrarEvento('respuesta_grupo', 'El bot respondió en un grupo.')
      }
      return
    }

    // ---- Mensajes privados (@s.whatsapp.net) ----
    // WhatsApp puede entregar algunos chats privados (incluido "Tú mismo")
    // usando addressingMode "lid", donde remoteJid viene como XXXXX@lid en
    // vez de numero@s.whatsapp.net. En esos casos Baileys expone el JID real
    // (con el número) en remoteJidAlt. Lo usamos solo para identificar el
    // número; para responder seguimos usando el remoteJid original.
    let remitente = remoteJidOriginal
    if (remoteJidOriginal.endsWith('@lid') && msg.key.remoteJidAlt) {
      remitente = msg.key.remoteJidAlt
    }

    if (!remitente.endsWith('@s.whatsapp.net')) return

    const numeroRemitente = extraerNumero(remitente)
    const esChatPropio = numeroRemitente && numeroPropio && numeroRemitente === numeroPropio

    // Si el mensaje lo envié yo (fromMe) y NO es mi propio chat, es que
    // le escribí a otra persona o ya respondí antes: se ignora.
    if (esFromMe && !esChatPropio) return

    console.log(`📩 Mensaje de ${remitente}: "${texto}"`)

    // Se marca actividad con cada mensaje entrante, sin importar si el bot
    // responde o no: así la lista de Contactos refleja "cuándo hablaste con
    // él/ella" y no solo "cuándo te contestó el bot".
    marcarActividad(numeroRemitente)
    registrarEvento('mensaje_privado', `Mensaje recibido de +${numeroRemitente}.`)

    // Comando para limpiar la memoria de esta conversación
    if (COMANDOS_RESET.includes(texto.trim().toLowerCase())) {
      borrarHistorialChat(numeroRemitente)
      await socket.sendMessage(remoteJidOriginal, { text: '🧹 Listo, borré el historial de esta conversación. Empezamos de cero.' })
      console.log(`🧹 Historial borrado para ${numeroRemitente}`)
      registrarEvento('reset_chat', `Se reinició el historial de +${numeroRemitente} por comando.`)
      return
    }

    const config = cargarConfig()
    if (!config.groqApiKey) {
      console.log('⚠️ No hay API key de Groq vinculada, no se responde.')
      return
    }

    if (!contactoEstaActivo(config, numeroRemitente)) {
      console.log(`🔕 Contacto ${numeroRemitente} tiene el bot desactivado, no se responde.`)
      return
    }

    const historialPrevio = obtenerHistorialChat(numeroRemitente)
    const historialParaGroq = [...historialPrevio, { role: 'user', content: texto }]

    const respuestaIA = await responderConGroq(historialParaGroq)
    if (respuestaIA) {
      await socket.sendMessage(remoteJidOriginal, { text: respuestaIA })
      agregarAlHistorial(numeroRemitente, texto, respuestaIA)
      console.log(`✅ Respondido a ${remitente}`)
      registrarEvento('respuesta_privada', `El bot respondió a +${numeroRemitente}.`)
    }
  })
}

process.on('uncaughtException', err => {
  console.error('Error no controlado:', err)
})

process.on('unhandledRejection', err => {
  console.error('Promesa rechazada:', err)
})

iniciar()
