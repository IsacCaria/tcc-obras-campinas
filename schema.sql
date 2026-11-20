DROP TABLE IF EXISTS obras;

CREATE TABLE obras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    obra TEXT,
    descricao TEXT,
    situacao TEXT,
    classificacao TEXT,
    secretaria_responsavel TEXT,
    valor_estimado TEXT,
    valor_adicional TEXT,
    data_inicio TEXT,
    data_conclusao TEXT,
    prazo_para_termino TEXT,
    prazo_de_prorrogacao TEXT,
    numero_licitacao TEXT,
    numero_contrato TEXT,
    empresa_responsavel TEXT,
    cronograma_arquivo TEXT,
    cronograma_titulo TEXT,
    anexos TEXT,
    anexos_titulo TEXT,
    links_diversos TEXT,
    justificativa TEXT,
    observacoes TEXT,
    fontes_de_recursos TEXT
);
