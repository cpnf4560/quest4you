# 🔄 Plano de Reformulação Total - Quest4You v2.1

> **Data:** 2026-02-08  
> **Objetivo:** Transformar os quizzes de experiência poética para **sistema de matching funcional**

---

## 📋 O que mudou:

### ❌ ANTES (Versão Poética)
- 10 perguntas com experiência visual
- Títulos poéticos ("Guardião do Lar Íntimo")
- Foco em emoção e metáforas
- Resultado narrativo

### ✅ AGORA (Versão Matching)
- **15 perguntas objetivas** por quiz (exceto fetiches: 50)
- **Sistema de pontuação 0-100** uniformizado
- **Tags extraídas** de cada resposta
- **Algoritmo de compatibilidade** baseado em scores + tags
- Respostas diretas e práticas

---

## 🎯 Estrutura Nova dos Quizzes

### Quiz 1: Vanilla ou Kink (15 perguntas)
**Atual:** 50 perguntas  
**Novo:** 15 perguntas diretas  
**Tags:** vanilla, kink, brinquedos-sim/nao, falar-sujo, silencio, marcas-sim/nao, risco-excitante/assustador

### Quiz 2: Orientação Sexual (15 perguntas)
**Atual:** 50 perguntas  
**Novo:** 15 perguntas sobre atração e identidade  
**Tags:** hetero, bi, pan, gay, lesbica, questioning, trans-attracted, androgino

### Quiz 3: Voyeurismo & Partilha (15 perguntas)
**Atual:** Cuckold - 50 perguntas  
**Novo:** 15 perguntas sobre voyeurismo/exibicionismo/partilha  
**Tags:** voyeur, cuckold, stag, hotwife, bull, vixen, sharing, watching, compersion, jealousy-play

### Quiz 4: Swing & Não-Monogamia (15 perguntas)
**Atual:** Swing - 50 perguntas  
**Novo:** 15 perguntas sobre relações abertas/poliamor  
**Tags:** monogamous, monogamish, open-relationship, polyamory, swing, threesome, swapping, compersion

### Quiz 5: Fetiches e Parafilias (50 perguntas) ⭐
**Atual:** Kinks - 50 perguntas  
**Novo:** **50 perguntas específicas** (SIM/TALVEZ/NÃO)  
**Seções:**
- A: Partes do corpo (5 perguntas)
- B: Materiais e texturas (4 perguntas)
- C: Roupa e uniformes (4 perguntas)
- D: Dinâmicas específicas (4 perguntas)
- E: Cenários e roleplay (4 perguntas)
- F: Fluidos corporais (4 perguntas)
- G: Sensation play (4 perguntas)
- H: Restrição e controlo (4 perguntas)
- I: Humilhação consensual (3 perguntas)
- J: Fetiches menos comuns (4 perguntas)
- K: Outros (10 perguntas)

**Tags:** ~150 tags específicas (feet-lover, latex, bondage, etc.)

### Quiz 6: BDSM & Poder (15 perguntas)
**Atual:** BDSM - 50 perguntas  
**Novo:** 15 perguntas sobre dinâmicas de poder  
**Tags:** dominant, submissive, switch, bondage, impact-play, humiliation, service, aftercare, lifestyle-bdsm

### Quiz 7: Aventura Sexual (15 perguntas)
**Atual:** Adventure - 50 perguntas  
**Novo:** 15 perguntas sobre exploração e risco  
**Tags:** adventure-seeker, risk-taker, toy-collector, position-explorer, public-sex, quickies, long-sessions, sex-games

### Quiz 8: Fantasias Secretas (15 perguntas)
**Atual:** Fantasies - 50 perguntas  
**Novo:** 15 perguntas sobre fantasias e realização  
**Tags:** romantic-fantasies, extreme-fantasies, group-fantasies, roleplay, taboo-fantasies, cnc-fantasies, secret-fantasies

### Quiz 9: Exibicionismo & Voyeurismo (15 perguntas)
**Atual:** Exhibitionism - 50 perguntas  
**Novo:** 15 perguntas sobre mostrar/ver  
**Tags:** exhibitionist, voyeur, nudist, risk-taker, photographer, performer, body-confident, public-display

### Quiz 10: Comunicação Sexual (15 perguntas)
**Atual:** Communication - 50 perguntas  
**Novo:** 15 perguntas sobre expressão e feedback  
**Tags:** good-communicator, shy-communicator, direct-communicator, feedback-giver, fantasy-sharer, boundary-negotiator

### Quiz 11: Intimidade & Conexão (15 perguntas)
**Atual:** Intimacy - 50 perguntas  
**Novo:** 15 perguntas sobre conexão emocional  
**Tags:** emotional-connection, physical-focus, needs-aftercare, vulnerable, romantic, love-and-sex-connected

### Quiz 12: Ritmo & Frequência (15 perguntas)
**Atual:** Rhythm - 50 perguntas  
**Novo:** 15 perguntas sobre libido e timing  
**Tags:** high-libido, low-libido, quick-recovery, morning-sex, night-sex, spontaneous, planned, marathon-sex

---

## 📊 Sistema de Pontuação Novo

### Estrutura Uniformizada
```json
{
  "questions": [
    {
      "id": 1,
      "text": "Pergunta direta",
      "options": [
        { "text": "Opção 1", "score": 0, "tags": ["tag1"] },
        { "text": "Opção 2", "score": 25, "tags": ["tag2"] },
        { "text": "Opção 3", "score": 50, "tags": ["tag3"] },
        { "text": "Opção 4", "score": 75, "tags": ["tag4"] },
        { "text": "Opção 5 (opcional)", "score": 100, "tags": ["tag5"] }
      ]
    }
  ]
}
```

### Pontuação Final
- **Quizzes 1-4, 6-12:** Média das 15 respostas (0-100)
- **Quiz 5 (Fetiches):** Lista de tags SIM/TALVEZ/NÃO

---

## 🏷️ Sistema de Tags

### Extração de Tags
Cada resposta gera 1-3 tags específicas:
- **Quiz 1:** vanilla, kink, brinquedos-sim, etc.
- **Quiz 5:** feet-lover, latex, bondage, etc. (~150 tags)
- **Quiz 6:** dominant, submissive, switch, etc.

### Tipos de Tags
1. **Must-Have Tags** - Dealbreakers/Matchmakers
2. **Nice-to-Have Tags** - Preferências
3. **Dealbreaker Tags** - Incompatibilidades

---

## 🔄 Algoritmo de Matching

### Nível 1: Score Compatibility (40%)
- Comparar pontuação 0-100 em cada quiz
- Quiz 5 (Fetiches) tem peso duplo
- Diferença < 20 pontos = alta compatibilidade

### Nível 2: Tag Matching (50%)
- Must-Have Tags: Match obrigatório
- Nice-to-Have Tags: Tags complementares (ex: dominant + submissive)
- Dealbreaker Tags: Incompatibilidades (ex: monogamous + polyamorous)

### Nível 3: Prioridades Pessoais (10%)
- Utilizador seleciona 3 prioridades
- Ajuste final no score

### Fórmula Final
```
Compatibilidade (%) = (Score × 0.4) + (Tags × 0.5) + (Prioridades × 0.1)
```

---

## 📝 Tarefas de Reformulação

### Fase 1: Atualizar JSONs dos Quizzes ✅
- [ ] `vanilla.json` - 15 perguntas novas
- [ ] `orientation.json` - 15 perguntas novas
- [ ] `cuckold.json` → renomear para `voyeurism.json` - 15 perguntas
- [ ] `swing.json` - 15 perguntas novas
- [ ] `kinks.json` → renomear para `fetishes.json` - **50 perguntas**
- [ ] `bdsm.json` - 15 perguntas novas
- [ ] `adventure.json` - 15 perguntas novas
- [ ] `fantasies.json` - 15 perguntas novas
- [ ] `exhibitionism.json` - 15 perguntas novas
- [ ] `communication.json` - 15 perguntas novas
- [ ] `intimacy.json` - 15 perguntas novas
- [ ] `rhythm.json` - 15 perguntas novas
- [ ] `index.json` - Atualizar nomes e descrições

### Fase 2: Atualizar Código JavaScript
- [ ] `quiz.js` - Nova lógica de pontuação e tags
- [ ] `smart-match.js` - Algoritmo de matching completo
- [ ] `profile.js` - Mostrar scores e tags no perfil

### Fase 3: Atualizar UI
- [ ] `quiz.css` - Remover elementos poéticos
- [ ] `quiz.html` - Interface mais direta
- [ ] `profile.html` - Mostrar scores 0-100 e tags

### Fase 4: Base de Dados
- [ ] Schema Firestore - Adicionar campos de tags
- [ ] Indexes - Otimizar queries de matching
- [ ] Migration - Migrar dados existentes

---

## 🎯 Próximos Passos Imediatos

1. **Criar os 12 novos JSONs** com as perguntas do QUIZZES_REIMAGINADOS.md
2. **Atualizar quiz.js** para processar novo formato
3. **Atualizar smart-match.js** com algoritmo de matching
4. **Testar** com dados de exemplo

---

## 💾 Backup

Antes de começar:
- ✅ Backup já criado: `Quest4You_BACKUP_20260208_011106`
- ✅ Ficheiros antigos em `_ARCHIVE/`

---

*Plano criado: 2026-02-08 01:30*
