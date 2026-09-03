---
name: base-erp-sucesso
description: Gerencie serviços da Sucesso Empresarial no Base ERP.
version: 0.1.0
author: Maurício Ruiz Supleno, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Base ERP, Asaas, Sucesso Empresarial, serviços, webhooks]
    related_skills: []
---

# Base ERP — Sucesso Empresarial

Skill para operar o Base ERP vinculado ao CNPJ da Sucesso Empresarial. O Base é um ERP integrado ao Asaas, com clientes, produtos, pedidos de venda, estoque, NF-e e webhooks. Será usado como SaaS de gestão dos serviços da Sucesso Empresarial — não substitui a planilha de CRM, que permanece como base histórica de contatos antigos.

## Quando usar

- Consultar, cadastrar e atualizar clientes da Sucesso Empresarial no Base.
- Consultar e administrar produtos/serviços, pedidos de venda e webhooks.
- Preparar ou executar integrações entre Base, Asaas e sistemas do ecossistema Sucesso.
- Investigar eventos de NF-e, estoque e falhas de fila de webhook.

Não usar para migrar, substituir ou sincronizar automaticamente a planilha histórica de CRM. Não misturar dados, credenciais ou operações de Mauricio Ruiz, Supleno ou Sandra com o escopo da Sucesso Empresarial.

## Prerequisitos

- Confirmar que a operação pertence à conta Base da Sucesso Empresarial.
- Usar API key do ambiente correto, obtida do gerenciador de segredos ou variável de ambiente.
- Produção: `https://api.baseerp.com.br`.
- Sandbox: `https://api-sandbox.baseerp.com.br`.
- Header: `access_token: <API_KEY>`.
- As chaves de produção e sandbox são diferentes.

Variáveis recomendadas: `BASE_ERP_API_KEY`, `BASE_ERP_URL`. Quando houver separação explícita, preferir `BASE_ERP_PROD_API_KEY` e `BASE_ERP_SANDBOX_API_KEY`. Nunca imprimir valores de segredo.

## Escopo funcional

- Clientes: `/api/v1/customers`.
- Produtos: `/api/v1/products`.
- Pedidos de venda: `/api/v1/salesOrders`.
- Emissão de NF-e: `POST /api/v1/salesOrders/{id}/invoice`.
- Webhooks: `/api/v1/webhooks`.
- Listagens: paginação `page`/`size` ou `offset`/`limit`, conforme o endpoint.
- Filtros documentados de produtos: `name`, `code`, `barcode`, `externalReference`.

## Como executar chamadas

Use `terminal` ou cliente HTTP do projeto. Monte o header em tempo de execução:

```bash
curl --fail-with-body "$BASE_ERP_URL/api/v1/customers?page=0&size=10" \
  -H "access_token: $BASE_ERP_API_KEY" \
  -H "Accept: application/json"
```

Valide que URL e chave pertencem ao mesmo ambiente. Nunca coloque a chave na URL.

## Procedimento operacional

1. Identifique o serviço e confirme o escopo Sucesso Empresarial; critério: nenhum dado de Supleno/Maurício/Sandra entra na operação.
2. Escolha o ambiente; critério: produção somente para operação real autorizada, sandbox para testes.
3. Carregue a chave do segredo/ambiente; critério: ela não aparece em stdout, arquivos versionados, logs ou documentação.
4. Faça primeiro uma leitura do recurso; critério: conta, endpoint e filtros retornam dados coerentes.
5. Para escrita, valide o payload e use `Idempotency-Key` quando disponível; critério: nova tentativa não duplica o recurso.
6. Para webhook, configure apenas eventos necessários; critério: endpoint autentica o header `asaas-access-token`, responde 2xx rapidamente e processa de forma assíncrona.
7. Leia novamente o recurso alterado; critério: a alteração é confirmada pela API.

## Webhooks

A conta aceita até 10 webhooks. Eventos conhecidos:

- `INVOICE_NFE_CREATED`
- `INVOICE_NFE_AUTHORIZED`
- `INVOICE_NFE_ERROR`
- `INVOICE_NFE_CANCELED`
- `INVOICE_NFE_CANCELLATION_ERROR`
- `INVOICE_NFE_CORRECTION_LETTER_SUCCESS`
- `INVOICE_NFE_CORRECTION_LETTER_FAILED`
- `PRODUCTS_STOCK_INPUT`
- `PRODUCTS_STOCK_OUTPUT`

A entrega é “at least once”: deduplicar pelo `id` do evento. A fila pode ser interrompida após 15 falhas consecutivas e eventos ficam retidos por 14 dias. NF-e avulsa pode trazer `customerId` sem `salesOrderId`.

## Regras de segurança e escopo

- Nunca expor, repetir, versionar ou salvar API keys, tokens de webhook ou URLs assinadas de NF-e.
- Mascarar credenciais e dados pessoais em logs e relatórios.
- Não criar clientes, pedidos, produtos ou webhooks sem solicitação operacional clara.
- Emissão, cancelamento e correção de NF-e exigem confirmação específica antes da execução.
- Não alterar a planilha CRM histórica por causa desta integração.

## Pitfalls

- `401`: chave ausente, inválida ou incompatível com o ambiente.
- O Base exige conta PJ, documentos aprovados e ativação na Central de Navegação.
- Dados cadastrais podem ser validados somente na emissão da NF-e.
- Sandbox não replica dados para produção; use dados fictícios e homologação fiscal.
- Não confundir Base (`api.baseerp.com.br`) com cobranças Asaas (`api.asaas.com/v3`).

## Verificação

Concluir somente quando a API retornar sucesso, a resposta for conferida sem vazamento, escritas forem lidas novamente e o relatório registrar ambiente, recurso, identificador não sensível, resultado e pendências.

## Documentação oficial

- Introdução: https://docs.baseerp.com.br/docs/introducao
- Autenticação: https://docs.baseerp.com.br/docs/autenticacao.md
- Sandbox: https://docs.baseerp.com.br/docs/sandbox.md
- Índice: https://docs.baseerp.com.br/llms.txt
- Referência: https://docs.baseerp.com.br/reference
