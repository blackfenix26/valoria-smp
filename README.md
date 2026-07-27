# Valória — Site estático

Este repositório contém um scaffold para o site do servidor de Minecraft *Valória*.

Estrutura principal:

- `index.html` — página principal
- `assets/css/styles.css` — estilos
- `assets/js/main.js` — scripts (partículas, copiar IP, mock status)
- `assets/images/` — substitua pelas imagens cinematográficas do seu servidor (banner-cinematic.jpg, castle.jpg, village.jpg, boss.jpg, dungeon.jpg, events.jpg, landscape.jpg, logo*.png, staff*.jpg)

Como rodar localmente:

1. Abra uma pasta de terminal no diretório do projeto.
2. Sirva os arquivos estáticos com um servidor simples. Exemplo com Python:

```powershell
# Python 3
python -m http.server 8000

# então abra http://localhost:8000
```

Substitua as imagens em `assets/images/` por screenshots cinematográficas do servidor para alcançar o visual desejado.

Nota: o status do servidor em `assets/js/main.js` é atualmente um mock. Substitua a lógica de `updateStatus()` para consultar a API real do servidor ou um endpoint de status.
