import csv
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATABASE = DATA_DIR / "obras.db"
CSV_FILE = DATA_DIR / "obras-2026-06-26.csv"
SCHEMA_FILE = BASE_DIR / "schema.sql"


COLUMN_MAP = {
    "Obra": "obra",
    "Descrição": "descricao",
    "Situação": "situacao",
    "Classificação": "classificacao",
    "Secretaria responsável": "secretaria_responsavel",
    "Valor estimado (R$)": "valor_estimado",
    "Valor adicional (R$)": "valor_adicional",
    "Data de início": "data_inicio",
    "Data de conclusão": "data_conclusao",
    "Prazo para término": "prazo_para_termino",
    "Prazo de prorrogação": "prazo_de_prorrogacao",
    "Número da licitação": "numero_licitacao",
    "Número do contrato": "numero_contrato",
    "Empresa responsável": "empresa_responsavel",
    "Cronograma - arquivo": "cronograma_arquivo",
    "Cronograma título": "cronograma_titulo",
    "Quantitativos executados e preços efetivamente pagos / Anexos": "anexos",
    "Quantitativos executados e preços efetivamente pagos / Anexos - título": "anexos_titulo",
    "Links diversos": "links_diversos",
    "Justificativa": "justificativa",
    "Observações": "observacoes",
    "Fontes de recursos": "fontes_de_recursos",
}


def clean(value):
    if value is None:
        return ""
    return " ".join(value.strip().split())


def init_database():
    if not CSV_FILE.exists():
        raise FileNotFoundError(f"Arquivo CSV não encontrado: {CSV_FILE}")

    DATA_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DATABASE)
    try:
        with SCHEMA_FILE.open(encoding="utf-8") as schema:
            connection.executescript(schema.read())

        fields = list(COLUMN_MAP.values())
        placeholders = ", ".join("?" for _ in fields)
        columns = ", ".join(fields)

        with CSV_FILE.open(encoding="utf-8", newline="") as csv_file:
            reader = csv.DictReader(csv_file)
            rows = [
                [clean(row.get(csv_column)) for csv_column in COLUMN_MAP]
                for row in reader
            ]

        connection.executemany(
            f"INSERT INTO obras ({columns}) VALUES ({placeholders})",
            rows,
        )
        connection.commit()
    finally:
        connection.close()

    print(f"Banco criado em {DATABASE}")
    print(f"Obras importadas: {len(rows)}")


if __name__ == "__main__":
    init_database()
