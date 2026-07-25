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
const PUERTO = 3000
const MAX_MENSAJES_POR_CHAT = 20 // 10 pares pregunta/respuesta por chat
const COMANDOS_RESET = ['/reset', '/reiniciar', '/borrar', '/nuevo']

let numeroGuardado = null
let yaSolicitoCodigo = false
let servidorIniciado = false

let codigoLogin = null
let codigoLoginExpiraEn = 0

const sesiones = new Map()

let numeroPropio = null
let conectado = false
const inicioBot = Date.now()

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

function obtenerHistorialChat(numero) {
  const historiales = cargarHistoriales()
  return historiales[numero] || []
}

function agregarAlHistorial(numero, rolUsuario, textoUsuario, textoAsistente) {
  const historiales = cargarHistoriales()
  const historialChat = historiales[numero] || []

  historialChat.push({ role: 'user', content: textoUsuario })
  if (textoAsistente) {
    historialChat.push({ role: 'assistant', content: textoAsistente })
  }

  // Recorta para no crecer indefinidamente ni gastar de más en tokens
  while (historialChat.length > MAX_MENSAJES_POR_CHAT) {
    historialChat.shift()
  }

  historiales[numero] = historialChat
  guardarHistoriales(historiales)
}

function borrarHistorialChat(numero) {
  const historiales = cargarHistoriales()
  delete historiales[numero]
  guardarHistoriales(historiales)
}

function borrarTodoElHistorial() {
  guardarHistoriales({})
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

function iniciarServidorWeb() {
  if (servidorIniciado) return
  servidorIniciado = true

  const app = express()
  app.use(express.json())
  app.use(express.static(path.join(__dirname, 'public')))

  app.post('/api/login', (req, res) => {
    const { codigo } = req.body || {}
    if (!codigo) return res.status(400).json({ ok: false, mensaje: 'Falta el código.' })
    if (Date.now() > codigoLoginExpiraEn) return res.status(400).json({ ok: false, mensaje: 'El código expiró. Revisa la consola del bot para uno nuevo.' })
    if (codigo.trim() !== codigoLogin) return res.status(400).json({ ok: false, mensaje: 'Código incorrecto.' })
    const token = crearToken()
    return res.json({ ok: true, token })
  })

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

  app.post('/api/vincular-groq', middlewareAuth, (req, res) => {
    const { apiKey } = req.body || {}
    if (!apiKey || apiKey.trim().length < 10) return res.status(400).json({ ok: false, mensaje: 'API key inválida.' })
    const config = cargarConfig()
    config.groqApiKey = apiKey.trim()
    guardarConfig(config)
    console.log('✅ API key de Groq vinculada correctamente desde la página.')
    return res.json({ ok: true, mensaje: 'API key vinculada con éxito.' })
  })

  app.post('/api/desvincular-groq', middlewareAuth, (req, res) => {
    const config = cargarConfig()
    delete config.groqApiKey
    guardarConfig(config)
    return res.json({ ok: true, mensaje: 'API key eliminada.' })
  })

  app.post('/api/borrar-historial', middlewareAuth, (req, res) => {
    borrarTodoElHistorial()
    console.log('🗑️ Historial de todas las conversaciones borrado desde la página.')
    return res.json({ ok: true, mensaje: 'Historial borrado.' })
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

    // WhatsApp puede entregar algunos chats privados (incluido "Tú mismo")
    // usando addressingMode "lid", donde remoteJid viene como XXXXX@lid en
    // vez de numero@s.whatsapp.net. En esos casos Baileys expone el JID real
    // (con el número) en remoteJidAlt. Lo usamos solo para identificar el
    // número; para responder seguimos usando el remoteJid original.
    let remitente = remoteJidOriginal
    if (remoteJidOriginal.endsWith('@lid') && msg.key.remoteJidAlt) {
      remitente = msg.key.remoteJidAlt
    }

    // Solo chats privados 1 a 1. Se descartan grupos (@g.us),
    // canales/newsletters (@newsletter) y listas de difusión.
    if (!remitente.endsWith('@s.whatsapp.net')) return

    const numeroRemitente = extraerNumero(remitente)
    const esFromMe = !!msg.key.fromMe
    const esChatPropio = numeroRemitente && numeroPropio && numeroRemitente === numeroPropio

    // Si el mensaje lo envié yo (fromMe) y NO es mi propio chat, es que
    // le escribí a otra persona o ya respondí antes: se ignora.
    if (esFromMe && !esChatPropio) return

    const texto = extraerTextoMensaje(msg.message)
    if (!texto) return

    console.log(`📩 Mensaje de ${remitente}: "${texto}"`)

    // Comando para limpiar la memoria de esta conversación
    if (COMANDOS_RESET.includes(texto.trim().toLowerCase())) {
      borrarHistorialChat(numeroRemitente)
      await socket.sendMessage(remoteJidOriginal, { text: '🧹 Listo, borré el historial de esta conversación. Empezamos de cero.' })
      console.log(`🧹 Historial borrado para ${numeroRemitente}`)
      return
    }

    const config = cargarConfig()
    if (!config.groqApiKey) {
      console.log('⚠️ No hay API key de Groq vinculada, no se responde.')
      return
    }

    const historialPrevio = obtenerHistorialChat(numeroRemitente)
    const historialParaGroq = [...historialPrevio, { role: 'user', content: texto }]

    const respuestaIA = await responderConGroq(historialParaGroq)
    if (respuestaIA) {
      await socket.sendMessage(remoteJidOriginal, { text: respuestaIA })
      agregarAlHistorial(numeroRemitente, 'user', texto, respuestaIA)
      console.log(`✅ Respondido a ${remitente}`)
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
