# Monitoramento de Obras Públicas de Campinas

Plataforma web para consulta de dados públicos sobre obras municipais de Campinas.

## Tecnologias

- Python
- Flask
- SQLite
- HTML
- CSS
- JavaScript

## Como executar

1. Instale as dependências:

```bash
pip install -r requirements.txt
```

2. Crie o banco SQLite a partir do CSV:

```bash
python init_db.py
```

3. Execute a aplicação:

```bash
python app.py
```

4. Acesse no navegador:

```text
http://127.0.0.1:5000
```

## Estrutura dos dados

O arquivo `data/obras-2026-06-26.csv` foi exportado do site da Prefeitura Municipal de Campinas. A importação cria a tabela `obras` no banco `data/obras.db`, mantendo campos coerentes com o CSV original.
