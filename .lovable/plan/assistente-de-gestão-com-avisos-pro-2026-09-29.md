# Assistente de gestão com avisos Pro

## O que será alterado
- Fazer o chat reconhecer perguntas sobre métricas, ganhos, perdas/saídas, estoque e agenda, respondendo com os números atualmente exibidos no sistema.
- Reconhecer pedidos de ação, como cadastrar, criar, adicionar, apagar ou alterar informações.
- Para esses pedidos, responder que a ação pelo chat está disponível apenas na versão Pro.
- Exibir respostas Pro em um aviso visual alaranjado com um ícone de coroa do próprio conjunto de ícones, sem emoji.
- Manter o chat disponível em todas as páginas internas e ausente da tela inicial.

## Detalhes técnicos
- Usar respostas locais orientadas por intenção, sem alterar os cadastros ou demais páginas.
- Compor a conversa e o campo de mensagem com os elementos de chat recomendados, preservando o visual atual do Black Studio.
- Criar tokens semânticos para o aviso Pro e manter contraste adequado.
- Validar no navegador perguntas de cada categoria e pelo menos um pedido exclusivo Pro.
