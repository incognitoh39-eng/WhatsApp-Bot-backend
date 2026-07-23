const { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const { io } = require('socket.io-client')
const fs = require('fs')

// Estas dos variables las pega el panel web en el comando que te da (paso 1).
// También puedes exportarlas a mano antes de correr el bot:
//   export SESSION_ID=ABCD1234
//   export SERVER_URL=https://tu-panel.ejemplo.com
const SESSION_ID = process.env.SESSION_ID
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'

if (!SESSION_ID) {
  console.log('❌ Falta SESSION_ID. Copia el comando completo que te dio la página web, no solo este archivo.')
  process.exit(1)
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

let groqApiKey = null
let ajustesContactos = {}
let sockWA = null
let refrescarContactosAhora = () => {}

const panel = io(SERVER_URL, { transports: ['websocket'] })

panel.on('connect', () => {
  console.log('🔗 Conectado al panel web, autenticando sesión...')
  panel.emit('worker:auth', { sessionId: SESSION_ID })
})

panel.on('server:error', ({ mensaje }) => {
  console.log('❌', mensaje)
})

panel.on('server:request_pairing', async ({ phone }) => {
  if (!sockWA) {
    console.log('⚠️ El socket de WhatsApp aún no está listo, intenta de nuevo en unos segundos.')
    return
  }
  try {
    const numeroLimpio = String(phone).replace(/[^0-9]/g, '')
    const codigo = await sockWA.requestPairingCode(numeroLimpio)
    const formateado = codigo.match(/.{1,4}/g).join('-')
    console.log(`\n🔑 CÓDIGO DE VINCULACIÓN: ${formateado}`)
    console.log('Ingresa este código en: WhatsApp → Dispositivos vinculados → Vincular con número de teléfono\n')
    panel.emit('worker:pairing_code', { sessionId: SESSION_ID, code: formateado })
  } catch (e) {
    console.log('❌ No se pudo generar el código de vinculación:', e.message)
  }
})

panel.on('server:set_apikey', ({ apiKey }) => {
  groqApiKey = apiKey
  console.log('✅ API key de Groq recibida. La IA ya puede responder en los contactos que actives.')
  panel.emit('worker:apikey_ack', { sessionId: SESSION_ID, ok: true })
})

panel.on('server:toggle_contact', ({ contactId, enabled }) => {
  ajustesContactos[contactId] = enabled
  console.log(`🔁 IA ${enabled ? 'ACTIVADA' : 'desactivada'} para ${contactId}`)
})

panel.on('server:refresh_contacts', () => {
  refrescarContactosAhora()
})

async function iniciarWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion_whatsapp')
  const { version } = await fetchLatestBaileysVersion()

  sockWA = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: false
  })

  const contactosMap = new Map()

  function emitirContactos() {
    const lista = Array.from(contactosMap.values()).map(c => ({
      ...c,
      iaActiva: !!ajustesContactos[c.id]
    }))
    panel.emit('worker:contacts', { sessionId: SESSION_ID, contacts: lista })
  }
  refrescarContactosAhora = emitirContactos

  sockWA.ev.on('creds.update', saveCreds)

  sockWA.ev.on('contacts.upsert', lista => {
    for (const c of lista) {
      if (c.id && c.id.endsWith('@s.whatsapp.net')) {
        contactosMap.set(c.id, {
          id: c.id,
          nombre: c.name || c.notify || c.id.split('@')[0],
          numero: c.id.split('@')[0]
        })
      }
    }
    emitirContactos()
  })

  sockWA.ev.on('chats.upsert', lista => {
    for (const chat of lista) {
      if (chat.id && chat.id.endsWith('@s.whatsapp.net') && !contactosMap.has(chat.id)) {
        contactosMap.set(chat.id, {
          id: chat.id,
          nombre: chat.name || chat.id.split('@')[0],
          numero: chat.id.split('@')[0]
        })
      }
    }
    emitirContactos()
  })

  sockWA.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ WhatsApp vinculado correctamente.')
      panel.emit('worker:status', { sessionId: SESSION_ID, status: 'conectado' })
      setTimeout(emitirContactos, 3000)
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const razon = lastDisconnect?.error?.message || 'desconocida'
      console.log(`⚠️ Conexión con WhatsApp cerrada (código ${statusCode || '?'}): ${razon}`)
      panel.emit('worker:status', { sessionId: SESSION_ID, status: 'desconectado' })

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('🚫 La sesión fue cerrada/deslogueada desde el celular. Borra la carpeta "sesion_whatsapp" y vuelve a generar el código de vinculación.')
        return // no reintenta: con credenciales inválidas solo repetiría el mismo error
      }

      if (statusCode === DisconnectReason.restartRequired) {
        console.log('🔄 WhatsApp pidió reiniciar la conexión (normal justo después de vincular). Reintentando...')
      } else {
        console.log('⏳ Reintentando en 5s...')
      }
      setTimeout(iniciarWhatsApp, 5000)
    }
  })

  sockWA.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg || !msg.message || msg.key.fromMe) return

    const remitente = msg.key.remoteJid
    if (!remitente || remitente.endsWith('@g.us')) return // por seguridad, no autoresponde en grupos

    if (!ajustesContactos[remitente]) return
    if (!groqApiKey) return

    const texto = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    ).trim()
    if (!texto) return

    try {
      await sockWA.sendPresenceUpdate('composing', remitente)
      const respuesta = await consultarGroq(texto)
      if (respuesta) {
        await sockWA.sendMessage(remitente, { text: respuesta })
      }
    } catch (e) {
      console.log('Error respondiendo con IA:', e.message)
    }
  })
}

async function consultarGroq(mensajeUsuario) {
  try {
    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Eres un asistente que responde mensajes de WhatsApp de forma natural, breve, amable y en español.' },
          { role: 'user', content: mensajeUsuario }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    })
    if (!resp.ok) {
      console.log('Error Groq HTTP:', resp.status)
      return null
    }
    const datos = await resp.json()
    return datos?.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.log('Error al consultar Groq:', e.message)
    return null
  }
}

iniciarWhatsApp()

process.on('uncaughtException', err => console.error('Error no controlado:', err))
process.on('unhandledRejection', err => console.error('Promesa rechazada:', err))
