# 📊 Quest4You v2.1 - Todos os Quizzes (Pronto para JSON)

> **Formato:** 15 perguntas × 3-5 opções cada (exceto Quiz 5: 50 perguntas)  
> **Pontuação:** 0-100 por quiz  
> **Tags:** Extraídas automaticamente

---

## ✅ Quiz 1: Vanilla ou Kink - COMPLETO

Ver: `data/quizzes/vanilla_v2.json`

---

## 🌈 Quiz 2: Orientação Sexual

```json
{
  "id": "orientation",
  "name": "Orientação Sexual",
  "questions": [
    {
      "id": 1,
      "text": "Atração principal por:",
      "options": [
        { "text": "👨 Homens", "score": 0, "tags": ["attracted-to-men", "hetero-woman-or-gay-man"] },
        { "text": "👩 Mulheres", "score": 0, "tags": ["attracted-to-women", "hetero-man-or-lesbian"] },
        { "text": "🟣 Ambos", "score": 50, "tags": ["bisexual", "attracted-to-both"] },
        { "text": "💫 Pessoas (género irrelevante)", "score": 75, "tags": ["pansexual", "gender-blind"] }
      ]
    },
    {
      "id": 2,
      "text": "Já sentiu atração pelo mesmo género?",
      "options": [
        { "text": "✅ Sim, várias vezes", "score": 100, "tags": ["same-gender-attraction", "bi-curious-confirmed"] },
        { "text": "🤔 Sim, raramente", "score": 50, "tags": ["occasional-same-gender", "questioning"] },
        { "text": "❌ Nunca", "score": 0, "tags": ["hetero-confirmed", "no-same-gender"] }
      ]
    },
    {
      "id": 3,
      "text": "Já teve experiência com mesmo género?",
      "options": [
        { "text": "✅ Sim", "score": 100, "tags": ["same-gender-experience", "bi-experienced"] },
        { "text": "❌ Não", "score": 0, "tags": ["no-same-gender-experience"] },
        { "text": "🤫 Prefiro não dizer", "score": 50, "tags": ["private", "reserved"] }
      ]
    },
    {
      "id": 4,
      "text": "Considera-se:",
      "options": [
        { "text": "⚤ Heterossexual", "score": 0, "tags": ["heterosexual", "straight"] },
        { "text": "💜 Bissexual", "score": 50, "tags": ["bisexual", "bi"] },
        { "text": "🌈 Pansexual", "score": 75, "tags": ["pansexual", "pan"] },
        { "text": "⚢⚣ Homossexual", "score": 25, "tags": ["homosexual", "gay", "lesbian"] },
        { "text": "🔄 Questionando", "score": 50, "tags": ["questioning", "exploring"] }
      ]
    },
    {
      "id": 5,
      "text": "Atração por pessoas trans/não-binárias?",
      "options": [
        { "text": "✅ Sim", "score": 100, "tags": ["trans-attracted", "nb-attracted", "inclusive"] },
        { "text": "🤔 Talvez", "score": 50, "tags": ["trans-curious", "open"] },
        { "text": "❌ Não", "score": 0, "tags": ["cis-only"] }
      ]
    },
    {
      "id": 6,
      "text": "Num mundo sem julgamento, experimentaria com mesmo género?",
      "options": [
        { "text": "👍 Com certeza", "score": 100, "tags": ["bi-curious", "open-to-experiment"] },
        { "text": "🤔 Talvez", "score": 50, "tags": ["maybe-curious", "questioning"] },
        { "text": "❌ Não", "score": 0, "tags": ["hetero-firm", "not-interested"] }
      ]
    },
    {
      "id": 7,
      "text": "Suas fantasias envolvem:",
      "options": [
        { "text": "👫 Apenas oposto género", "score": 0, "tags": ["hetero-fantasies"] },
        { "text": "👥 Às vezes mesmo género", "score": 50, "tags": ["bi-fantasies-occasional"] },
        { "text": "🌈 Frequentemente ambos", "score": 100, "tags": ["bi-fantasies-frequent", "pansexual-fantasies"] }
      ]
    },
    {
      "id": 8,
      "text": "Aparência física vs. personalidade:",
      "options": [
        { "text": "💪 Física é mais importante", "score": 25, "tags": ["physical-focused", "appearance-matters"] },
        { "text": "🧠 Personalidade é mais importante", "score": 75, "tags": ["personality-focused", "demisexual-leaning"] },
        { "text": "⚖️ Igualmente importantes", "score": 50, "tags": ["balanced-attraction"] }
      ]
    },
    {
      "id": 9,
      "text": "A sua orientação já mudou?",
      "options": [
        { "text": "🔄 Sim, evoluiu", "score": 75, "tags": ["fluid-orientation", "evolved"] },
        { "text": "⚡ Sim, surpreendeu-me", "score": 75, "tags": ["surprised-by-change", "discovery"] },
        { "text": "🪨 Não, sempre igual", "score": 25, "tags": ["stable-orientation", "consistent"] }
      ]
    },
    {
      "id": 10,
      "text": "Compartilha sua orientação com:",
      "options": [
        { "text": "👪 Todos", "score": 100, "tags": ["out-and-proud", "open"] },
        { "text": "👫 Apenas parceiros", "score": 50, "tags": ["selective-sharing", "discreet"] },
        { "text": "🤐 Poucas pessoas", "score": 25, "tags": ["closeted-mostly", "private"] },
        { "text": "🚫 Ninguém", "score": 0, "tags": ["closeted", "secret"] }
      ]
    },
    {
      "id": 11,
      "text": "Apps de encontros que usa:",
      "options": [
        { "text": "👫 Heterossexuais", "score": 0, "tags": ["hetero-apps-only"] },
        { "text": "🌈 LGBT+", "score": 100, "tags": ["lgbt-apps", "queer-apps"] },
        { "text": "💫 Todos", "score": 75, "tags": ["all-apps", "inclusive"] },
        { "text": "🚫 Não uso", "score": 50, "tags": ["no-apps", "offline-dating"] }
      ]
    },
    {
      "id": 12,
      "text": "Conforto com afeto público com mesmo género:",
      "options": [
        { "text": "👍 Totalmente", "score": 100, "tags": ["pda-comfortable", "out"] },
        { "text": "🤔 Em privado", "score": 50, "tags": ["pda-private-only", "selective"] },
        { "text": "😰 Inconfortável", "score": 0, "tags": ["pda-uncomfortable", "closeted"] }
      ]
    },
    {
      "id": 13,
      "text": "Atração por características andróginas?",
      "options": [
        { "text": "✅ Sim, muito", "score": 100, "tags": ["androgynous-attracted", "gender-fluid-attracted"] },
        { "text": "🤔 Às vezes", "score": 50, "tags": ["sometimes-androgynous"] },
        { "text": "❌ Não", "score": 0, "tags": ["binary-attracted"] }
      ]
    },
    {
      "id": 14,
      "text": "Para si, amor e sexo:",
      "options": [
        { "text": "💖 Sempre juntos", "score": 25, "tags": ["love-and-sex-connected", "romantic"] },
        { "text": "🔥 Podem ser separados", "score": 75, "tags": ["love-sex-separate", "casual-ok"] },
        { "text": "🌟 Depende da pessoa", "score": 50, "tags": ["situational", "flexible"] }
      ]
    },
    {
      "id": 15,
      "text": "Está satisfeito com sua orientação?",
      "options": [
        { "text": "😊 Sim, completamente", "score": 100, "tags": ["orientation-satisfied", "confident"] },
        { "text": "🤔 Mais ou menos", "score": 50, "tags": ["orientation-questioning", "unsure"] },
        { "text": "😕 Não", "score": 0, "tags": ["orientation-struggling", "needs-support"] }
      ]
    }
  ]
}
```

**Tags principais:** hetero, bi, pan, gay, lesbian, questioning, trans-attracted, androgino, out, closeted

---

## 👁️ Quiz 3: Voyeurismo & Partilha (renomear cuckold.json)

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 3: VOYEURISMO & PARTILHA"

**Tags principais:** voyeur, cuckold, stag, hotwife, bull, vixen, sharing, watching, compersion, jealousy-play

---

## 🔄 Quiz 4: Swing & Não-Monogamia

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 4: SWING & NÃO-MONOGAMIA"

**Tags principais:** monogamous, monogamish, open-relationship, polyamory, swing, threesome, swapping, compersion

---

## 🎭 Quiz 5: Fetiches e Parafilias (50 PERGUNTAS)

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 5: FETICHES E PARAFILIAS"

**Seções:**
- A: Partes do corpo (5)
- B: Materiais e texturas (4)
- C: Roupa e uniformes (4)
- D: Dinâmicas específicas (4)
- E: Cenários e roleplay (4)
- F: Fluidos corporais (4)
- G: Sensation play (4)
- H: Restrição e controlo (4)
- I: Humilhação consensual (3)
- J: Fetiches menos comuns (4)
- K: Outros (10)

**~150 tags específicas**

---

## ⛓️ Quiz 6: BDSM & Poder

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 6: BDSM & PODER"

**Tags principais:** dominant, submissive, switch, bondage, impact-play, humiliation, service, aftercare, lifestyle-bdsm

---

## 🗺️ Quiz 7: Aventura Sexual

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 7: AVENTURA SEXUAL"

**Tags principais:** adventure-seeker, risk-taker, toy-collector, position-explorer, public-sex, quickies, long-sessions, sex-games

---

## 🎬 Quiz 8: Fantasias Secretas

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 8: FANTASIAS SECRETAS"

**Tags principais:** romantic-fantasies, extreme-fantasies, group-fantasies, roleplay, taboo-fantasies, cnc-fantasies, secret-fantasies

---

## 🌟 Quiz 9: Exibicionismo & Voyeurismo

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 9: EXIBICIONISMO & VOYEURISMO"

**Tags principais:** exhibitionist, voyeur, nudist, risk-taker, photographer, performer, body-confident, public-display

---

## 💬 Quiz 10: Comunicação Sexual

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 10: COMUNICAÇÃO SEXUAL"

**Tags principais:** good-communicator, shy-communicator, direct-communicator, feedback-giver, fantasy-sharer, boundary-negotiator

---

## 💖 Quiz 11: Intimidade & Conexão

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 11: INTIMIDADE & CONEXÃO"

**Tags principais:** emotional-connection, physical-focus, needs-aftercare, vulnerable, romantic, love-and-sex-connected

---

## ⏰ Quiz 12: Ritmo & Frequência

Ver `docs/QUIZZES_REIMAGINADOS.md` - Seção "QUIZ 12: RITMO & FREQUÊNCIA"

**Tags principais:** high-libido, low-libido, quick-recovery, morning-sex, night-sex, spontaneous, planned, marathon-sex

---

## 🎯 Status de Conversão

- [x] Quiz 1: Vanilla - JSON criado ✅
- [ ] Quiz 2: Orientação - JSON estruturado, precisa criar ficheiro
- [ ] Quiz 3: Voyeurismo - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 4: Swing - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 5: Fetiches - Copiar do QUIZZES_REIMAGINADOS.md (50 perguntas)
- [ ] Quiz 6: BDSM - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 7: Aventura - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 8: Fantasias - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 9: Exibicionismo - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 10: Comunicação - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 11: Intimidade - Copiar do QUIZZES_REIMAGINADOS.md
- [ ] Quiz 12: Ritmo - Copiar do QUIZZES_REIMAGINADOS.md

---

*Próximo passo: Criar todos os JSONs e atualizar o código*
