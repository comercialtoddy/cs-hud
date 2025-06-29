# Migração para Overlay

O CS HUD foi migrado para funcionar exclusivamente como overlay, proporcionando uma melhor experiência de uso.

## O que mudou

### Antes
- HUD funcionava apenas no browser ou OBS
- Era necessário configurar manualmente o modo transparente
- Precisava de dois processos separados (servidor + overlay)

### Agora
- HUD funciona nativamente como overlay no CS2
- Modo transparente é padrão
- Um único comando inicia tudo automaticamente

## Como usar

### Produção
1. Execute o servidor: `cs-hud-server-win.exe` ou `cs-hud-server-linux`
2. Execute a overlay: `cs-hud-overlay.exe` ou `cs-hud-overlay`

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar overlay
npm run electron
```

## Configuração do CS2

**Importante**: O CS2 deve estar em modo **Fullscreen Windowed** para a overlay funcionar corretamente.

1. Abra CS2
2. Vá em Settings → Video
3. Defina Display Mode para "Fullscreen Windowed"

## Características da Overlay

- **Transparente**: Não interfere na jogabilidade
- **Always on Top**: Fica sempre visível sobre o jogo
- **Corners**: Mostra indicadores visuais nos cantos quando ativa
- **Ignora mouse**: Cliques passam através da overlay

## Compatibilidade com OBS

A overlay ainda é compatível com OBS Browser Source usando:
```
URL: http://localhost:31982/hud?transparent
```

## Solução de Problemas

### Overlay não aparece
1. Verifique se o CS2 está em Fullscreen Windowed
2. Confirme que o servidor está rodando (porta 31982)
3. Tente mover a janela da overlay para o monitor correto

### Performance
Se houver problemas de performance:
1. Limite o FPS do CS2: `fps_max 144`
2. Use os comandos de console recomendados em [docs/cvars.md](cvars.md)

### Multi-monitor
Se a overlay aparecer no monitor errado:
1. Selecione a janela da overlay na taskbar
2. Use `Win + Shift + Arrow keys` para mover entre monitores 