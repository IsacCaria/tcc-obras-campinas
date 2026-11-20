const elementos = {
    lista: document.querySelector("#lista-obras"),
    contador: document.querySelector("#contador-resultados"),
    busca: document.querySelector("#busca"),
    situacao: document.querySelector("#situacao"),
    classificacao: document.querySelector("#classificacao"),
    secretaria: document.querySelector("#secretaria"),
    limpar: document.querySelector("#limpar-filtros"),
    totalObras: document.querySelector("#total-obras"),
    totalExecucao: document.querySelector("#total-execucao"),
    totalConcluidas: document.querySelector("#total-concluidas"),
    totalParalisadas: document.querySelector("#total-paralisadas"),
    modal: document.querySelector("#modal-obra"),
    modalTitulo: document.querySelector("#modal-titulo"),
    modalConteudo: document.querySelector("#modal-conteudo"),
    fecharModal: document.querySelector("#fechar-modal"),
};

const camposDetalhe = [
    ["Situação", "situacao"],
    ["Classificação", "classificacao"],
    ["Secretaria responsável", "secretaria_responsavel"],
    ["Valor estimado", "valor_estimado"],
    ["Valor adicional", "valor_adicional"],
    ["Data de início", "data_inicio"],
    ["Data de conclusão", "data_conclusao"],
    ["Prazo para término", "prazo_para_termino"],
    ["Prazo de prorrogação", "prazo_de_prorrogacao"],
    ["Número da licitação", "numero_licitacao"],
    ["Número do contrato", "numero_contrato"],
    ["Empresa responsável", "empresa_responsavel"],
    ["Cronograma", "cronograma_arquivo", "link"],
    ["Anexos", "anexos", "link"],
    ["Links diversos", "links_diversos", "link"],
    ["Justificativa", "justificativa", "largo"],
    ["Observações", "observacoes", "largo"],
    ["Fontes de recursos", "fontes_de_recursos", "largo"],
];

let timeoutBusca;

function valorOuPadrao(valor) {
    return valor && valor.trim() ? valor : "Não informado";
}

function classeSituacao(situacao) {
    const texto = (situacao || "").toLowerCase();

    if (
        texto.includes("paralis") ||
        texto.includes("suspensa") ||
        texto.includes("cancelada")
    ) return "alerta";

    if (texto.includes("conclu")) return "concluida";
    if (texto.includes("execução")) return "execucao";

    return "";
}

function textoCurto(texto, tamanho = 210) {
    if (!texto) return "Sem descrição informada.";
    return texto.length > tamanho ? `${texto.slice(0, tamanho)}...` : texto;
}

function criarOpcoes(select, valores) {
    valores.forEach((valor) => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });
}

async function carregarFiltros() {
    const resposta = await fetch("/api/filtros");
    const filtros = await resposta.json();

    criarOpcoes(elementos.situacao, filtros.situacoes);
    criarOpcoes(elementos.classificacao, filtros.classificacoes);
    criarOpcoes(elementos.secretaria, filtros.secretarias);
}

async function carregarResumo() {
    const resposta = await fetch("/api/resumo");
    const resumo = await resposta.json();
    const porSituacao = resumo.por_situacao.reduce((acc, item) => {
        acc[item.situacao] = item.total;
        return acc;
    }, {});

    elementos.totalObras.textContent = resumo.total;
    elementos.totalExecucao.textContent = porSituacao["Em execução"] || 0;
    elementos.totalConcluidas.textContent = porSituacao["Concluída"] || 0;
    elementos.totalParalisadas.textContent =
        (porSituacao["Paralisada"] || 0) + (porSituacao["Execução Suspensa"] || 0);
}

function parametrosBusca() {
    const params = new URLSearchParams();

    if (elementos.busca.value.trim()) params.set("q", elementos.busca.value.trim());
    if (elementos.situacao.value) params.set("situacao", elementos.situacao.value);
    if (elementos.classificacao.value) params.set("classificacao", elementos.classificacao.value);
    if (elementos.secretaria.value) params.set("secretaria", elementos.secretaria.value);

    return params;
}

async function carregarObras() {
    elementos.lista.innerHTML = '<div class="mensagem">Carregando obras...</div>';

    const resposta = await fetch(`/api/obras?${parametrosBusca().toString()}`);
    const obras = await resposta.json();

    elementos.contador.textContent = `${obras.length} obra(s) encontrada(s)`;

    if (!obras.length) {
        elementos.lista.innerHTML = '<div class="mensagem">Nenhuma obra encontrada com os filtros selecionados.</div>';
        return;
    }

    elementos.lista.innerHTML = obras.map((obra) => `
        <article class="obra-card">
            <div>
                <h3>${obra.obra}</h3>
                <p>${textoCurto(obra.descricao)}</p>
                <div class="metadados">
                    <span class="tag situacao ${classeSituacao(obra.situacao)}">${valorOuPadrao(obra.situacao)}</span>
                    <span class="tag">${valorOuPadrao(obra.classificacao)}</span>
                    <span class="tag">${valorOuPadrao(obra.valor_estimado)}</span>
                    <span class="tag">${valorOuPadrao(obra.secretaria_responsavel)}</span>
                </div>
            </div>
            <div class="acoes-card">
                <button class="botao-detalhes" type="button" data-id="${obra.id}">Ver detalhes</button>
            </div>
        </article>
    `).join("");
}

function renderizarValor(label, valor, tipo) {
    const conteudo = valorOuPadrao(valor);
    const classe = tipo === "largo" ? "detalhe largo" : "detalhe";

    if (tipo === "link" && valor) {
        const links = valor.split(/\s+/).filter((item) => item.startsWith("http"));
        if (links.length) {
            return `
                <div class="${classe}">
                    <span>${label}</span>
                    ${links.map((link) => `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`).join("<br>")}
                </div>
            `;
        }
    }

    return `
        <div class="${classe}">
            <span>${label}</span>
            <strong>${conteudo}</strong>
        </div>
    `;
}

async function abrirDetalhes(id) {
    const resposta = await fetch(`/api/obras/${id}`);
    const obra = await resposta.json();

    elementos.modalTitulo.textContent = obra.obra;
    elementos.modalConteudo.innerHTML = `
        <div class="detalhes-grid">
            <div class="detalhe largo">
                <span>Descrição</span>
                <strong>${valorOuPadrao(obra.descricao)}</strong>
            </div>
            ${camposDetalhe.map(([label, campo, tipo]) => renderizarValor(label, obra[campo], tipo)).join("")}
        </div>
    `;

    elementos.modal.showModal();
}

function registrarEventos() {
    [elementos.situacao, elementos.classificacao, elementos.secretaria].forEach((select) => {
        select.addEventListener("change", carregarObras);
    });

    elementos.busca.addEventListener("input", () => {
        clearTimeout(timeoutBusca);
        timeoutBusca = setTimeout(carregarObras, 300);
    });

    elementos.limpar.addEventListener("click", () => {
        elementos.busca.value = "";
        elementos.situacao.value = "";
        elementos.classificacao.value = "";
        elementos.secretaria.value = "";
        carregarObras();
    });

    elementos.lista.addEventListener("click", (event) => {
        const botao = event.target.closest("[data-id]");
        if (botao) abrirDetalhes(botao.dataset.id);
    });

    elementos.fecharModal.addEventListener("click", () => elementos.modal.close());
}

async function iniciar() {
    registrarEventos();
    await Promise.all([carregarFiltros(), carregarResumo()]);
    await carregarObras();
}

iniciar();
