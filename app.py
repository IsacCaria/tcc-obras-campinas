import sqlite3
from pathlib import Path

from flask import Flask, jsonify, render_template, request


BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "data" / "obras.db"

app = Flask(__name__)


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def row_to_dict(row):
    return {key: row[key] for key in row.keys()}


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/obras")
def listar_obras():
    query = """
        SELECT *
        FROM obras
        WHERE 1 = 1
    """
    params = []

    termo = request.args.get("q", "").strip()
    situacao = request.args.get("situacao", "").strip()
    classificacao = request.args.get("classificacao", "").strip()
    secretaria = request.args.get("secretaria", "").strip()

    if termo:
        query += """
            AND (
                obra LIKE ?
                OR descricao LIKE ?
                OR empresa_responsavel LIKE ?
                OR numero_contrato LIKE ?
                OR numero_licitacao LIKE ?
            )
        """
        like_term = f"%{termo}%"
        params.extend([like_term, like_term, like_term, like_term, like_term])

    if situacao:
        query += " AND situacao = ?"
        params.append(situacao)

    if classificacao:
        query += " AND classificacao = ?"
        params.append(classificacao)

    if secretaria:
        query += " AND secretaria_responsavel = ?"
        params.append(secretaria)

    query += " ORDER BY obra COLLATE NOCASE"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()

    return jsonify([row_to_dict(row) for row in rows])


@app.get("/api/obras/<int:obra_id>")
def obter_obra(obra_id):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM obras WHERE id = ?",
            (obra_id,),
        ).fetchone()

    if row is None:
        return jsonify({"erro": "Obra não encontrada"}), 404

    return jsonify(row_to_dict(row))


@app.get("/api/filtros")
def filtros():
    with get_connection() as connection:
        situacoes = connection.execute(
            "SELECT DISTINCT situacao FROM obras WHERE situacao <> '' ORDER BY situacao"
        ).fetchall()
        classificacoes = connection.execute(
            "SELECT DISTINCT classificacao FROM obras WHERE classificacao <> '' ORDER BY classificacao"
        ).fetchall()
        secretarias = connection.execute(
            """
            SELECT DISTINCT secretaria_responsavel
            FROM obras
            WHERE secretaria_responsavel <> ''
            ORDER BY secretaria_responsavel
            """
        ).fetchall()

    return jsonify(
        {
            "situacoes": [row["situacao"] for row in situacoes],
            "classificacoes": [row["classificacao"] for row in classificacoes],
            "secretarias": [row["secretaria_responsavel"] for row in secretarias],
        }
    )


@app.get("/api/resumo")
def resumo():
    with get_connection() as connection:
        total = connection.execute("SELECT COUNT(*) AS total FROM obras").fetchone()
        por_situacao = connection.execute(
            """
            SELECT situacao, COUNT(*) AS total
            FROM obras
            WHERE situacao <> ''
            GROUP BY situacao
            ORDER BY total DESC, situacao
            """
        ).fetchall()

    return jsonify(
        {
            "total": total["total"],
            "por_situacao": [row_to_dict(row) for row in por_situacao],
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
