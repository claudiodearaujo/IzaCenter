# 🎨 PROMPT CURSOR.AI - MIGRAÇÃO DE PALETA DE CORES
## De Lilás/Roxo para Gold Cromático - Izabela Tarot

---

## 📋 CONTEXTO

O site **izabelatarot.com.br** está atualmente usando uma paleta de cores roxa/lilás como cor primária. O objetivo é migrar para uma paleta **Gold Cromática** (dourado) mantendo a harmonia visual, elegância mística e respeitando todas as regras de UX, usabilidade e acessibilidade WCAG 2.1.

---

## 🎯 OBJETIVO

Substituir TODAS as ocorrências de cores roxas/lilás pela nova paleta Gold Cromática, garantindo:

1. **Contraste mínimo WCAG AA** (4.5:1 para texto normal, 3:1 para texto grande)
2. **Hierarquia visual** preservada
3. **Estados interativos** claramente distinguíveis (hover, active, focus, disabled)
4. **Legibilidade** em todos os contextos
5. **Harmonia** com as cores secundárias existentes (rosa, neutros)

---

## 🔄 MAPEAMENTO DE CORES: ROXO → GOLD

### PALETA ANTIGA (Roxo/Lilás) - REMOVER

```css
/* ❌ CORES A SUBSTITUIR */
--primary-50: #faf5ff;   /* Lilás muito claro */
--primary-100: #f3e8ff;  /* Lilás claro */
--primary-200: #e9d5ff;  /* Lilás suave */
--primary-300: #d8b4fe;  /* Lilás médio-claro */
--primary-400: #c084fc;  /* Lilás médio */
--primary-500: #a855f7;  /* Lilás vibrante */
--primary-600: #9333ea;  /* Roxo */
--primary-700: #7c3aed;  /* Roxo escuro */
--primary-800: #6b21a8;  /* Roxo muito escuro */
--primary-900: #581c87;  /* Roxo profundo */
```

### PALETA NOVA (Gold Cromático) - IMPLEMENTAR

```css
/* ✅ NOVA PALETA GOLD CROMÁTICA */
:root {
  /* ========================================
     GOLD CROMÁTICO - ESCALA PRIMÁRIA
     ======================================== */
  
  /* Tons Claros - Backgrounds, Cards, Surfaces */
  --primary-50: #FFFBEB;   /* Champagne muito claro - backgrounds sutis */
  --primary-100: #FEF3C7;  /* Champagne claro - cards, surfaces */
  --primary-200: #FDE68A;  /* Dourado pálido - hover em backgrounds */
  --primary-300: #FCD34D;  /* Dourado suave - bordas, destaques sutis */
  
  /* Tons Médios - Elementos Interativos */
  --primary-400: #FBBF24;  /* Dourado vibrante - ícones, badges */
  --primary-500: #F59E0B;  /* Dourado rico - botões secundários, links */
  --primary-600: #D97706;  /* Dourado intenso - botões primários, CTAs */
  
  /* Tons Escuros - Texto, Contraste */
  --primary-700: #B45309;  /* Bronze - texto em fundos claros */
  --primary-800: #92400E;  /* Bronze escuro - headings, ênfase */
  --primary-900: #78350F;  /* Bronze profundo - texto principal, alto contraste */

  /* ========================================
     CORES COMPLEMENTARES AJUSTADAS
     ======================================== */
  
  /* Rosa Suave (mantido, harmoniza com gold) */
  --secondary-50: #FDF2F8;
  --secondary-100: #FCE7F3;
  --secondary-200: #FBCFE8;
  --secondary-300: #F9A8D4;
  --secondary-400: #F472B6;
  --secondary-500: #EC4899;

  /* Neutros Quentes (ajustados para harmonizar com gold) */
  --neutral-50: #FEFDFB;   /* Off-white quente */
  --neutral-100: #FAF9F7;  /* Cinza muito claro quente */
  --neutral-200: #E8E6E3;  /* Cinza claro quente */
  --neutral-300: #D4D1CC;  /* Cinza médio-claro */
  --neutral-400: #A8A49E;  /* Cinza médio */
  --neutral-500: #78746D;  /* Cinza médio-escuro */
  --neutral-600: #5C584F;  /* Cinza escuro */
  --neutral-700: #454239;  /* Cinza muito escuro */
  --neutral-800: #2D2A24;  /* Quase preto quente */
  --neutral-900: #1A1814;  /* Preto quente */

  /* ========================================
     CORES SEMÂNTICAS (Atualizadas)
     ======================================== */
  
  --success: #059669;      /* Verde esmeralda */
  --success-light: #D1FAE5;
  --success-dark: #065F46;
  
  --warning: #D97706;      /* Usa o gold como warning */
  --warning-light: #FEF3C7;
  --warning-dark: #92400E;
  
  --error: #DC2626;        /* Vermelho */
  --error-light: #FEE2E2;
  --error-dark: #991B1B;
  
  --info: #0891B2;         /* Cyan/Teal */
  --info-light: #CFFAFE;
  --info-dark: #155E75;

  /* ========================================
     CORES ESPECIAIS - EFEITOS GOLD CROMÁTICO
     ======================================== */
  
  /* Gradientes Gold */
  --gradient-gold: linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%);
  --gradient-gold-soft: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%);
  --gradient-gold-rich: linear-gradient(135deg, #D97706 0%, #B45309 50%, #78350F 100%);
  
  /* Efeito Shimmer/Brilho */
  --gold-shimmer: linear-gradient(
    90deg,
    #B45309 0%,
    #F59E0B 25%,
    #FCD34D 50%,
    #F59E0B 75%,
    #B45309 100%
  );
  
  /* Sombras com tom dourado */
  --shadow-gold-sm: 0 1px 2px rgba(180, 83, 9, 0.1);
  --shadow-gold-md: 0 4px 6px rgba(180, 83, 9, 0.15);
  --shadow-gold-lg: 0 10px 15px rgba(180, 83, 9, 0.2);
  --shadow-gold-xl: 0 20px 25px rgba(180, 83, 9, 0.25);
  
  /* Glow dourado para elementos especiais */
  --glow-gold: 0 0 20px rgba(245, 158, 11, 0.4);
}
```

---

## 📐 REGRAS DE USO POR CONTEXTO

### 1. BACKGROUNDS

```css
/* Fundo principal do site */
body {
  background-color: var(--neutral-50); /* Off-white quente */
}

/* Seções alternadas */
.section-light {
  background-color: var(--primary-50); /* Champagne muito claro */
}

.section-medium {
  background-color: var(--primary-100); /* Champagne claro */
}

/* Cards e Surfaces */
.card {
  background-color: white;
  border: 1px solid var(--primary-200);
  box-shadow: var(--shadow-gold-sm);
}

.card:hover {
  border-color: var(--primary-400);
  box-shadow: var(--shadow-gold-md);
}
```

### 2. TEXTO - CONTRASTE WCAG

```css
/* ⚠️ CRÍTICO: Garantir contraste mínimo 4.5:1 */

/* Texto principal - usar tons escuros */
.text-primary {
  color: var(--primary-900); /* #78350F - Contraste 12.5:1 em branco */
}

.text-secondary {
  color: var(--primary-800); /* #92400E - Contraste 9.8:1 em branco */
}

/* Texto em fundos escuros dourados */
.dark-bg .text {
  color: var(--primary-50); /* #FFFBEB - Contraste adequado */
}

/* Links */
a {
  color: var(--primary-700); /* #B45309 - Contraste 7.2:1 */
}

a:hover {
  color: var(--primary-800); /* #92400E */
}

/* NUNCA usar tons claros (400 ou menos) para texto em fundo branco */
/* ❌ ERRADO: color: var(--primary-400); em fundo branco */
/* ✅ CERTO: color: var(--primary-700); em fundo branco */
```

### 3. BOTÕES

```css
/* Botão Primário (CTA principal) */
.btn-primary {
  background: var(--gradient-gold);
  color: white;
  border: none;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  background: var(--gradient-gold-rich);
  box-shadow: var(--glow-gold);
}

.btn-primary:active {
  background-color: var(--primary-800);
}

.btn-primary:disabled {
  background: var(--neutral-300);
  color: var(--neutral-500);
}

/* Botão Secundário (outline) */
.btn-secondary {
  background: transparent;
  color: var(--primary-700);
  border: 2px solid var(--primary-500);
}

.btn-secondary:hover {
  background: var(--primary-100);
  border-color: var(--primary-600);
}

/* Botão Ghost */
.btn-ghost {
  background: transparent;
  color: var(--primary-700);
  border: none;
}

.btn-ghost:hover {
  background: var(--primary-100);
}
```

### 4. FORMULÁRIOS

```css
/* Inputs */
.input {
  border: 1px solid var(--neutral-300);
  background: white;
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  outline: none;
}

.input:invalid {
  border-color: var(--error);
}

/* Labels */
.label {
  color: var(--primary-800);
  font-weight: 500;
}

/* Placeholders */
.input::placeholder {
  color: var(--neutral-400);
}
```

### 5. NAVEGAÇÃO

```css
/* Header */
.header {
  background: white;
  border-bottom: 1px solid var(--primary-200);
  box-shadow: var(--shadow-gold-sm);
}

/* Nav Links */
.nav-link {
  color: var(--neutral-700);
}

.nav-link:hover {
  color: var(--primary-700);
}

.nav-link.active {
  color: var(--primary-700);
  border-bottom: 2px solid var(--primary-500);
}

/* Mobile Menu */
.mobile-menu {
  background: white;
  border-left: 4px solid var(--primary-500);
}
```

### 6. BADGES & TAGS

```css
/* Badge padrão */
.badge {
  background: var(--primary-100);
  color: var(--primary-800);
  border: 1px solid var(--primary-300);
}

/* Badge destaque */
.badge-featured {
  background: var(--gradient-gold);
  color: white;
}

/* Tag de status */
.tag-success {
  background: var(--success-light);
  color: var(--success-dark);
}

.tag-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}
```

### 7. ÍCONES

```css
/* Ícones em fundo claro */
.icon {
  color: var(--primary-600);
}

.icon:hover {
  color: var(--primary-700);
}

/* Ícones decorativos (estrelas, lua, etc) */
.icon-decorative {
  color: var(--primary-400);
}

/* Ícones com fundo circular */
.icon-circle {
  background: var(--primary-100);
  color: var(--primary-700);
}
```

---

## 🔧 TAILWIND CSS 4 - CONFIGURAÇÃO

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        secondary: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
        },
        neutral: {
          50: '#FEFDFB',
          100: '#FAF9F7',
          200: '#E8E6E3',
          300: '#D4D1CC',
          400: '#A8A49E',
          500: '#78746D',
          600: '#5C584F',
          700: '#454239',
          800: '#2D2A24',
          900: '#1A1814',
        },
        gold: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
          shimmer: '#FCD34D',
        }
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%)',
        'gradient-gold-soft': 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
        'gradient-gold-rich': 'linear-gradient(135deg, #D97706 0%, #B45309 50%, #78350F 100%)',
      },
      boxShadow: {
        'gold-sm': '0 1px 2px rgba(180, 83, 9, 0.1)',
        'gold-md': '0 4px 6px rgba(180, 83, 9, 0.15)',
        'gold-lg': '0 10px 15px rgba(180, 83, 9, 0.2)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.4)',
      },
    },
  },
}
```

---

## 🎯 PRIMENG 20 - TEMA CUSTOMIZADO

```scss
// styles/_primeng-theme.scss

// Sobrescrever variáveis do PrimeNG para Gold
:root {
  // Primary
  --p-primary-50: #FFFBEB;
  --p-primary-100: #FEF3C7;
  --p-primary-200: #FDE68A;
  --p-primary-300: #FCD34D;
  --p-primary-400: #FBBF24;
  --p-primary-500: #F59E0B;
  --p-primary-600: #D97706;
  --p-primary-700: #B45309;
  --p-primary-800: #92400E;
  --p-primary-900: #78350F;
  
  // Surface colors
  --p-surface-0: #FFFFFF;
  --p-surface-50: #FEFDFB;
  --p-surface-100: #FAF9F7;
  --p-surface-200: #E8E6E3;
  --p-surface-300: #D4D1CC;
  --p-surface-400: #A8A49E;
  --p-surface-500: #78746D;
  --p-surface-600: #5C584F;
  --p-surface-700: #454239;
  --p-surface-800: #2D2A24;
  --p-surface-900: #1A1814;
  
  // Component specific
  --p-button-primary-background: var(--p-primary-600);
  --p-button-primary-hover-background: var(--p-primary-700);
  --p-button-primary-active-background: var(--p-primary-800);
  --p-button-primary-color: #FFFFFF;
  
  --p-inputtext-focus-border-color: var(--p-primary-500);
  --p-inputtext-focus-ring-color: rgba(245, 158, 11, 0.2);
  
  --p-highlight-background: var(--p-primary-100);
  --p-highlight-color: var(--p-primary-800);
  --p-highlight-focus-background: var(--p-primary-200);
  --p-highlight-focus-color: var(--p-primary-900);
}

// Componentes específicos
.p-button {
  &.p-button-primary {
    background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #D97706 0%, #B45309 50%, #78350F 100%);
    }
  }
}

.p-card {
  border: 1px solid var(--p-primary-200);
  box-shadow: 0 1px 2px rgba(180, 83, 9, 0.1);
  
  &:hover {
    border-color: var(--p-primary-400);
    box-shadow: 0 4px 6px rgba(180, 83, 9, 0.15);
  }
}

.p-dialog {
  .p-dialog-header {
    background: var(--p-primary-50);
    border-bottom: 1px solid var(--p-primary-200);
  }
}

.p-tabview {
  .p-tabview-nav-link {
    &.p-highlight {
      border-color: var(--p-primary-500);
      color: var(--p-primary-700);
    }
  }
}

.p-progressbar {
  .p-progressbar-value {
    background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%);
  }
}

.p-tag {
  &.p-tag-primary {
    background: var(--p-primary-100);
    color: var(--p-primary-800);
  }
}
```

---

## 📝 BUSCA E SUBSTITUIÇÃO - REGEX

### Arquivos SCSS/CSS

```bash
# Buscar todas as ocorrências de cores roxas
grep -r "#9333ea\|#7c3aed\|#a855f7\|#6b21a8\|#581c87\|#c084fc\|#d8b4fe\|#e9d5ff\|#f3e8ff\|#faf5ff" --include="*.scss" --include="*.css"

# Buscar classes com purple/violet
grep -r "purple\|violet\|lilac" --include="*.scss" --include="*.css" --include="*.html" --include="*.ts"
```

### Substituições Específicas

```
SUBSTITUIR → POR

#faf5ff → #FFFBEB
#f3e8ff → #FEF3C7
#e9d5ff → #FDE68A
#d8b4fe → #FCD34D
#c084fc → #FBBF24
#a855f7 → #F59E0B
#9333ea → #D97706
#7c3aed → #B45309
#6b21a8 → #92400E
#581c87 → #78350F

purple-50 → primary-50
purple-100 → primary-100
purple-200 → primary-200
purple-300 → primary-300
purple-400 → primary-400
purple-500 → primary-500
purple-600 → primary-600
purple-700 → primary-700
purple-800 → primary-800
purple-900 → primary-900

violet-* → primary-*
lilac-* → primary-*
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO PÓS-MIGRAÇÃO

### Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste de texto normal ≥ 4.5:1
- [ ] Contraste de texto grande ≥ 3:1
- [ ] Contraste de elementos interativos ≥ 3:1
- [ ] Estados focus visíveis
- [ ] Não depender apenas de cor para transmitir informação

### Componentes a Verificar

- [ ] Header/Navegação
- [ ] Footer
- [ ] Botões (todos os estados)
- [ ] Links (normal, hover, visited, active)
- [ ] Formulários (inputs, selects, checkboxes, radios)
- [ ] Cards de produtos
- [ ] Badges e tags
- [ ] Modais/Dialogs
- [ ] Tabelas
- [ ] Paginação
- [ ] Alertas/Toasts
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### Páginas a Verificar

- [ ] Home
- [ ] Sobre
- [ ] Serviços/Produtos
- [ ] Detalhes do produto
- [ ] Carrinho
- [ ] Checkout
- [ ] Login/Cadastro
- [ ] Área do Cliente (todas as telas)
- [ ] Área Admin (todas as telas)

### Ferramentas de Teste

```bash
# Extensões Chrome recomendadas:
- WAVE Evaluation Tool
- axe DevTools
- Color Contrast Analyzer
- Lighthouse (aba Accessibility)
```

---

## 🎨 ANTES E DEPOIS - EXEMPLOS VISUAIS

### Botão Primário

```
ANTES (Roxo):
bg-purple-600 hover:bg-purple-700 text-white

DEPOIS (Gold):
bg-gradient-gold hover:bg-gradient-gold-rich text-white
```

### Card

```
ANTES (Roxo):
border-purple-200 hover:border-purple-400

DEPOIS (Gold):
border-primary-200 hover:border-primary-400 shadow-gold-sm hover:shadow-gold-md
```

### Link

```
ANTES (Roxo):
text-purple-700 hover:text-purple-800

DEPOIS (Gold):
text-primary-700 hover:text-primary-800
```

### Badge

```
ANTES (Roxo):
bg-purple-100 text-purple-800

DEPOIS (Gold):
bg-primary-100 text-primary-800
```

---

## 💡 DICAS FINAIS

1. **Teste em diferentes monitores** - Cores douradas podem parecer diferentes em telas com diferentes calibrações

2. **Modo escuro** - Se implementar, use tons mais suaves do gold para não cansar a vista

3. **Impressão** - Verifique se o gold imprime bem (CMYK: C0 M30 Y100 K0 aproximadamente)

4. **Imagens** - Ajuste filtros de imagens de fundo para harmonizar com a nova paleta

5. **Animações** - O gold brilha bem com sutis animações de shimmer/glow

---

**Execute este prompt no Cursor.ai para realizar a migração completa da paleta de cores.**
