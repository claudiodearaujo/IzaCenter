# Angular Component Guidelines - IzaCenter

## Regra: Componentes NÃO Devem Usar Templates ou Estilos Inline

### ❌ Não Permitido

```typescript
@Component({
  selector: 'app-example',
  template: `<div>Template inline não permitido</div>`,
  styles: [`div { color: red; }`]
})
```

### ✅ Correto

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
```

## Estrutura de Arquivos Obrigatória

Todo componente deve ter os seguintes arquivos separados:

```
component-name/
├── component-name.component.ts      # Lógica do componente
├── component-name.component.html    # Template
├── component-name.component.css     # Estilos
└── component-name.component.spec.ts # Testes (opcional, mas recomendado)
```

## Benefícios

1. **Separação de responsabilidades**: Lógica, apresentação e estilos em arquivos separados
2. **Manutenibilidade**: Mais fácil de localizar e editar código
3. **Legibilidade**: Arquivos menores e mais focados
4. **Colaboração**: Diferentes desenvolvedores podem trabalhar em partes diferentes
5. **IDE Support**: Melhor syntax highlighting e autocomplete

## Configuração no Angular CLI

Para garantir que novos componentes sejam criados corretamente, use:

```bash
ng generate component nome-do-componente
```

O Angular CLI já cria arquivos separados por padrão.

## Verificação

Ao revisar código, verifique se:
- [ ] `template:` não está sendo usado (deve ser `templateUrl:`)
- [ ] `styles:` não está sendo usado (deve ser `styleUrl:` ou `styleUrls:`)
- [ ] Arquivos .html e .css existem para cada componente
