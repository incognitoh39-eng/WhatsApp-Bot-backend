<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>MyIABot.Js</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#080808">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
/* ============================================================
   MyIABot.Js — Design tokens
   ============================================================ */
:root{
  --bg:#080808;
  --bg-secondary:#101010;
  --panel:#141414;
  --panel-2:#191919;
  --gold:#D4AF37;
  --gold-light:#F5D76E;
  --gold-dark:#8F7420;
  --text:#FFFFFF;
  --muted:#A1A1A1;
  --border:rgba(212,175,55,0.15);
  --border-strong:rgba(212,175,55,0.3);
  --red:#E5484D;
  --red-dim:rgba(229,72,77,0.12);
  --green:#3DDC84;
  --green-dim:rgba(61,220,132,0.12);
  --radius:14px;
  --radius-sm:9px;
  --shadow-panel:0 8px 30px rgba(0,0,0,0.45);
  --ease:cubic-bezier(.22,1,.36,1);
}

*{box-sizing:border-box;}
html{-webkit-tap-highlight-color:transparent;}
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
  min-height:100dvh;
}
h1,h2,h3,.brand,.stat-value{font-family:'Manrope',system-ui,sans-serif;}
::selection{background:var(--gold-dark);color:#fff;}
a{color:inherit;}
button{font-family:inherit;}
input,textarea{font-family:inherit;}

::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.25);border-radius:8px;}
::-webkit-scrollbar-thumb:hover{background:rgba(212,175,55,0.4);}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;}
}

.oculto{display:none !important;}

/* ============================================================
   LOGIN
   ============================================================ */
.login-screen{
  min-height:100vh;min-height:100dvh;
  display:flex;align-items:center;justify-content:center;
  padding:24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(212,175,55,0.08), transparent 60%),
    var(--bg);
}
.login-card{
  width:100%;max-width:400px;
  background:linear-gradient(180deg, var(--panel), var(--bg-secondary));
  border:1px solid var(--border);
  border-radius:20px;
  padding:44px 34px 34px;
  text-align:center;
  box-shadow:var(--shadow-panel);
  animation:loginIn .6s var(--ease) both;
  position:relative;
  overflow:hidden;
}
.login-card::before{
  content:"";position:absolute;inset:-40% -10% auto -10%;height:60%;
  background:radial-gradient(circle, rgba(212,175,55,0.15), transparent 70%);
  pointer-events:none;
}
@keyframes loginIn{from{opacity:0;transform:translateY(14px) scale(.98);}to{opacity:1;transform:none;}}

.brand-mark{font-size:26px;font-weight:800;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--text);}
.brand-mark .spark{color:var(--gold);font-size:20px;line-height:1;}
.brand-sub{color:var(--muted);font-size:12.5px;letter-spacing:1.6px;text-transform:uppercase;margin-top:6px;margin-bottom:32px;}

.field-label{display:block;text-align:left;font-size:12.5px;color:var(--muted);margin-bottom:8px;letter-spacing:.3px;}
.login-input{
  width:100%;padding:14px 16px;border-radius:11px;
  border:1px solid var(--border);
  background:var(--bg-secondary);
  color:var(--text);font-size:17px;letter-spacing:3px;text-align:center;
  outline:none;transition:border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.login-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,0.12);}
.login-input::placeholder{letter-spacing:.4px;color:#555;}

.btn{
  border:none;cursor:pointer;border-radius:11px;font-weight:700;font-size:14.5px;
  padding:13px 18px;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  transition:transform .15s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease), opacity .2s;
  width:100%;
}
.btn:active{transform:scale(.98);}
.btn-gold{background:linear-gradient(180deg, var(--gold-light), var(--gold));color:#181205;box-shadow:0 6px 20px rgba(212,175,55,0.25);}
.btn-gold:hover{box-shadow:0 8px 26px rgba(212,175,55,0.38);}
.btn-ghost{background:var(--panel-2);color:var(--text);border:1px solid var(--border);}
.btn-ghost:hover{border-color:var(--border-strong);}
.btn-danger{background:rgba(229,72,77,0.12);color:#ff8b8e;border:1px solid rgba(229,72,77,0.3);}
.btn-danger:hover{background:rgba(229,72,77,0.2);}
.btn-sm{width:auto;padding:9px 14px;font-size:13px;}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.btn .spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(0,0,0,0.25);border-top-color:#181205;animation:spin .7s linear infinite;}
.btn-ghost .spinner, .btn-danger .spinner{border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;}
@keyframes spin{to{transform:rotate(360deg);}}

.login-msg{min-height:18px;margin-top:16px;font-size:13px;transition:color .2s;}
.login-msg.err{color:#ff8b8e;animation:shake .3s;}
.login-msg.ok{color:var(--green);}
@keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}

/* ============================================================
   APP SHELL
   ============================================================ */
.app-shell{display:flex;min-height:100vh;min-height:100dvh;}

.sidebar{
  width:250px;flex-shrink:0;
  background:var(--bg-secondary);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:40;
  transition:transform .32s var(--ease);
}
.sidebar-brand{padding:26px 22px 18px;border-bottom:1px solid var(--border);}
.sidebar-brand .brand-mark{justify-content:flex-start;font-size:19px;}
.sidebar-brand .brand-sub{margin:4px 0 0;text-align:left;font-size:10.5px;}

.nav-scroll{flex:1;overflow-y:auto;padding:14px 12px;}
.nav-group{margin-bottom:18px;}
.nav-group-title{font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;color:#5b5b5b;padding:0 10px;margin-bottom:6px;}
.nav-item{
  display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;
  color:var(--muted);font-size:14px;font-weight:500;cursor:pointer;
  border:1px solid transparent;
  transition:background .18s var(--ease), color .18s, border-color .18s;
  margin-bottom:2px;
}
.nav-item svg{width:17px;height:17px;flex-shrink:0;opacity:.8;}
.nav-item:hover{background:rgba(212,175,55,0.06);color:var(--text);}
.nav-item.active{background:rgba(212,175,55,0.1);color:var(--gold-light);border-color:var(--border);}
.nav-item.active svg{opacity:1;stroke:var(--gold-light);}

.sidebar-footer{padding:16px;border-top:1px solid var(--border);}
.session-box{font-size:11.5px;color:var(--muted);margin-bottom:10px;line-height:1.5;}
.session-box b{color:var(--text);display:block;font-size:12.5px;}

.sidebar-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:35;
  opacity:0;pointer-events:none;transition:opacity .25s var(--ease);
}
.sidebar-overlay.show{opacity:1;pointer-events:auto;}

.main{flex:1;margin-left:250px;display:flex;flex-direction:column;min-width:0;}

.topbar{
  height:64px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;
  padding:0 26px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.7);
  backdrop-filter:blur(8px);position:sticky;top:0;z-index:20;
}
.topbar-left{display:flex;align-items:center;gap:14px;}
.menu-btn{
  display:none;background:var(--panel-2);border:1px solid var(--border);color:var(--text);
  width:38px;height:38px;border-radius:9px;cursor:pointer;align-items:center;justify-content:center;
}
.topbar-title{font-weight:700;font-size:15.5px;}
.conn-pill{
  display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);
  background:var(--panel-2);border:1px solid var(--border);padding:7px 13px;border-radius:20px;
}

.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:#666;}
.dot-on{background:var(--gold-light);box-shadow:0 0 0 0 rgba(245,215,110,0.6);animation:dotPulseGold 2s infinite;}
.dot-off{background:var(--red);}
.dot-loading{background:#888;animation:dotPulseGray 1.1s infinite;}
@keyframes dotPulseGold{0%{box-shadow:0 0 0 0 rgba(245,215,110,0.5);}70%{box-shadow:0 0 0 7px rgba(245,215,110,0);}100%{box-shadow:0 0 0 0 rgba(245,215,110,0);}}
@keyframes dotPulseGray{0%,100%{opacity:1;}50%{opacity:.35;}}

.content{flex:1;padding:26px 30px 60px;max-width:1180px;width:100%;}

.view{display:none;animation:viewIn .35s var(--ease);}
.view.active{display:block;}
@keyframes viewIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}

.view-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap;}
.view-title{font-size:22px;font-weight:800;margin:0 0 4px;}
.view-desc{color:var(--muted);font-size:13.5px;margin:0;max-width:520px;}

/* ============================================================
   CARDS / GRID
   ============================================================ */
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit, minmax(210px,1fr));margin-bottom:22px;}
.card{
  background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);
  padding:18px 20px;transition:border-color .22s var(--ease), box-shadow .22s var(--ease), transform .22s var(--ease);
  position:relative;
}
.card:hover{border-color:var(--border-strong);box-shadow:0 0 0 1px rgba(212,175,55,0.06), 0 10px 26px rgba(0,0,0,0.35);}
.stat-label{font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:7px;}
.stat-value{font-size:22px;font-weight:700;display:flex;align-items:center;gap:8px;}
.stat-value.dim{color:#666;font-weight:500;}

.panel{
  background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);
  padding:22px;margin-bottom:20px;
}
.panel-title{font-size:15px;font-weight:700;margin:0 0 6px;}
.panel-sub{color:var(--muted);font-size:13px;margin:0 0 16px;line-height:1.6;}

.empty-note{
  border:1px dashed var(--border-strong);border-radius:var(--radius-sm);
  padding:16px 18px;color:var(--muted);font-size:13px;line-height:1.6;background:rgba(212,175,55,0.03);
}
.empty-note b{color:var(--gold-light);}

.skeleton{background:linear-gradient(90deg, var(--panel-2) 25%, #222 37%, var(--panel-2) 63%);background-size:400% 100%;animation:shimmer 1.4s ease infinite;border-radius:8px;}
@keyframes shimmer{0%{background-position:100% 0;}100%{background-position:0 0;}}
.skel-row{height:52px;margin-bottom:10px;border-radius:10px;}

/* ============================================================
   BADGES / SWITCHES
   ============================================================ */
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:700;}
.badge.on{background:var(--green-dim);color:var(--green);}
.badge.off{background:var(--red-dim);color:#ff8b8e;}
.badge.wait{background:rgba(255,255,255,0.06);color:var(--muted);}

.switch{position:relative;display:inline-block;width:44px;height:25px;flex-shrink:0;}
.switch input{opacity:0;width:0;height:0;position:absolute;}
.switch-track{
  position:absolute;inset:0;background:#2a2a2a;border-radius:20px;cursor:pointer;
  transition:background .25s var(--ease);border:1px solid var(--border);
}
.switch-track::before{
  content:"";position:absolute;width:19px;height:19px;left:2px;top:2px;background:#ccc;border-radius:50%;
  transition:transform .25s var(--ease), background .25s var(--ease);
}
.switch input:checked + .switch-track{background:var(--gold-dark);border-color:var(--gold);}
.switch input:checked + .switch-track::before{transform:translateX(19px);background:var(--gold-light);}
.switch input:focus-visible + .switch-track{box-shadow:0 0 0 3px rgba(212,175,55,0.25);}
.switch input:disabled + .switch-track{opacity:.5;cursor:not-allowed;}

/* ============================================================
   LISTS: contactos / grupos
   ============================================================ */
.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center;}
.search-box{
  position:relative;flex:1;min-width:200px;
}
.search-box svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--muted);}
.search-box input{
  width:100%;padding:11px 14px 11px 38px;border-radius:10px;border:1px solid var(--border);
  background:var(--bg-secondary);color:var(--text);font-size:13.5px;outline:none;
  transition:border-color .2s;
}
.search-box input:focus{border-color:var(--gold);}
.chip-group{display:flex;gap:6px;flex-wrap:wrap;}
.chip{
  padding:8px 14px;border-radius:20px;font-size:12.5px;font-weight:600;color:var(--muted);
  background:var(--panel-2);border:1px solid var(--border);cursor:pointer;transition:all .18s var(--ease);
  white-space:nowrap;
}
.chip.active{background:rgba(212,175,55,0.12);color:var(--gold-light);border-color:var(--border-strong);}

.list{display:flex;flex-direction:column;gap:10px;}
.list-item{
  display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;
  background:var(--panel);border:1px solid var(--border);transition:border-color .2s var(--ease), transform .2s var(--ease);
}
.list-item:hover{border-color:var(--border-strong);}
.avatar{
  width:40px;height:40px;border-radius:11px;background:var(--panel-2);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gold-light);
}
.avatar svg{width:19px;height:19px;}
.item-info{flex:1;min-width:0;}
.item-name{font-weight:600;font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.item-sub{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.item-right{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.item-status-text{font-size:11.5px;color:var(--muted);}

/* ============================================================
   CHAT PROBAR BOT
   ============================================================ */
.chat-shell{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--panel);}
.chat-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg-secondary);}
.chat-head-left{display:flex;align-items:center;gap:10px;font-weight:700;font-size:14px;}
.chat-body{height:400px;max-height:52vh;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;background:
  radial-gradient(circle at 20% 0%, rgba(212,175,55,0.03), transparent 50%);}
.msg-row{display:flex;flex-direction:column;max-width:78%;animation:msgIn .28s var(--ease);}
@keyframes msgIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.msg-row.user{align-self:flex-end;align-items:flex-end;}
.msg-row.bot{align-self:flex-start;align-items:flex-start;}
.msg-bubble{padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;}
.msg-row.user .msg-bubble{background:linear-gradient(180deg, var(--gold-light), var(--gold));color:#181205;border-bottom-right-radius:4px;font-weight:500;}
.msg-row.bot .msg-bubble{background:var(--panel-2);border:1px solid var(--border);border-bottom-left-radius:4px;}
.msg-time{font-size:10.5px;color:#666;margin-top:4px;padding:0 4px;}
.typing-dots{display:flex;gap:4px;padding:12px 14px;background:var(--panel-2);border:1px solid var(--border);border-radius:14px;border-bottom-left-radius:4px;width:fit-content;}
.typing-dots span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:typingBounce 1.1s infinite;}
.typing-dots span:nth-child(2){animation-delay:.15s;}
.typing-dots span:nth-child(3){animation-delay:.3s;}
@keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-4px);opacity:1;}}
.chat-foot{display:flex;gap:10px;padding:14px 16px;border-top:1px solid var(--border);background:var(--bg-secondary);align-items:flex-end;}
.chat-foot textarea{
  flex:1;resize:none;max-height:110px;border-radius:12px;border:1px solid var(--border);
  background:var(--panel);color:var(--text);padding:11px 14px;font-size:13.5px;outline:none;font-family:inherit;
  transition:border-color .2s;line-height:1.5;
}
.chat-foot textarea:focus{border-color:var(--gold);}
.send-btn{
  width:42px;height:42px;flex-shrink:0;border-radius:12px;border:none;cursor:pointer;
  background:linear-gradient(180deg, var(--gold-light), var(--gold));color:#181205;
  display:flex;align-items:center;justify-content:center;transition:transform .15s, opacity .2s;
}
.send-btn:active{transform:scale(.92);}
.send-btn:disabled{opacity:.4;cursor:not-allowed;}
.chat-note{font-size:11.5px;color:#666;padding:10px 18px 0;}

/* ============================================================
   MODALES / TOASTS
   ============================================================ */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);
  display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;
  opacity:0;animation:overlayIn .22s var(--ease) forwards;
}
@keyframes overlayIn{to{opacity:1;}}
.modal-overlay.closing{animation:overlayOut .18s var(--ease) forwards;}
@keyframes overlayOut{to{opacity:0;}}
.modal-box{
  background:var(--panel);border:1px solid var(--border-strong);border-radius:16px;
  padding:26px;max-width:380px;width:100%;box-shadow:var(--shadow-panel);
  transform:translateY(10px) scale(.97);opacity:0;animation:modalIn .28s var(--ease) forwards;
}
@keyframes modalIn{to{transform:none;opacity:1;}}
.modal-overlay.closing .modal-box{animation:modalOut .18s var(--ease) forwards;}
@keyframes modalOut{to{transform:translateY(6px) scale(.97);opacity:0;}}
.modal-title{font-size:16.5px;font-weight:800;margin:0 0 10px;}
.modal-body{font-size:13.5px;color:var(--muted);line-height:1.6;margin:0 0 22px;}
.modal-actions{display:flex;gap:10px;}
.modal-actions .btn{width:auto;flex:1;}

.toast-container{
  position:fixed;top:18px;right:18px;z-index:200;display:flex;flex-direction:column;gap:10px;
  max-width:min(340px, calc(100vw - 32px));
}
.toast{
  background:var(--panel);border:1px solid var(--border-strong);border-radius:11px;
  padding:13px 16px;font-size:13px;display:flex;align-items:center;gap:10px;box-shadow:var(--shadow-panel);
  animation:toastIn .3s var(--ease);
}
.toast.leaving{animation:toastOut .25s var(--ease) forwards;}
@keyframes toastIn{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:none;}}
@keyframes toastOut{to{opacity:0;transform:translateX(24px);}}
.toast.ok{border-left:3px solid var(--green);}
.toast.err{border-left:3px solid var(--red);}
.toast.warn{border-left:3px solid var(--gold);}
@media (max-width:640px){
  .toast-container{top:auto;bottom:18px;right:12px;left:12px;max-width:none;}
}

/* ============================================================
   FORMS shared
   ============================================================ */
.form-group{margin-bottom:16px;}
.form-label{display:block;font-size:12.5px;color:var(--muted);margin-bottom:7px;}
.form-input{
  width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);
  background:var(--bg-secondary);color:var(--text);font-size:13.5px;outline:none;transition:border-color .2s;
}
.form-input:focus{border-color:var(--gold);}
.row-actions{display:flex;gap:10px;flex-wrap:wrap;}
.row-actions .btn{width:auto;}

.config-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border);gap:16px;}
.config-row:last-child{border-bottom:none;}
.config-row-text b{display:block;font-size:13.5px;margin-bottom:2px;}
.config-row-text span{font-size:12px;color:var(--muted);}

.activity-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;}
.activity-item:last-child{border-bottom:none;}
.activity-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);margin-top:6px;flex-shrink:0;}
.activity-text b{display:block;font-size:13px;}
.activity-text span{color:#666;font-size:11.5px;}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width:900px){
  .sidebar{transform:translateX(-100%);}
  .sidebar.open{transform:translateX(0);}
  .main{margin-left:0;}
  .menu-btn{display:flex;}
  .content{padding:20px 16px 50px;}
  .topbar{padding:0 16px;}
}
@media (max-width:520px){
  .view-title{font-size:19px;}
  .toolbar{flex-direction:column;align-items:stretch;}
  .chip-group{overflow-x:auto;padding-bottom:2px;}
  .grid{grid-template-columns:1fr 1fr;}
  .modal-actions{flex-direction:column;}
}
</style>
</head>
<body>

<!-- ============================================================
     LOGIN
     ============================================================ -->
<div class="login-screen" id="loginView">
  <div class="login-card">
    <div class="brand-mark"><span class="spark">✦</span> MyIABot.Js</div>
    <div class="brand-sub">AI WhatsApp Assistant</div>

    <label class="field-label" for="codigo">Código de acceso</label>
    <input class="login-input" id="codigo" type="text" placeholder="• • • • • •" maxlength="6" inputmode="numeric" autocomplete="one-time-code">

    <div style="height:16px"></div>
    <button class="btn btn-gold" id="btnLogin" onclick="login()">
      <span class="btn-label">Ingresar</span>
    </button>
    <div id="resultadoLogin" class="login-msg"></div>
  </div>
</div>

<!-- ============================================================
     APP SHELL
     ============================================================ -->
<div class="app-shell oculto" id="appView">

  <div class="sidebar-overlay" id="sidebarOverlay" onclick="cerrarSidebarMovil()"></div>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark"><span class="spark">✦</span> MyIABot.Js</div>
      <div class="brand-sub">AI WhatsApp Assistant</div>
    </div>

    <nav class="nav-scroll">
      <div class="nav-group">
        <div class="nav-group-title">General</div>
        <div class="nav-item" data-seccion="dashboard" onclick="cambiarSeccion('dashboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
          Dashboard
        </div>
        <div class="nav-item" data-seccion="probar" onclick="cambiarSeccion('probar')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          Probar Bot
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">Bot</div>
        <div class="nav-item" data-seccion="contactos" onclick="cambiarSeccion('contactos')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Contactos
        </div>
        <div class="nav-item" data-seccion="grupos" onclick="cambiarSeccion('grupos')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Grupos
        </div>
        <div class="nav-item" data-seccion="memoria" onclick="cambiarSeccion('memoria')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>
          Memoria
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">IA</div>
        <div class="nav-item" data-seccion="groq" onclick="cambiarSeccion('groq')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>
          Groq API
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-group-title">Sistema</div>
        <div class="nav-item" data-seccion="config" onclick="cambiarSeccion('config')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Configuración
        </div>
        <div class="nav-item" data-seccion="estado" onclick="cambiarSeccion('estado')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Estado
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="session-box">
        <b>Sesión activa</b>
        Código/token protegido
      </div>
      <button class="btn btn-ghost btn-sm" style="width:100%" onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-btn" onclick="abrirSidebarMovil()" aria-label="Abrir menú">☰</button>
        <span class="topbar-title">MyIABot.Js</span>
      </div>
      <div class="conn-pill">
        <span class="dot dot-loading" id="topbarDot"></span>
        <span id="topbarEstadoTexto">Conectando…</span>
      </div>
    </header>

    <main class="content">

      <!-- DASHBOARD ================================================= -->
      <section class="view active" id="sec-dashboard">
        <div class="view-header">
          <div>
            <h2 class="view-title">Dashboard</h2>
            <p class="view-desc">Resumen general del estado y actividad de MyIABot.Js.</p>
          </div>
          <button class="btn btn-ghost btn-sm" id="btnRefrescar" onclick="actualizarTodo()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            <span id="btnRefrescarLabel">Actualizar</span>
          </button>
        </div>

        <div class="grid">
          <div class="card">
            <div class="stat-label">Estado del bot</div>
            <div class="stat-value" id="dashEstado"><span class="dot dot-loading"></span> —</div>
          </div>
          <div class="card">
            <div class="stat-label">Número</div>
            <div class="stat-value" id="dashNumero">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Tiempo activo</div>
            <div class="stat-value" id="dashUptime">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Conversaciones</div>
            <div class="stat-value" id="dashConversaciones">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Groq</div>
            <div class="stat-value" id="dashGroq">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Contactos permitidos</div>
            <div class="stat-value dim" id="dashContactos">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Grupos activos</div>
            <div class="stat-value dim" id="dashGrupos">—</div>
          </div>
          <div class="card">
            <div class="stat-label">Mensajes procesados</div>
            <div class="stat-value dim" id="dashMensajesProcesados">—</div>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">Actividad reciente</h3>
          <p class="panel-sub">Últimos eventos del bot: mensajes recibidos, respuestas enviadas y cambios de configuración.</p>
          <div id="actividadContenido">
            <div class="skeleton skel-row"></div>
            <div class="skeleton skel-row"></div>
            <div class="skeleton skel-row"></div>
          </div>
        </div>
      </section>

      <!-- CONTACTOS ================================================= -->
      <section class="view" id="sec-contactos">
        <div class="view-header">
          <div>
            <h2 class="view-title">Contactos</h2>
            <p class="view-desc">Controla individualmente qué contactos pueden recibir respuestas automáticas de MyIABot.Js. Solo se muestran contactos con actividad en el último mes.</p>
          </div>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" id="buscarContacto" placeholder="Buscar contacto..." oninput="filtrarContactos()">
          </div>
          <div class="chip-group" id="filtroContactos">
            <div class="chip active" data-filtro="todos" onclick="setFiltroContactos('todos')">Todos</div>
            <div class="chip" data-filtro="activos" onclick="setFiltroContactos('activos')">Activos</div>
            <div class="chip" data-filtro="desactivados" onclick="setFiltroContactos('desactivados')">Desactivados</div>
          </div>
        </div>

        <div id="contactosContenido">
          <div class="skeleton skel-row"></div>
          <div class="skeleton skel-row"></div>
          <div class="skeleton skel-row"></div>
        </div>
      </section>

      <!-- GRUPOS ===================================================== -->
      <section class="view" id="sec-grupos">
        <div class="view-header">
          <div>
            <h2 class="view-title">Grupos</h2>
            <p class="view-desc">Decide si MyIABot.Js puede responder en grupos y en cuáles específicamente.</p>
          </div>
        </div>

        <div class="panel" style="margin-bottom:16px;">
          <div class="config-row" style="border-bottom:none;padding:0;">
            <div class="config-row-text">
              <b>Responder en grupos</b>
              <span>Habilita globalmente las respuestas del bot en chats grupales.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggleGruposGlobal" onchange="cambiarGruposGlobal(this.checked)">
              <span class="switch-track"></span>
            </label>
          </div>
        </div>

        <div id="gruposDetalle"></div>
      </section>

      <!-- MEMORIA ==================================================== -->
      <section class="view" id="sec-memoria">
        <div class="view-header">
          <div>
            <h2 class="view-title">Memoria de conversaciones</h2>
            <p class="view-desc">MyIABot.Js utiliza el contexto reciente de cada chat para responder con coherencia.</p>
          </div>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
          <div class="card">
            <div class="stat-label">Conversaciones guardadas</div>
            <div class="stat-value" id="memoriaTotal">—</div>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">Borrar historial</h3>
          <p class="panel-sub">Elimina la memoria de todas las conversaciones. Esta acción no se puede deshacer. También puedes escribir <b style="color:var(--gold-light)">/reset</b> desde WhatsApp para borrar solo una conversación puntual.</p>
          <button class="btn btn-danger btn-sm" onclick="confirmarBorrarHistorial()">Borrar todo el historial</button>
        </div>
      </section>

      <!-- GROQ ======================================================= -->
      <section class="view" id="sec-groq">
        <div class="view-header">
          <div>
            <h2 class="view-title">Groq API</h2>
            <p class="view-desc">Conecta MyIABot.Js con Groq para habilitar las respuestas inteligentes del bot.</p>
          </div>
        </div>

        <div class="panel" style="max-width:460px;">
          <div class="config-row">
            <div class="config-row-text"><b>Estado</b><span>Vinculación actual con Groq</span></div>
            <span class="badge wait" id="groqBadge">—</span>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <label class="form-label" for="apiKey">API Key</label>
            <input class="form-input" id="apiKey" type="password" placeholder="gsk_••••••••••••••••">
          </div>

          <div class="row-actions">
            <button class="btn btn-gold btn-sm" id="btnVincularGroq" onclick="vincularGroq()">Vincular API Key</button>
            <button class="btn btn-danger btn-sm oculto" id="btnDesvincular" onclick="confirmarDesvincularGroq()">Desvincular</button>
          </div>
        </div>
      </section>

      <!-- PROBAR BOT ================================================= -->
      <section class="view" id="sec-probar">
        <div class="view-header">
          <div>
            <h2 class="view-title">Probar Bot</h2>
            <p class="view-desc">Conversa con MyIABot.Js directamente desde el panel, sin usar WhatsApp.</p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="limpiarConversacionPrueba()">Limpiar conversación</button>
        </div>

        <div class="chat-shell">
          <div class="chat-head">
            <div class="chat-head-left">
              <span>MyIABot.Js</span>
            </div>
            <span class="badge on"><span class="dot dot-on" style="background:#181205"></span> IA</span>
          </div>
          <div class="chat-body" id="chatBody"></div>
          <div class="chat-foot">
            <textarea id="chatInput" rows="1" placeholder="Escribe un mensaje..." onkeydown="manejarTeclaChat(event)"></textarea>
            <button class="send-btn" id="btnEnviarChat" onclick="enviarMensajeChat()" aria-label="Enviar mensaje">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
        <div class="chat-note">Esta prueba no afecta las conversaciones reales de WhatsApp.</div>
      </section>

      <!-- CONFIGURACIÓN ============================================= -->
      <section class="view" id="sec-config">
        <div class="view-header">
          <div>
            <h2 class="view-title">Configuración</h2>
            <p class="view-desc">Ajustes generales de comportamiento de MyIABot.Js.</p>
          </div>
        </div>

        <div class="panel" style="max-width:560px;">
          <div class="config-row">
            <div class="config-row-text"><b>Responder a contactos</b><span>Controlado individualmente en la sección Contactos</span></div>
            <span class="badge wait">Ver Contactos</span>
          </div>
          <div class="config-row">
            <div class="config-row-text"><b>Responder en grupos</b><span>Controlado en la sección Grupos</span></div>
            <span class="badge wait" id="cfgGruposBadge">—</span>
          </div>
          <div class="config-row">
            <div class="config-row-text"><b>Memoria de conversaciones</b><span>Contexto reciente por cada chat</span></div>
            <span class="badge on" id="cfgMemoriaBadge">Activa</span>
          </div>
          <div class="config-row">
            <div class="config-row-text"><b>Actualización automática</b><span>Refresca el estado del bot cada 5 segundos</span></div>
            <label class="switch">
              <input type="checkbox" id="toggleAutoUpdate" checked onchange="toggleAutoUpdate(this.checked)">
              <span class="switch-track"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- ESTADO ===================================================== -->
      <section class="view" id="sec-estado">
        <div class="view-header">
          <div>
            <h2 class="view-title">Estado</h2>
            <p class="view-desc">Información técnica de conexión y sesión del bot.</p>
          </div>
        </div>

        <div class="panel" style="max-width:480px;">
          <div class="config-row"><div class="config-row-text"><b>Conexión</b></div><span class="badge wait" id="estConexion">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Número</b></div><span id="estNumero">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Uptime</b></div><span id="estUptime">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Groq</b></div><span class="badge wait" id="estGroq">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Conversaciones</b></div><span id="estConversaciones">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Contactos</b></div><span id="estContactos">—</span></div>
          <div class="config-row"><div class="config-row-text"><b>Grupos</b></div><span id="estGrupos">—</span></div>
        </div>
      </section>

    </main>
  </div>
</div>

<div id="modalRoot"></div>
<div class="toast-container" id="toastContainer"></div>

<script>
/* ================================================================
   ESTADO GLOBAL
   ================================================================ */
const appState = {
  token: localStorage.getItem('token') || null,
  estado: null,
  contactos: [],
  contactosDisponibles: false,
  filtroContactos: 'todos',
  grupos: [],
  gruposDisponibles: false,
  gruposActivadosGlobal: false,
  filtroGrupos: 'todos',
  seccionActual: 'dashboard',
  pollingId: null,
  autoUpdate: true,
  chatHistorial: []
};

/* ================================================================
   API — capa centralizada de peticiones
   ================================================================ */
async function apiFetch(endpoint, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  if (appState.token) headers['Authorization'] = `Bearer ${appState.token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  let resp;
  try {
    resp = await fetch(endpoint, Object.assign({}, options, { headers }));
  } catch (e) {
    throw { tipo: 'red', mensaje: 'No se pudo conectar con el servidor.' };
  }

  if (resp.status === 401) {
    cerrarSesion();
    throw { tipo: '401', mensaje: 'Sesión expirada.' };
  }
  if (resp.status === 404) {
    throw { tipo: '404', mensaje: 'Endpoint no disponible.', status: 404 };
  }
  if (resp.status >= 500) {
    throw { tipo: '500', mensaje: 'Error interno del servidor.', status: resp.status };
  }

  let datos;
  try {
    datos = await resp.json();
  } catch (e) {
    throw { tipo: 'json', mensaje: 'Respuesta inválida del servidor.' };
  }

  if (!resp.ok) {
    throw { tipo: 'http', mensaje: datos.mensaje || 'Ocurrió un error.', status: resp.status };
  }

  return datos;
}

/* ================================================================
   TOASTS
   ================================================================ */
function mostrarToast(mensaje, tipo = 'ok') {
  const cont = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  const icono = tipo === 'ok' ? '✓' : tipo === 'err' ? '✕' : '⚠️';
  el.innerHTML = `<span>${icono}</span><span></span>`;
  el.querySelector('span:last-child').textContent = mensaje;
  cont.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

/* ================================================================
   MODALES
   ================================================================ */
function mostrarModal({ titulo, cuerpo, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', peligro = false, onConfirmar }) {
  const root = document.getElementById('modalRoot');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-title">${titulo}</h3>
      <p class="modal-body">${cuerpo}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-accion="cancelar">${textoCancelar}</button>
        <button class="btn ${peligro ? 'btn-danger' : 'btn-gold'}" data-accion="confirmar">${textoConfirmar}</button>
      </div>
    </div>`;
  root.appendChild(overlay);

  function cerrar() {
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
  overlay.querySelector('[data-accion="cancelar"]').addEventListener('click', cerrar);
  overlay.querySelector('[data-accion="confirmar"]').addEventListener('click', () => {
    cerrar();
    if (onConfirmar) onConfirmar();
  });
}

/* ================================================================
   NAVEGACIÓN SPA / UI
   ================================================================ */
function cambiarSeccion(nombre) {
  appState.seccionActual = nombre;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`sec-${nombre}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.seccion === nombre));
  cerrarSidebarMovil();

  if (nombre === 'dashboard') cargarActividadReciente();
  if (nombre === 'contactos') cargarContactos();
  if (nombre === 'grupos') cargarGrupos();
  if (nombre === 'probar' && appState.chatHistorial.length === 0) inicializarChat();
}

function abrirSidebarMovil() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}
function cerrarSidebarMovil() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

function setBotonCargando(btn, cargando, textoCargando) {
  if (!btn) return;
  if (cargando) {
    btn.dataset.original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span><span>${textoCargando}</span>`;
  } else {
    btn.disabled = false;
    if (btn.dataset.original) btn.innerHTML = btn.dataset.original;
  }
}

/* ================================================================
   UTILIDAD: tiempo relativo ("hace 3 min", "hace 2 h", "hace 5 d")
   ================================================================ */
function formatTiempoRelativo(timestamp) {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const seg = Math.floor(diffMs / 1000);
  if (seg < 60) return 'hace unos segundos';
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

/* ================================================================
   AUTH / LOGIN
   ================================================================ */
async function login() {
  const codigo = document.getElementById('codigo').value.trim();
  const resultado = document.getElementById('resultadoLogin');
  const btn = document.getElementById('btnLogin');

  if (!codigo) {
    resultado.textContent = 'Escribe el código de acceso.';
    resultado.className = 'login-msg err';
    return;
  }

  resultado.textContent = '';
  resultado.className = 'login-msg';
  setBotonCargando(btn, true, 'Verificando...');

  try {
    const datos = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ codigo })
    });
    if (datos.ok) {
      appState.token = datos.token;
      localStorage.setItem('token', appState.token);
      mostrarPanel();
    } else {
      resultado.textContent = datos.mensaje || 'Código incorrecto.';
      resultado.className = 'login-msg err';
    }
  } catch (e) {
    resultado.textContent = e.mensaje || 'Error de conexión con el bot.';
    resultado.className = 'login-msg err';
  } finally {
    setBotonCargando(btn, false);
  }
}

function mostrarPanel() {
  document.getElementById('loginView').classList.add('oculto');
  document.getElementById('appView').classList.remove('oculto');
  cambiarSeccion('dashboard');
  cargarEstado();
  cargarActividadReciente();
  iniciarPolling();
}

function mostrarLogin() {
  document.getElementById('appView').classList.add('oculto');
  document.getElementById('loginView').classList.remove('oculto');
  detenerPolling();
}

function cerrarSesion() {
  localStorage.removeItem('token');
  appState.token = null;
  mostrarLogin();
}

// Autologin: si hay token guardado, se intenta abrir el panel.
// cargarEstado() se encarga de validar el token (401 -> cerrarSesion()).
if (appState.token) {
  mostrarPanel();
}

/* ================================================================
   POLLING CENTRALIZADO (un único intervalo para todo el panel)
   ================================================================ */
function iniciarPolling() {
  detenerPolling();
  appState.pollingId = setInterval(() => {
    if (appState.autoUpdate) {
      cargarEstado();
      if (appState.seccionActual === 'dashboard') cargarActividadReciente();
    }
  }, 5000);
}
function detenerPolling() {
  if (appState.pollingId) {
    clearInterval(appState.pollingId);
    appState.pollingId = null;
  }
}
function toggleAutoUpdate(activo) {
  appState.autoUpdate = activo;
}

/* ================================================================
   DASHBOARD / ESTADO
   ================================================================ */
async function cargarEstado() {
  if (!appState.token) return;
  try {
    const datos = await apiFetch('/api/estado');
    if (!datos.ok) return;
    appState.estado = datos;
    pintarEstado(datos);
  } catch (e) {
    // errores de red silenciosos durante el polling; 401 ya redirige al login
  }
}

function pintarEstado(datos) {
  const conectado = !!datos.conectado;

  // Topbar
  document.getElementById('topbarDot').className = 'dot ' + (conectado ? 'dot-on' : 'dot-off');
  document.getElementById('topbarEstadoTexto').textContent = conectado ? 'Bot conectado' : 'Bot desconectado';

  // Dashboard
  document.getElementById('dashEstado').innerHTML =
    `<span class="dot ${conectado ? 'dot-on' : 'dot-off'}"></span> ${conectado ? 'Conectado' : 'Desconectado'}`;
  document.getElementById('dashNumero').textContent = datos.numero || '—';
  document.getElementById('dashUptime').textContent = datos.uptime || '—';
  document.getElementById('dashConversaciones').textContent = datos.conversacionesGuardadas ?? '—';
  document.getElementById('dashGroq').innerHTML =
    `<span class="badge ${datos.groqVinculado ? 'on' : 'off'}">${datos.groqVinculado ? 'Vinculada' : 'No vinculada'}</span>`;
  document.getElementById('dashContactos').textContent = appState.contactosDisponibles
    ? appState.contactos.filter(c => c.botActivo).length : '—';
  document.getElementById('dashGrupos').textContent = appState.gruposDisponibles
    ? appState.grupos.filter(g => g.botActivo).length : '—';

  // Sección Estado
  document.getElementById('estConexion').className = 'badge ' + (conectado ? 'on' : 'off');
  document.getElementById('estConexion').textContent = conectado ? 'Conectado' : 'Desconectado';
  document.getElementById('estNumero').textContent = datos.numero || '—';
  document.getElementById('estUptime').textContent = datos.uptime || '—';
  document.getElementById('estGroq').className = 'badge ' + (datos.groqVinculado ? 'on' : 'off');
  document.getElementById('estGroq').textContent = datos.groqVinculado ? 'Conectado' : 'Desconectado';
  document.getElementById('estConversaciones').textContent = datos.conversacionesGuardadas ?? '—';
  document.getElementById('estContactos').textContent = appState.contactosDisponibles ? appState.contactos.length : '—';
  document.getElementById('estGrupos').textContent = appState.gruposDisponibles ? appState.grupos.length : '—';

  // Memoria
  document.getElementById('memoriaTotal').textContent = datos.conversacionesGuardadas ?? '—';

  // Groq sección
  const groqBadge = document.getElementById('groqBadge');
  groqBadge.className = 'badge ' + (datos.groqVinculado ? 'on' : 'off');
  groqBadge.textContent = datos.groqVinculado ? 'Vinculada' : 'No vinculada';
  document.getElementById('btnDesvincular').classList.toggle('oculto', !datos.groqVinculado);
  const apiKeyInput = document.getElementById('apiKey');
  apiKeyInput.placeholder = datos.groqVinculado ? `Vinculada: ${datos.groqKeyParcial}` : 'gsk_••••••••••••••••';
}

async function actualizarTodo() {
  const btn = document.getElementById('btnRefrescar');
  const label = document.getElementById('btnRefrescarLabel');
  label.textContent = 'Actualizando...';
  btn.disabled = true;
  await Promise.all([
    cargarEstado(),
    cargarActividadReciente(),
    appState.seccionActual === 'contactos' || true ? cargarContactos(true) : null,
    cargarGrupos(true)
  ]);
  label.textContent = 'Actualizado';
  setTimeout(() => { label.textContent = 'Actualizar'; btn.disabled = false; }, 1200);
}

/* ================================================================
   ACTIVIDAD RECIENTE (dashboard)
   ================================================================
   Consume GET /api/actividad -> { ok:true, actividad:[{ tipo, detalle, timestamp }] }
*/
const ETIQUETAS_ACTIVIDAD = {
  mensaje_privado: 'Mensaje recibido',
  respuesta_privada: 'Respuesta enviada',
  mensaje_grupo: 'Mensaje en grupo',
  respuesta_grupo: 'Respuesta en grupo',
  contacto_activado: 'Contacto activado',
  contacto_desactivado: 'Contacto desactivado',
  grupo_activado: 'Grupo activado',
  grupo_desactivado: 'Grupo desactivado',
  grupos_global: 'Grupos (global)',
  groq_vinculado: 'Groq vinculado',
  groq_desvinculado: 'Groq desvinculado',
  historial_borrado: 'Historial borrado',
  reset_chat: 'Conversación reiniciada'
};

async function cargarActividadReciente() {
  const cont = document.getElementById('actividadContenido');
  try {
    const datos = await apiFetch('/api/actividad?limite=15');
    renderActividadReciente(datos.actividad || []);
  } catch (e) {
    if (e.tipo === '404') {
      cont.innerHTML = `<div class="empty-note">Esta función requiere el endpoint <b>GET /api/actividad</b> en el backend.</div>`;
    }
    // otros errores (red, 500) durante el polling se ignoran en silencio
  }
}

function renderActividadReciente(eventos) {
  const cont = document.getElementById('actividadContenido');
  if (!eventos || eventos.length === 0) {
    cont.innerHTML = `<div class="empty-note">Todavía no hay actividad registrada. Aparecerá aquí en cuanto el bot reciba o responda un mensaje.</div>`;
    return;
  }

  cont.innerHTML = eventos.map(ev => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-text">
        <b>${escaparTexto(ETIQUETAS_ACTIVIDAD[ev.tipo] || 'Evento')}</b>
        <span>${escaparTexto(ev.detalle || '')} · ${formatTiempoRelativo(ev.timestamp)}</span>
      </div>
    </div>`).join('');
}

/* ================================================================
   CONTACTOS
   ================================================================
   Espera del backend: GET /api/contactos ->
   { ok:true, contactos:[{ id, nombre, numero, avatar, botActivo, ultimaActividad }] }
   Solo incluye contactos con actividad en el último mes (filtrado en backend).
*/
async function cargarContactos(silencioso = false) {
  const cont = document.getElementById('contactosContenido');
  if (!silencioso) {
    cont.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;
  }
  try {
    const datos = await apiFetch('/api/contactos');
    appState.contactos = datos.contactos || [];
    appState.contactosDisponibles = true;
    renderContactos();
  } catch (e) {
    appState.contactosDisponibles = false;
    cont.innerHTML = `<div class="empty-note">Esta función requiere el endpoint <b>GET /api/contactos</b> en el backend. Cuando esté disponible, los contactos aparecerán aquí automáticamente.</div>`;
  }
}

function filtrarContactos() { renderContactos(); }
function setFiltroContactos(f) {
  appState.filtroContactos = f;
  document.querySelectorAll('#filtroContactos .chip').forEach(c => c.classList.toggle('active', c.dataset.filtro === f));
  renderContactos();
}

function renderContactos() {
  const cont = document.getElementById('contactosContenido');
  if (!appState.contactosDisponibles) return;

  const q = (document.getElementById('buscarContacto').value || '').toLowerCase().trim();
  let lista = appState.contactos.filter(c => {
    const coincideTexto = !q || c.nombre.toLowerCase().includes(q) || (c.numero || '').includes(q);
    const coincideFiltro =
      appState.filtroContactos === 'todos' ||
      (appState.filtroContactos === 'activos' && c.botActivo) ||
      (appState.filtroContactos === 'desactivados' && !c.botActivo);
    return coincideTexto && coincideFiltro;
  });

  if (lista.length === 0) {
    cont.innerHTML = `<div class="empty-note">No se encontraron contactos recientes con ese criterio. Solo se muestran contactos con actividad en el último mes.</div>`;
    return;
  }

  cont.innerHTML = `<div class="list">${lista.map(c => `
    <div class="list-item">
      <div class="avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg></div>
      <div class="item-info">
        <div class="item-name">${escaparTexto(c.nombre)}</div>
        <div class="item-sub">${escaparTexto(c.numero || '')} · ${formatTiempoRelativo(c.ultimaActividad)}</div>
      </div>
      <div class="item-right">
        <span class="item-status-text">${c.botActivo ? 'Activado' : 'Desactivado'}</span>
        <label class="switch">
          <input type="checkbox" ${c.botActivo ? 'checked' : ''} onchange="guardarConfigContacto('${c.id}', this.checked)">
          <span class="switch-track"></span>
        </label>
      </div>
    </div>`).join('')}</div>`;
}

async function guardarConfigContacto(contactoId, activo) {
  mostrarToast('Guardando...', 'warn');
  try {
    const datos = await apiFetch('/api/contactos/configurar', {
      method: 'POST',
      body: JSON.stringify({ contactoId, activo })
    });
    const c = appState.contactos.find(x => x.id === contactoId);
    if (c) c.botActivo = activo;
    mostrarToast(datos.mensaje || 'Configuración actualizada', 'ok');
    cargarActividadReciente();
  } catch (e) {
    mostrarToast('No se pudo actualizar', 'err');
    renderContactos(); // revierte el switch visualmente
  }
}

/* ================================================================
   GRUPOS
   ================================================================
   Espera del backend:
   GET /api/grupos -> { ok:true, grupos:[{ id, nombre, avatar, botActivo }] }
   GET /api/configuracion-grupos -> { ok:true, gruposActivados:boolean }
   POST /api/configurar-grupos -> body { grupoId, activo } | { global:true, activo }
*/
async function cargarGrupos(silencioso = false) {
  const cont = document.getElementById('gruposDetalle');
  if (!silencioso) cont.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  try {
    const configGlobal = await apiFetch('/api/configuracion-grupos');
    appState.gruposActivadosGlobal = !!configGlobal.gruposActivados;
    document.getElementById('toggleGruposGlobal').checked = appState.gruposActivadosGlobal;
    document.getElementById('cfgGruposBadge').className = 'badge ' + (appState.gruposActivadosGlobal ? 'on' : 'off');
    document.getElementById('cfgGruposBadge').textContent = appState.gruposActivadosGlobal ? 'Activado' : 'Desactivado';
  } catch (e) {
    // sin datos globales -> se deja el toggle en su estado actual
  }

  if (!appState.gruposActivadosGlobal) {
    cont.innerHTML = `<div class="empty-note">El bot no responderá en ningún grupo. Actívalo arriba para elegir grupos específicos.</div>`;
    return;
  }

  try {
    const datos = await apiFetch('/api/grupos');
    appState.grupos = datos.grupos || [];
    appState.gruposDisponibles = true;
    renderGruposUI();
  } catch (e) {
    appState.gruposDisponibles = false;
    cont.innerHTML = `<div class="empty-note">Esta función requiere el endpoint <b>GET /api/grupos</b> en el backend. Cuando esté disponible, podrás elegir en qué grupos responde MyIABot.Js.</div>`;
  }
}

function renderGruposUI() {
  const cont = document.getElementById('gruposDetalle');
  cont.innerHTML = `
    <p class="view-desc" style="margin-bottom:14px;">Selecciona en qué grupos puede responder MyIABot.Js.</p>
    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="buscarGrupo" placeholder="Buscar grupo..." oninput="renderGrupos()">
      </div>
      <div class="chip-group" id="filtroGrupos">
        <div class="chip active" data-filtro="todos" onclick="setFiltroGrupos('todos')">Todos</div>
        <div class="chip" data-filtro="permitidos" onclick="setFiltroGrupos('permitidos')">Permitidos</div>
        <div class="chip" data-filtro="bloqueados" onclick="setFiltroGrupos('bloqueados')">Bloqueados</div>
      </div>
    </div>
    <div id="gruposLista"></div>`;
  renderGrupos();
}

function setFiltroGrupos(f) {
  appState.filtroGrupos = f;
  document.querySelectorAll('#filtroGrupos .chip').forEach(c => c.classList.toggle('active', c.dataset.filtro === f));
  renderGrupos();
}

function renderGrupos() {
  const lista = document.getElementById('gruposLista');
  if (!lista) return;
  const q = (document.getElementById('buscarGrupo')?.value || '').toLowerCase().trim();

  let filtrados = appState.grupos.filter(g => {
    const coincideTexto = !q || g.nombre.toLowerCase().includes(q);
    const coincideFiltro =
      appState.filtroGrupos === 'todos' ||
      (appState.filtroGrupos === 'permitidos' && g.botActivo) ||
      (appState.filtroGrupos === 'bloqueados' && !g.botActivo);
    return coincideTexto && coincideFiltro;
  });

  if (filtrados.length === 0) {
    lista.innerHTML = `<div class="empty-note">No se encontraron grupos con ese criterio.</div>`;
    return;
  }

  lista.innerHTML = `<div class="list">${filtrados.map(g => `
    <div class="list-item">
      <div class="avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div class="item-info">
        <div class="item-name">${escaparTexto(g.nombre)}</div>
      </div>
      <div class="item-right">
        <span class="item-status-text">${g.botActivo ? 'Activado' : 'Desactivado'}</span>
        <label class="switch">
          <input type="checkbox" ${g.botActivo ? 'checked' : ''} onchange="guardarConfigGrupo('${g.id}', this.checked)">
          <span class="switch-track"></span>
        </label>
      </div>
    </div>`).join('')}</div>`;
}

async function cambiarGruposGlobal(activo) {
  mostrarToast('Guardando...', 'warn');
  try {
    const datos = await apiFetch('/api/configurar-grupos', {
      method: 'POST',
      body: JSON.stringify({ global: true, activo })
    });
    appState.gruposActivadosGlobal = activo;
    document.getElementById('cfgGruposBadge').className = 'badge ' + (activo ? 'on' : 'off');
    document.getElementById('cfgGruposBadge').textContent = activo ? 'Activado' : 'Desactivado';
    mostrarToast(datos.mensaje || 'Configuración de grupos actualizada', 'ok');
    cargarGrupos(true);
    cargarActividadReciente();
  } catch (e) {
    mostrarToast('No se pudo actualizar', 'err');
    document.getElementById('toggleGruposGlobal').checked = !activo;
  }
}

async function guardarConfigGrupo(grupoId, activo) {
  mostrarToast('Guardando...', 'warn');
  try {
    const datos = await apiFetch('/api/configurar-grupos', {
      method: 'POST',
      body: JSON.stringify({ grupoId, activo })
    });
    const g = appState.grupos.find(x => x.id === grupoId);
    if (g) g.botActivo = activo;
    mostrarToast(datos.mensaje || 'Grupo actualizado', 'ok');
    cargarActividadReciente();
  } catch (e) {
    mostrarToast('No se pudo actualizar', 'err');
    renderGrupos();
  }
}

/* ================================================================
   GROQ
   ================================================================ */
async function vincularGroq() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const btn = document.getElementById('btnVincularGroq');

  if (!apiKey) {
    mostrarToast('Escribe una API key.', 'warn');
    return;
  }

  setBotonCargando(btn, true, 'Vinculando...');
  try {
    const datos = await apiFetch('/api/vincular-groq', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    });
    mostrarToast(datos.mensaje || 'API key vinculada con éxito.', datos.ok ? 'ok' : 'err');
    document.getElementById('apiKey').value = '';
    cargarEstado();
    cargarActividadReciente();
  } catch (e) {
    mostrarToast(e.mensaje || 'Error de conexión.', 'err');
  } finally {
    setBotonCargando(btn, false);
  }
}

function confirmarDesvincularGroq() {
  mostrarModal({
    titulo: '¿Desvincular Groq?',
    cuerpo: 'La API dejará de estar disponible para el bot y dejará de responder mensajes automáticamente.',
    textoConfirmar: 'Desvincular',
    peligro: true,
    onConfirmar: desvincularGroq
  });
}

async function desvincularGroq() {
  try {
    const datos = await apiFetch('/api/desvincular-groq', { method: 'POST' });
    mostrarToast(datos.mensaje || 'API key eliminada.', 'ok');
    cargarEstado();
    cargarActividadReciente();
  } catch (e) {
    mostrarToast(e.mensaje || 'Error de conexión.', 'err');
  }
}

/* ================================================================
   MEMORIA / HISTORIAL
   ================================================================ */
function confirmarBorrarHistorial() {
  mostrarModal({
    titulo: '¿Eliminar toda la memoria?',
    cuerpo: 'Esta acción eliminará la memoria de todas las conversaciones y no se puede deshacer.',
    textoConfirmar: 'Eliminar memoria',
    peligro: true,
    onConfirmar: borrarHistorial
  });
}

async function borrarHistorial() {
  try {
    const datos = await apiFetch('/api/borrar-historial', { method: 'POST' });
    mostrarToast(datos.mensaje || 'Memoria eliminada correctamente', 'ok');
    cargarEstado();
    cargarActividadReciente();
  } catch (e) {
    mostrarToast(e.mensaje || 'Error de conexión.', 'err');
  }
}

/* ================================================================
   CHAT DE PRUEBA
   ================================================================
   Espera del backend: POST /api/probar-bot
   body: { mensaje }  ->  { ok:true, respuesta }
*/
function inicializarChat() {
  appState.chatHistorial = [];
  const body = document.getElementById('chatBody');
  body.innerHTML = '';
  renderMensajeChat('bot', 'Hola, soy MyIABot.Js. ¿En qué puedo ayudarte?');
}

function manejarTeclaChat(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarMensajeChat();
  }
}

function renderMensajeChat(rol, texto) {
  const body = document.getElementById('chatBody');
  const hora = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = `msg-row ${rol}`;
  row.innerHTML = `<div class="msg-bubble"></div><div class="msg-time">${hora}</div>`;
  row.querySelector('.msg-bubble').textContent = texto;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
  return row;
}

function mostrarEscribiendo() {
  const body = document.getElementById('chatBody');
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  row.id = 'chatEscribiendo';
  row.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}
function quitarEscribiendo() {
  document.getElementById('chatEscribiendo')?.remove();
}

async function enviarMensajeChat() {
  const input = document.getElementById('chatInput');
  const texto = input.value.trim();
  if (!texto) return;

  const btn = document.getElementById('btnEnviarChat');
  input.value = '';
  input.style.height = 'auto';
  btn.disabled = true;

  renderMensajeChat('user', texto);
  appState.chatHistorial.push({ role: 'user', content: texto });
  mostrarEscribiendo();

  try {
    const respuesta = await probarBot(texto);
    quitarEscribiendo();
    renderMensajeChat('bot', respuesta);
    appState.chatHistorial.push({ role: 'assistant', content: respuesta });
  } catch (e) {
    quitarEscribiendo();
    if (e.tipo === '404') {
      renderMensajeChat('bot', 'Esta función requiere el endpoint POST /api/probar-bot en el backend.');
    } else {
      renderMensajeChat('bot', 'No se pudo obtener respuesta del bot en este momento.');
    }
  } finally {
    btn.disabled = false;
    input.focus();
  }
}

async function probarBot(mensaje) {
  const datos = await apiFetch('/api/probar-bot', {
    method: 'POST',
    body: JSON.stringify({ mensaje })
  });
  return datos.respuesta || '...';
}

function limpiarConversacionPrueba() {
  inicializarChat();
  mostrarToast('Conversación de prueba limpiada', 'ok');
}

/* ================================================================
   UTILIDADES
   ================================================================ */
function escaparTexto(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// Autoexpandir textarea del chat
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'chatInput') {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
  }
});

/* ================================================================
   ENDPOINTS DEL BACKEND USADOS POR ESTE PANEL
   ================================================================

   GET /api/contactos
     Devuelve: { ok:true, contactos:[{ id, nombre, numero, avatar, botActivo, ultimaActividad }] }
     Solo incluye contactos con actividad (mensaje recibido) en los últimos 30 días.

   POST /api/contactos/configurar
     Body:    { contactoId, activo }
     Devuelve:{ ok:true, mensaje }

   GET /api/grupos
     Devuelve: { ok:true, grupos:[{ id, nombre, avatar, botActivo }] }

   GET /api/configuracion-grupos
     Devuelve: { ok:true, gruposActivados: boolean }

   POST /api/configurar-grupos
     Body (global):    { global:true, activo }
     Body (individual):{ grupoId, activo }
     Devuelve: { ok:true, mensaje }

   POST /api/probar-bot
     Body:    { mensaje }
     Devuelve:{ ok:true, respuesta }

   GET /api/actividad?limite=15
     Devuelve: { ok:true, actividad:[{ tipo, detalle, timestamp }] }
     Feed de eventos recientes del bot para el panel Dashboard.

   Rutas existentes que NO deben modificarse:
   POST /api/login, GET /api/estado, POST /api/vincular-groq,
   POST /api/desvincular-groq, POST /api/borrar-historial
   ================================================================ */
</script>
</body>
</html>
