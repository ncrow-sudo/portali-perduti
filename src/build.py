# Ricostruisce il gioco dai sorgenti: python3 src/build.py
# Crea public/index.html (sito) e dist/claude.html (versione per claude.ai).
import os, json
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(H)
rd = lambda p: open(os.path.join(H, p), encoding='utf-8').read()
ORDER = ['g1','g1b','g2','g2b','g2c','g3','g4','g5','g7','g8','g9','g10ux','g6a','g6b']

def i18n():
    ns = {}; exec(rd('i18n/dict.py'), ns)
    D = ns['D'] + [("Portali Perduti", "Lost Portals", "De Tabte Portaler")]
    js = 'const I18N_D=' + json.dumps(D, ensure_ascii=False) + ';\nconst I18N_T=' + json.dumps(ns['TP'], ensure_ascii=False) + ';\n' + rd('i18n/runtime.js')
    js = js.replace("document.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=LANG;retranslateAll();",
      "function fixDefaultName(){const an=document.getElementById('avName');if(an&&(an.value==='Esploratore'||an.value==='Explorer'||an.value==='Opdager'))an.value=T('Esploratore')}\ndocument.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=LANG;retranslateAll();fixDefaultName();")
    js = js.replace("document.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=l}", "document.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=l;fixDefaultName()}")
    js = js.replace("document.title=T('Portali Perduti')==='Portali Perduti'?(LANG==='en'?'Lost Portals':LANG==='da'?'De Tabte Portaler':'Portali Perduti'):T('Portali Perduti')", "document.title=T('Portali Perduti')")
    return js

def game_js(): return '\n'.join(rd(f + '.js') for f in ORDER)
S = lambda code: '<script>\n' + code + '\n</script>\n'

def site():
    head = rd('p1.html').replace("Importante: invita ogni amico con la sua email dal menu Condividi di claude.ai e fagli aprire la pagina collegato al suo account. Con il solo link pubblico le stanze non funzionano. Ognuno usa il proprio personaggio;",
        "Crea una stanza e fai inquadrare il QR code ai tuoi amici: entrano direttamente con te, senza account, basta un nome. Ognuno usa il proprio personaggio;")
    return ('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d0f0c"><link rel="manifest" href="/manifest.webmanifest"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Portali"><link rel="apple-touch-icon" href="/icon-192.png"><style>html,body{margin:0;padding:0}</style></head><body>\n'
            + head + '\n' + S(i18n()) + S(rd('shim.js')) + S(rd('vendor/qrcode.js')) + S(rd('vendor/three.min.js')) + S(game_js()) + '</body></html>\n')

def claude():
    return rd('p1.html') + '\n' + S(i18n()) + S(rd('vendor/three.min.js')) + S(game_js())

if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    open(os.path.join(ROOT, 'public', 'index.html'), 'w', encoding='utf-8').write(site())
    open(os.path.join(ROOT, 'dist', 'claude.html'), 'w', encoding='utf-8').write(claude())
    print('ok: public/index.html e dist/claude.html')
