# 🌍 Internacionalização - Atividades Pendentes

## Status Geral

| Área | Concluídas | Pendentes | Total |
|------|------------|-----------|-------|
| **Páginas Públicas** | ✅ 9 | - | 9 |
| **Shop (Loja)** | - | ⏳ 4 | 4 |
| **Cliente** | - | ⏳ 7 | 7 |
| **Admin** | - | ⏳ 12 | 12 |
| **TOTAL** | **9** | **23** | **32** |

---

## ✅ Já Internacionalizado

### Páginas Públicas (9)
- ✅ Home (`/`)
- ✅ About (`/sobre`)
- ✅ Services (`/servicos`)
- ✅ Contact (`/contato`)
- ✅ FAQ (`/faq`)
- ✅ Testimonials (`/depoimentos`)
- ✅ Login (`/auth/login`)
- ✅ Register (`/auth/cadastro`)
- ✅ Forgot/Reset Password (`/auth/esqueci-senha`, `/auth/redefinir-senha`)

### Componentes e Layouts
- ✅ Header (navegação)
- ✅ Footer
- ✅ Client Layout (menu lateral)
- ✅ Admin Layout (menu lateral)
- ✅ Language Selector
- ✅ Validation Service & Component

### Infraestrutura
- ✅ 4 idiomas configurados (pt-BR, en, es, fr)
- ✅ Detecção automática de idioma do navegador
- ✅ Persistência de preferência no localStorage
- ✅ 280+ chaves de tradução por idioma

---

## 🛍️ Shop (Loja) - 4 Páginas Pendentes

### 1. Lista de Produtos (`/loja`)
**Arquivo:** `/src/app/features/shop/product-list/product-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (categorias, preço, ordenação)
- [ ] Mensagens de "nenhum produto encontrado"
- [ ] Botões de ação (adicionar ao carrinho, ver detalhes)
- [ ] Labels de preço e quantidade
- [ ] Badges de status (novo, promoção, esgotado)

**Chaves sugeridas:**
```json
"shop": {
  "productList": {
    "title": "...",
    "filters": {...},
    "noProducts": "...",
    "addToCart": "...",
    "viewDetails": "..."
  }
}
```

---

### 2. Detalhes do Produto (`/loja/:slug`)
**Arquivo:** `/src/app/features/shop/product-detail/product-detail.component.*`

**Textos a internacionalizar:**
- [ ] Seção de descrição do produto
- [ ] Especificações e características
- [ ] Avaliações e comentários
- [ ] Botões (adicionar ao carrinho, comprar agora)
- [ ] Informações de entrega e devolução
- [ ] Produtos relacionados

**Chaves sugeridas:**
```json
"shop": {
  "productDetail": {
    "description": "...",
    "specifications": "...",
    "reviews": {...},
    "delivery": "...",
    "relatedProducts": "..."
  }
}
```

---

### 3. Carrinho de Compras (`/carrinho`)
**Arquivo:** `/src/app/features/shop/cart/cart.component.*`

**Textos a internacionalizar:**
- [ ] Título "Carrinho de Compras"
- [ ] Colunas da tabela (produto, preço, quantidade, total)
- [ ] Botões (continuar comprando, limpar carrinho, finalizar compra)
- [ ] Resumo do pedido (subtotal, frete, total)
- [ ] Mensagem de carrinho vazio
- [ ] Cupom de desconto

**Chaves sugeridas:**
```json
"cart": {
  "title": "...",
  "table": {...},
  "summary": {...},
  "coupon": "...",
  "actions": {...}
}
```

---

### 4. Checkout (`/checkout`)
**Arquivo:** `/src/app/features/shop/checkout/checkout.component.*`

**Textos a internacionalizar:**
- [ ] Steps do checkout (endereço, pagamento, revisão)
- [ ] Formulários de endereço e pagamento
- [ ] Métodos de pagamento
- [ ] Resumo do pedido
- [ ] Termos e condições
- [ ] Botões de confirmar e voltar
- [ ] Mensagens de sucesso/erro

**Chaves sugeridas:**
```json
"checkout": {
  "steps": {...},
  "address": {...},
  "payment": {...},
  "review": {...},
  "confirmation": "..."
}
```

---

## 👤 Área do Cliente - 7 Páginas Pendentes

### 5. Dashboard do Cliente (`/cliente`)
**Arquivo:** `/src/app/features/client/dashboard/dashboard.component.*`

**Textos a internacionalizar:**
- [ ] Mensagem de boas-vindas
- [ ] Cards de estatísticas (leituras, agendamentos, pedidos)
- [ ] Próximas ações
- [ ] Atividades recentes
- [ ] Links rápidos

**Chaves sugeridas:**
```json
"client": {
  "dashboard": {
    "welcome": "...",
    "stats": {...},
    "recentActivity": "...",
    "quickActions": {...}
  }
}
```

---

### 6. Lista de Leituras (`/cliente/leituras`)
**Arquivo:** `/src/app/features/client/readings/reading-list/reading-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (status, data, tipo)
- [ ] Colunas da tabela
- [ ] Status das leituras (pendente, em andamento, concluída)
- [ ] Botões de ação
- [ ] Mensagem de "sem leituras"

**Chaves sugeridas:**
```json
"client": {
  "readings": {
    "title": "...",
    "filters": {...},
    "status": {...},
    "noReadings": "...",
    "actions": {...}
  }
}
```

---

### 7. Detalhes da Leitura (`/cliente/leituras/:id`)
**Arquivo:** `/src/app/features/client/readings/reading-detail/reading-detail.component.*`

**Textos a internacionalizar:**
- [ ] Informações da leitura
- [ ] Perguntas e respostas
- [ ] Interpretação das cartas
- [ ] Data e horário
- [ ] Download do PDF
- [ ] Comentários e feedback

**Chaves sugeridas:**
```json
"client": {
  "readingDetail": {
    "info": {...},
    "interpretation": "...",
    "download": "...",
    "feedback": {...}
  }
}
```

---

### 8. Lista de Agendamentos (`/cliente/agendamentos`)
**Arquivo:** `/src/app/features/client/appointments/appointment-list/appointment-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Calendário
- [ ] Lista de agendamentos
- [ ] Status (agendado, confirmado, cancelado, concluído)
- [ ] Botões (agendar novo, reagendar, cancelar)
- [ ] Mensagem de "sem agendamentos"

**Chaves sugeridas:**
```json
"client": {
  "appointments": {
    "title": "...",
    "calendar": {...},
    "status": {...},
    "actions": {...},
    "noAppointments": "..."
  }
}
```

---

### 9. Lista de Pedidos (`/cliente/pedidos`)
**Arquivo:** `/src/app/features/client/orders/order-list/order-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (status, data)
- [ ] Colunas da tabela (número, data, total, status)
- [ ] Status dos pedidos
- [ ] Botões de ação
- [ ] Mensagem de "sem pedidos"

**Chaves sugeridas:**
```json
"client": {
  "orders": {
    "title": "...",
    "filters": {...},
    "status": {...},
    "noOrders": "...",
    "actions": {...}
  }
}
```

---

### 10. Detalhes do Pedido (`/cliente/pedidos/:id`)
**Arquivo:** `/src/app/features/client/orders/order-detail/order-detail.component.*`

**Textos a internacionalizar:**
- [ ] Informações do pedido
- [ ] Itens do pedido
- [ ] Endereço de entrega
- [ ] Informações de pagamento
- [ ] Status e rastreamento
- [ ] Timeline do pedido

**Chaves sugeridas:**
```json
"client": {
  "orderDetail": {
    "info": {...},
    "items": {...},
    "delivery": {...},
    "payment": {...},
    "tracking": {...}
  }
}
```

---

### 11. Perfil do Cliente (`/cliente/perfil`)
**Arquivo:** `/src/app/features/client/profile/profile.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Seções (dados pessoais, segurança, preferências)
- [ ] Labels dos campos
- [ ] Botões (salvar, cancelar)
- [ ] Mensagens de validação
- [ ] Confirmações

**Chaves sugeridas:**
```json
"client": {
  "profile": {
    "title": "...",
    "sections": {...},
    "fields": {...},
    "actions": {...},
    "confirmations": {...}
  }
}
```

---

## 🔧 Área Administrativa - 12 Páginas Pendentes

### 12. Dashboard Admin (`/admin`)
**Arquivo:** `/src/app/features/admin/dashboard/dashboard.component.*`

**Textos a internacionalizar:**
- [ ] Título e boas-vindas
- [ ] Cards de estatísticas (vendas, usuários, leituras)
- [ ] Gráficos e métricas
- [ ] Atividades recentes
- [ ] Ações rápidas

**Chaves sugeridas:**
```json
"admin": {
  "dashboard": {
    "title": "...",
    "stats": {...},
    "charts": {...},
    "recentActivity": "..."
  }
}
```

---

### 13. Lista de Produtos Admin (`/admin/produtos`)
**Arquivo:** `/src/app/features/admin/products/product-list/product-list.component.*`

**Textos a internacionalizar:**
- [ ] Título e botões de ação
- [ ] Filtros e busca
- [ ] Colunas da tabela
- [ ] Status dos produtos
- [ ] Ações (editar, excluir, duplicar)
- [ ] Mensagens de confirmação

**Chaves sugeridas:**
```json
"admin": {
  "products": {
    "list": {...},
    "filters": {...},
    "actions": {...},
    "confirmations": {...}
  }
}
```

---

### 14. Formulário de Produto Admin (`/admin/produtos/novo`, `/admin/produtos/:id/editar`)
**Arquivo:** `/src/app/features/admin/products/product-form/product-form.component.*`

**Textos a internacionalizar:**
- [ ] Título (novo/editar)
- [ ] Abas do formulário
- [ ] Labels e placeholders
- [ ] Instruções de preenchimento
- [ ] Validações
- [ ] Botões (salvar, cancelar, publicar)

**Chaves sugeridas:**
```json
"admin": {
  "productForm": {
    "title": {...},
    "tabs": {...},
    "fields": {...},
    "validations": {...},
    "actions": {...}
  }
}
```

---

### 15. Lista de Usuários Admin (`/admin/usuarios`)
**Arquivo:** `/src/app/features/admin/users/user-list/user-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (role, status)
- [ ] Colunas da tabela
- [ ] Badges de role
- [ ] Ações (editar, ativar/desativar)

**Chaves sugeridas:**
```json
"admin": {
  "users": {
    "list": {...},
    "filters": {...},
    "roles": {...},
    "actions": {...}
  }
}
```

---

### 16. Detalhes do Usuário Admin (`/admin/usuarios/:id`)
**Arquivo:** `/src/app/features/admin/users/user-detail/user-detail.component.*`

**Textos a internacionalizar:**
- [ ] Informações do usuário
- [ ] Histórico de atividades
- [ ] Pedidos e leituras
- [ ] Permissões
- [ ] Ações administrativas

**Chaves sugeridas:**
```json
"admin": {
  "userDetail": {
    "info": {...},
    "activity": {...},
    "permissions": {...},
    "actions": {...}
  }
}
```

---

### 17. Lista de Leituras Admin (`/admin/leituras`)
**Arquivo:** `/src/app/features/admin/readings/reading-list/reading-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (status, cliente, data)
- [ ] Colunas da tabela
- [ ] Status das leituras
- [ ] Ações (atribuir, iniciar, concluir)
- [ ] Badge de leituras pendentes

**Chaves sugeridas:**
```json
"admin": {
  "readings": {
    "list": {...},
    "filters": {...},
    "status": {...},
    "actions": {...}
  }
}
```

---

### 18. Formulário de Leitura Admin (`/admin/leituras/:id`)
**Arquivo:** `/src/app/features/admin/readings/reading-form/reading-form.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Informações do cliente
- [ ] Perguntas recebidas
- [ ] Editor de interpretação
- [ ] Upload de arquivos
- [ ] Botões (salvar rascunho, publicar)

**Chaves sugeridas:**
```json
"admin": {
  "readingForm": {
    "title": "...",
    "sections": {...},
    "editor": {...},
    "actions": {...}
  }
}
```

---

### 19. Lista de Agendamentos Admin (`/admin/agendamentos`)
**Arquivo:** `/src/app/features/admin/appointments/appointment-list/appointment-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Calendário/Timeline
- [ ] Filtros (status, tipo, data)
- [ ] Colunas da tabela
- [ ] Status dos agendamentos
- [ ] Ações (confirmar, reagendar, cancelar)

**Chaves sugeridas:**
```json
"admin": {
  "appointments": {
    "list": {...},
    "calendar": {...},
    "filters": {...},
    "status": {...},
    "actions": {...}
  }
}
```

---

### 20. Lista de Categorias Admin (`/admin/categorias`)
**Arquivo:** `/src/app/features/admin/categories/category-list/category-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Botão adicionar categoria
- [ ] Colunas da tabela
- [ ] Ações (editar, excluir)
- [ ] Modal de criação/edição

**Chaves sugeridas:**
```json
"admin": {
  "categories": {
    "list": {...},
    "form": {...},
    "actions": {...}
  }
}
```

---

### 21. Lista de Cartas Admin (`/admin/cartas`)
**Arquivo:** `/src/app/features/admin/cards/card-list/card-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (tipo, naipe)
- [ ] Colunas da tabela
- [ ] Ações (editar, visualizar)
- [ ] Modal de detalhes da carta

**Chaves sugeridas:**
```json
"admin": {
  "cards": {
    "list": {...},
    "filters": {...},
    "actions": {...},
    "detail": {...}
  }
}
```

---

### 22. Lista de Depoimentos Admin (`/admin/depoimentos`)
**Arquivo:** `/src/app/features/admin/testimonials/testimonial-list/testimonial-list.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Filtros (status, avaliação)
- [ ] Colunas da tabela
- [ ] Status (pendente, aprovado, rejeitado)
- [ ] Ações (aprovar, rejeitar, editar)

**Chaves sugeridas:**
```json
"admin": {
  "testimonials": {
    "list": {...},
    "filters": {...},
    "status": {...},
    "actions": {...}
  }
}
```

---

### 23. Configurações Admin (`/admin/configuracoes`)
**Arquivo:** `/src/app/features/admin/settings/settings.component.*`

**Textos a internacionalizar:**
- [ ] Título da página
- [ ] Abas de configuração
- [ ] Configurações gerais
- [ ] Configurações de notificações
- [ ] Configurações de pagamento
- [ ] Configurações de e-mail
- [ ] Botões (salvar, testar, resetar)

**Chaves sugeridas:**
```json
"admin": {
  "settings": {
    "title": "...",
    "tabs": {...},
    "general": {...},
    "notifications": {...},
    "payment": {...},
    "email": {...},
    "actions": {...}
  }
}
```

---

## 📋 Checklist por Tarefa

Para cada página, seguir este processo:

### 1. Análise
- [ ] Ler o arquivo `.ts`
- [ ] Ler o arquivo `.html`
- [ ] Identificar todos os textos hardcoded
- [ ] Listar labels de formulários
- [ ] Listar mensagens de validação
- [ ] Listar botões e ações

### 2. Preparação das Traduções
- [ ] Criar estrutura de chaves no JSON
- [ ] Traduzir para pt-BR (textos originais)
- [ ] Traduzir para en (inglês)
- [ ] Traduzir para es (espanhol)
- [ ] Traduzir para fr (francês)

### 3. Implementação
- [ ] Adicionar `TranslateModule` nas imports do `.ts`
- [ ] Adicionar `TranslateService` se necessário (para arrays dinâmicos)
- [ ] Substituir textos no HTML por `{{ 'chave' | translate }}`
- [ ] Atualizar p-buttons com `[label]="'chave' | translate"`
- [ ] Atualizar inputs com `[placeholder]="'chave' | translate"`
- [ ] Converter arrays estáticos para getters com `translate.instant()`

### 4. Testes
- [ ] Verificar build sem erros
- [ ] Testar troca de idioma em runtime
- [ ] Validar todas as traduções
- [ ] Verificar formatação e espaçamento
- [ ] Testar em diferentes resoluções

### 5. Commit
- [ ] Commit com mensagem descritiva
- [ ] Push para o branch

---

## 🎯 Prioridades Sugeridas

### Alta Prioridade (Usuários Públicos)
1. ⭐ Shop - Product List
2. ⭐ Shop - Product Detail
3. ⭐ Shop - Cart
4. ⭐ Shop - Checkout

### Média Prioridade (Clientes Autenticados)
5. 🔵 Client - Dashboard
6. 🔵 Client - Profile
7. 🔵 Client - Readings List
8. 🔵 Client - Appointments List
9. 🔵 Client - Orders List
10. 🔵 Client - Reading Detail
11. 🔵 Client - Order Detail

### Baixa Prioridade (Admin - Uso Interno)
12. 🟡 Admin - Dashboard
13. 🟡 Admin - Products List/Form
14. 🟡 Admin - Users List/Detail
15. 🟡 Admin - Readings List/Form
16. 🟡 Admin - Appointments List
17. 🟡 Admin - Categories List
18. 🟡 Admin - Cards List
19. 🟡 Admin - Testimonials List
20. 🟡 Admin - Settings

---

## 📊 Estimativa de Esforço

| Área | Páginas | Complexidade | Tempo Estimado |
|------|---------|--------------|----------------|
| **Shop** | 4 | Média-Alta | 4-6 horas |
| **Cliente** | 7 | Média | 5-7 horas |
| **Admin** | 12 | Média-Baixa* | 6-8 horas |
| **TOTAL** | **23** | - | **15-21 horas** |

*Baixa complexidade porque muitas páginas admin têm estrutura similar (listas CRUD)

---

## 🚀 Próximo Passo

**Recomendação:** Começar pela área **Shop** (4 páginas), pois são as mais importantes para os usuários finais e impactam diretamente nas vendas.

```bash
# Ordem sugerida de implementação
1. /loja (product-list)
2. /loja/:slug (product-detail)
3. /carrinho (cart)
4. /checkout (checkout)
```

---

## 📝 Notas Importantes

- Manter consistência nas chaves de tradução
- Seguir padrão hierárquico existente nos JSONs
- Usar `translate.instant()` para dados dinâmicos
- Testar cada página após tradução
- Fazer commits incrementais (por página ou grupo de páginas)

---

**Última atualização:** 2026-01-17
**Status atual:** 9/32 páginas internacionalizadas (28%)
**Próxima tarefa:** Internacionalizar área Shop (4 páginas)
