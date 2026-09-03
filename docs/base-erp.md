# Base ERP — Sucesso Empresarial

Registro técnico do Base ERP vinculado à conta Asaas da **Sucesso Empresarial**.

## Decisão de uso

O Base ERP será usado como **SaaS de gestão dos serviços** que pertencem ao escopo da Sucesso Empresarial.

Ele **não substitui a planilha de CRM**. A planilha permanece como base histórica de contatos antigos. Qualquer integração futura entre as duas fontes depende de solicitação específica.

## O que foi confirmado

- O Base ERP é integrado ao Asaas.
- A API oferece clientes, produtos, pedidos de venda, estoque, NF-e e webhooks.
- A autenticação usa uma API key no header `access_token`.
- Produção e Sandbox têm URLs e chaves independentes.
- Produção: `https://api.baseerp.com.br`.
- Sandbox: `https://api-sandbox.baseerp.com.br`.
- A conta deve ser PJ, estar aprovada no Asaas e ter o Base ativado na Central de Navegação.

## Endpoints principais

| Recurso | Endpoint |
|---|---|
| Clientes | `/api/v1/customers` |
| Produtos | `/api/v1/products` |
| Pedidos de venda | `/api/v1/salesOrders` |
| Emitir NF-e | `POST /api/v1/salesOrders/{id}/invoice` |
| Webhooks | `/api/v1/webhooks` |

As listagens usam paginação conforme o endpoint: `page`/`size` ou `offset`/`limit`.

## Webhooks

A conta suporta até 10 webhooks. Eventos documentados incluem criação, autorização, erro e cancelamento de NF-e, cartas de correção e entradas/saídas de estoque.

A entrega é pelo menos uma vez. A integração deve deduplicar pelo identificador do evento, responder HTTP 2xx rapidamente e processar de forma assíncrona. Após 15 falhas consecutivas a fila pode ser interrompida; eventos são retidos por 14 dias.

## Segurança

Nenhuma API key, token de webhook, CPF, CNPJ completo, URL assinada ou dado real de cliente deve ser versionado neste repositório.

As credenciais devem ser fornecidas somente por gerenciador de segredos ou variáveis de ambiente, por exemplo:

```text
BASE_ERP_URL=https://api.baseerp.com.br
BASE_ERP_API_KEY=<fornecida em runtime; nunca versionar>
```

A emissão, o cancelamento e a correção de NF-e são ações externas e exigem confirmação específica antes da execução.

## Skill Hermes

A skill operacional está em [`skills/sucesso/base-erp-sucesso/SKILL.md`](../skills/sucesso/base-erp-sucesso/SKILL.md).

## Fontes oficiais

- [Introdução](https://docs.baseerp.com.br/docs/introducao)
- [Autenticação](https://docs.baseerp.com.br/docs/autenticacao.md)
- [Sandbox](https://docs.baseerp.com.br/docs/sandbox.md)
- [Índice da documentação](https://docs.baseerp.com.br/llms.txt)
- [Referência da API](https://docs.baseerp.com.br/reference)
