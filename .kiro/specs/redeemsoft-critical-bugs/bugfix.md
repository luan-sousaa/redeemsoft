# Bugfix Requirements Document

## Introduction

Este documento define os requisitos para correção de falhas críticas no RedeemSoft que impactam funcionalidades essenciais do aplicativo. As falhas identificadas incluem fluxo de chat quebrado, inconsistências de tipos que causam comportamentos inesperados, e navegação duplicada que confunde a experiência do usuário.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN usuário acessa DrawerMenu e clica em "Chat" THEN o sistema tenta navegar para "/(app)/chat" que não existe, causando erro de rota

1.2 WHEN usuário está na aba "Mensagens" e não possui conversas ativas THEN o sistema carrega lista vazia sem indicar que é necessário ter candidaturas aceitas primeiro

1.3 WHEN sistema processa dados de projeto com modalidades THEN ocorrem inconsistências entre tipos (string[] vs string) causando comportamentos inesperados

1.4 WHEN sistema mapeia dados da API para ProjetoEmpresa THEN a conversão de modalidade singular para modalidades plural pode gerar dados inconsistentes

1.5 WHEN usuário acessa marketplace através de diferentes rotas THEN encontra duas implementações diferentes: /(app)/(tabs)/index.tsx e /(app)/marketplace.tsx

1.6 WHEN DrawerMenu está ativo em marketplace.tsx THEN cria sobreposição com TabNavigation, oferecendo múltiplos caminhos para a mesma funcionalidade

### Expected Behavior (Correct)

2.1 WHEN usuário acessa DrawerMenu e clica em "Chat" THEN o sistema SHALL navegar para a aba "Mensagens" ou para lista de conversas ativas

2.2 WHEN usuário está na aba "Mensagens" sem conversas ativas THEN o sistema SHALL exibir mensagem explicativa sobre como iniciar conversas através de candidaturas aceitas

2.3 WHEN sistema processa dados de projeto THEN SHALL usar tipos consistentes para modalidades em toda aplicação (sempre string[] ou sempre string)

2.4 WHEN sistema mapeia dados da API para ProjetoEmpresa THEN SHALL garantir conversão consistente e previsível de modalidades

2.5 WHEN usuário busca projetos THEN o sistema SHALL usar uma única implementação de marketplace consolidada

2.6 WHEN usuário navega pelo app THEN o sistema SHALL usar navegação unificada sem sobreposições confusas entre DrawerMenu e TabNavigation

### Unchanged Behavior (Regression Prevention)

3.1 WHEN usuário tem conversas ativas válidas com contratoId THEN o sistema SHALL CONTINUE TO carregar e exibir mensagens corretamente no chat-conversa

3.2 WHEN usuário usa TabNavigation principal THEN o sistema SHALL CONTINUE TO navegar corretamente entre Início, Projetos, Mensagens e Perfil

3.3 WHEN sistema processa outros tipos de dados que não modalidades THEN o sistema SHALL CONTINUE TO funcionar sem alterações

3.4 WHEN usuário acessa funcionalidades de autenticação, perfil e projetos THEN o sistema SHALL CONTINUE TO operar normalmente

3.5 WHEN sistema salva e recupera dados de candidaturas e contratos THEN o sistema SHALL CONTINUE TO manter integridade dos dados
