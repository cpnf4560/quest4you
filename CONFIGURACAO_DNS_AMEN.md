# Configuração DNS para quest4you.pt (AMEN/PTServidor)

## ⚠️ IMPORTANTE
O domínio `quest4you.pt` precisa de apontar para os servidores do GitHub Pages.

---

## 📋 Registos DNS a Configurar

### Registos A (para o domínio raiz quest4you.pt)

No painel de controlo do AMEN/PTServidor, cria estes registos:

| Tipo | Nome/Host | Valor/Destino | TTL |
|------|-----------|---------------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

### Registo CNAME (para www.quest4you.pt)

| Tipo | Nome/Host | Valor/Destino | TTL |
|------|-----------|---------------|-----|
| CNAME | www | cpnf4560.github.io | 3600 |

---

## 🔧 Passos no AMEN/PTServidor

1. **Acede ao painel de controlo** do teu domínio
2. **Vai a "Gestão DNS"** ou "Zona DNS"
3. **Remove registos antigos** que possam estar a apontar para outros servidores (Vercel, etc.)
4. **Adiciona os 4 registos A** listados acima
5. **Adiciona o registo CNAME** para `www`
6. **Guarda as alterações**

---

## ✅ Configuração no GitHub Pages

Depois do DNS estar configurado:

1. Vai a: https://github.com/cpnf4560/quest4you/settings/pages
2. Em "Build and deployment" → Source: `Deploy from a branch`
3. Branch: `main` / Folder: `/ (root)`
4. Em "Custom domain", escreve: `quest4you.pt`
5. Clica "Save"
6. Ativa "Enforce HTTPS" quando disponível ✅

---

## ⏰ Tempo de Propagação

As alterações DNS podem demorar **até 48 horas**, mas normalmente são **15 minutos a 2 horas**.

Verifica em: https://dnschecker.org/#A/quest4you.pt

---

## 📞 IPs Oficiais do GitHub Pages

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
