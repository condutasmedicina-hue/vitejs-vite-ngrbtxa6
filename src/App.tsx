import { useState } from "react";

// ==========================================
// 1. DADOS DOS PROTOCOLOS (FLUXOGRAMAS)
// ==========================================

const protocoloBradicardia = {
  inicio: {
    titulo: "Abordagem Inicial (Bradicardia)",
    instrucoes: [
      "Identifique a Bradicardia (FC < 50 bpm).",
      "Realize MOV (Monitor, Oxigênio, Veia).",
      "Solicite ECG de 12 Derivações.",
      "Avalie condição clínica geral."
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "Próximo Passo", proximoId: "causas_reversiveis", tema: "azul" }
    ]
  },
  causas_reversiveis: {
    titulo: "Causas Reversíveis",
    instrucoes: [
      "Investigue o histórico do paciente para:",
      "Causas Medicamentosas (Betabloq, Bloq. Canal de Cálcio).",
      "Distúrbios Eletrolíticos (K+, Mg++, Ca++).",
      "Isquemia Miocárdica (IAM)."
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "Avaliar Estabilidade", proximoId: "instabilidade", tema: "azul" }
    ]
  },
  instabilidade: {
    titulo: "Sinais de Má Perfusão?",
    instrucoes: [
      "Busque os '4 D's' e sinais de choque:",
      "Dispneia / Congestão Pulmonar",
      "Dor Anginosa (Torácica)",
      "Diminuição da consciência (Confusão)",
      "Diminuição da PA (Hipotensão/Choque)"
    ],
    tipo: "alerta",
    opcoes: [
      { texto: "NÃO (Paciente Estável)", proximoId: "analise_ritmo_estavel", tema: "verde" },
      { texto: "SIM (Instável)", proximoId: "tipo_bloqueio_instavel", tema: "vermelho" }
    ]
  },
  analise_ritmo_estavel: {
    titulo: "Análise do ECG (Paciente Estável)",
    instrucoes: [
      "O paciente está estável, mas precisamos avaliar o risco do bloqueio.",
      "Analise o traçado. Existe BAV de Alto Grau?",
      "BAV Total (BAVT)",
      "BAV 2º Grau Mobitz II",
      "Pausa > 3 segundos"
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "SIM", proximoId: "risco_bavt", tema: "alerta" },
      { texto: "NÃO", proximoId: "observacao", tema: "verde" }
    ]
  },
  risco_bavt: {
    titulo: "ALERTA: RISCO DE ASSISTOLIA",
    instrucoes: [
      "Atenção: Bloqueio Maligno!",
      "Embora estável, o paciente pode parar subitamente.",
      "CONDUTA: Instalar Marcapasso Transcutâneo em modo 'Stand-by' (pronto para uso) imediatamente."
    ],
    tipo: "perigo",
    opcoes: [
      { texto: "Configurar Marcapasso", proximoId: "config_marcapasso", tema: "vermelho" }
    ]
  },
  observacao: {
    titulo: "Bradicardia Benigna",
    instrucoes: [
      "Mantenha observação contínua.",
      "Monitore ritmo e sinais vitais.",
      "Se houver piora ou sintomas, reavalie a estabilidade."
    ],
    tipo: "sucesso",
    opcoes: [
      { texto: "Reiniciar Fluxo", proximoId: "inicio", tema: "neutro" }
    ]
  },
  tipo_bloqueio_instavel: {
    titulo: "Análise do Bloqueio (Instável)",
    instrucoes: [
      "Paciente INSTÁVEL. O bloqueio é de alto risco?",
      "BAV Total (BAVT)?",
      "BAV 2º Grau Mobitz II?",
      "Pausa Sinusal > 3 segundos?"
    ],
    tipo: "perigo",
    opcoes: [
      { texto: "NÃO", proximoId: "atropina", tema: "azul" },
      { texto: "SIM", proximoId: "marcapasso_drogas", tema: "vermelho" }
    ]
  },
  atropina: {
    titulo: "Tentativa Farmacológica",
    instrucoes: [
      <>
        Administre Atropina IV:
        <span style={{ display: "block", fontWeight: "bold", marginTop: "5px" }}>
          (1 mg em Bolus)
        </span>
      </>,
      "Repita a cada 3-5 min se necessário.",
      "Dose máxima total: 3 mg."
    ],
    tipo: "alerta",
    opcoes: [
      { texto: "Melhorou (Reverteu)", proximoId: "pos_reversao", tema: "verde" },
      { texto: "Não Reverteu", proximoId: "marcapasso_drogas", tema: "vermelho" }
    ]
  },
  pos_reversao: {
    titulo: "Estabilização",
    instrucoes: [
      "Mantenha monitorização.",
      "Procure a causa base (ex: IAM, Intoxicação).",
      "Encaminhe para o Especialista."
    ],
    tipo: "sucesso",
    opcoes: [
      { texto: "Reiniciar Fluxo", proximoId: "inicio", tema: "neutro" }
    ]
  },
  marcapasso_drogas: {
    titulo: "Terapia de 2ª Linha",
    instrucoes: [
      "A Atropina falhou ou o bloqueio é de alto risco (BAVT).",
      "Escolha a conduta imediata:",
      "1. Marcapasso Transcutâneo (Preferencial)",
      "2. Dopamina (5 a 20 mcg/kg/min)",
      "3. Epinefrina (2 a 10 mcg/min)"
    ],
    tipo: "perigo",
    opcoes: [
      { texto: "Iniciar Marcapasso (MP)", proximoId: "config_marcapasso", tema: "vermelho" },
      { texto: "Usar Drogas Vasoativas", proximoId: "drogas_info", tema: "azul" }
    ]
  },
  drogas_info: {
    titulo: "Infusão Contínua",
    instrucoes: [
      <>
        Dopamina EV:
        <span style={{ display: "block", fontWeight: "bold" }}>
          (5 a 20 mcg/kg/min)
        </span>
      </>,
      <>
        OU Epinefrina EV:
        <span style={{ display: "block", fontWeight: "bold" }}>
          (2 a 10 mcg/min)
        </span>
      </>,
      "Titule até resposta da FC ou PA."
    ],
    tipo: "alerta",
    opcoes: [
      { texto: "Preparar Marcapasso", proximoId: "config_marcapasso", tema: "vermelho" }
    ]
  },
  config_marcapasso: {
    titulo: "Configuração do MP",
    instrucoes: [
      "Coloque as pás (Antero-Posterior preferencial).",
      "Sedação/Analgesia (IMPORTANTE: Fentanil/Mida).",
      <>
        Ajuste a Frequência:
        <span style={{ display: "block", fontWeight: "bold" }}>
          (70 a 80 bpm)
        </span>
      </>,
      "Selecione o Modo: FIXO (ou Demand).",
      "Aumente a Corrente (mA) até capturar."
    ],
    tipo: "perigo",
    opcoes: [
      { texto: "Houve Captura Elétrica", proximoId: "validacao_mecanica", tema: "verde" }
    ]
  },
  validacao_mecanica: {
    titulo: "Validação Mecânica",
    instrucoes: [
      "Não confie apenas no monitor.",
      "Palpe o PULSO FEMORAL (lado oposto ao acesso).",
      "O pulso deve corresponder à frequência do MP."
    ],
    tipo: "alerta",
    opcoes: [
      { texto: "Pulso Confirmado", proximoId: "ajuste_final", tema: "verde" },
      { texto: "Sem Pulso / Não Captura", proximoId: "config_marcapasso", tema: "vermelho" }
    ]
  },
  ajuste_final: {
    titulo: "Margem de Segurança",
    instrucoes: [
      "Identifique o limiar onde capturou (ex: 40mA).",
      <>
        Aumente 10% de segurança:
        <span style={{ display: "block", fontWeight: "bold", marginTop: "5px" }}>
          (Ex: Se capturou com 50mA, deixe em 55mA)
        </span>
      </>,
      "Mantenha sedação contínua.",
      "Solicite Marcapasso Transvenoso (Definitivo)."
    ],
    tipo: "sucesso",
    opcoes: [
      { texto: "Finalizar Protocolo", proximoId: "inicio", tema: "neutro" }
    ]
  }
};

// ==========================================
// 2. LÓGICA DO SIMULADOR (GAME)
// ==========================================
// Cenário inicial
const cenarioInicial = {
  historia: "Paciente 68 anos, chega ao PS com tontura e mal-estar. Nega dor torácica.",
  sinais: { fc: 32, pa: "80/40", sat: 94, consciencia: "Sonolento" },
  feedback: "Paciente monitorizado. O que você faz?"
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [telaAtual, setTelaAtual] = useState("menu");
  const [passoFluxo, setPassoFluxo] = useState("inicio");
  
  // Estados para o simulador
  const [sinaisVitais, setSinaisVitais] = useState(cenarioInicial.sinais);
  const [feedbackSimulacao, setFeedbackSimulacao] = useState(cenarioInicial.feedback);
  const [etapaSimulacao, setEtapaSimulacao] = useState("inicio");

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const irParaMenu = () => {
    setTelaAtual("menu");
    setPassoFluxo("inicio");
    resetSimulacao();
  };

  const resetSimulacao = () => {
    setSinaisVitais(cenarioInicial.sinais);
    setFeedbackSimulacao(cenarioInicial.feedback);
    setEtapaSimulacao("inicio");
  };

  // --- LÓGICA DO SIMULADOR (Mini-Game) ---
  const acaoSimulacao = (acao: string) => {
    if (acao === "atropina") {
      setFeedbackSimulacao("Você administrou Atropina 1mg. Aguardando resposta...");
      setTimeout(() => {
        setSinaisVitais({ ...sinaisVitais, fc: 35, pa: "78/40" }); // Pouca melhora
        setFeedbackSimulacao("Sem resposta significativa à Atropina. Paciente continua hipotenso e sonolento.");
        setEtapaSimulacao("falha_atropina");
      }, 1500);
    } 
    else if (acao === "marcapasso") {
      setFeedbackSimulacao("Instalando Marcapasso Transcutâneo...");
      setTimeout(() => {
        setSinaisVitais({ ...sinaisVitais, fc: 70, pa: "110/70", consciencia: "Melhorando" });
        setFeedbackSimulacao("Sucesso! Captura elétrica e mecânica confirmadas. Paciente acordando.");
        setEtapaSimulacao("sucesso");
      }, 2000);
    }
    else if (acao === "observar") {
      setSinaisVitais({ ...sinaisVitais, fc: 28, pa: "60/30", consciencia: "Inconsciente" });
      setFeedbackSimulacao("Paciente piorou! Rebaixou nível de consciência. PA inaudível.");
      setEtapaSimulacao("piora");
    }
  };

  // --- ESTILOS GERAIS (com :any para evitar erros) ---
  const styles: any = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box"
    },
    card: {
      backgroundColor: "white",
      width: "100%",
      maxWidth: "500px",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      textAlign: "center"
    },
    titulo: { color: "#1f2937", marginBottom: "20px", fontSize: "22px", fontWeight: "bold" },
    btnMenu: {
      width: "100%", padding: "18px", margin: "8px 0", borderRadius: "12px",
      border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer",
      color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
    },
    monitor: {
      backgroundColor: "#000", color: "#0f0", padding: "20px", borderRadius: "10px",
      fontFamily: "Courier New, monospace", marginBottom: "20px", textAlign: "left",
      border: "4px solid #333"
    },
    valVital: { fontSize: "28px", fontWeight: "bold", display: "block" },
    labelVital: { fontSize: "12px", color: "#666", textTransform: "uppercase" },
    feedbackBox: {
      backgroundColor: "#fff3cd", color: "#856404", padding: "15px", borderRadius: "8px",
      marginBottom: "20px", fontSize: "14px"
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DAS TELAS
  // ==========================================

  // 1. TELA: MENU PRINCIPAL
  if (telaAtual === "menu") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.titulo}>Protocolos de Emergência</h1>
          <p style={{marginBottom: "30px", color: "#666"}}>Selecione a emergência:</p>
          
          <button style={{...styles.btnMenu, backgroundColor: "#3b82f6"}} onClick={() => setTelaAtual("selecao_bradi")}>
            ❤️ Bradicardias
          </button>
          <button style={{...styles.btnMenu, backgroundColor: "#ef4444"}} onClick={() => alert("Em construção: Taquicardias")}>
            ⚡ Taquicardias
          </button>
          <button style={{...styles.btnMenu, backgroundColor: "#f59e0b"}} onClick={() => alert("Em construção: SCA")}>
            💔 Síndrome Coronariana
          </button>
        </div>
      </div>
    );
  }

  // 2. TELA: SELEÇÃO (Fluxo vs Treino)
  if (telaAtual === "selecao_bradi") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <button onClick={irParaMenu} style={{float: "left", background: "none", border: "none", fontSize: "20px", cursor: "pointer"}}>⬅</button>
          <h2 style={styles.titulo}>Bradicardias</h2>
          <p style={{marginBottom: "30px", color: "#666"}}>Escolha o modo de uso:</p>

          <button style={{...styles.btnMenu, backgroundColor: "#10b981"}} onClick={() => setTelaAtual("fluxo_bradi")}>
            📖 Fluxo de Atendimento
            <span style={{fontSize: "12px", opacity: 0.8}}>(Guia Passo a Passo)</span>
          </button>
          
          <button style={{...styles.btnMenu, backgroundColor: "#8b5cf6"}} onClick={() => setTelaAtual("treino_bradi")}>
            🎮 Modo Treino (Simulação)
            <span style={{fontSize: "12px", opacity: 0.8}}>(Paciente Virtual)</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA: FLUXO BRADICARDIA (O código antigo)
  if (telaAtual === "fluxo_bradi") {
    // @ts-ignore
    const dados = protocoloBradicardia[passoFluxo];
    
    // CORREÇÃO AQUI: Definimos o objeto como "any" para não dar erro
    const corTopo: any = {
      neutro: "#3b82f6", sucesso: "#10b981", alerta: "#f59e0b", perigo: "#ef4444", azul: "#0ea5e9"
    };
    // @ts-ignore
    const corFundo = corTopo[dados.tipo] || "#3b82f6";

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{backgroundColor: corFundo, padding: "15px", margin: "-20px -20px 20px -20px", color: "white"}}>
            <h3 style={{margin: 0}}>{dados.titulo}</h3>
          </div>
          
          <div style={{textAlign: "left", marginBottom: "20px"}}>
            <ol style={{paddingLeft: "20px", lineHeight: "1.5"}}>
              {/* @ts-ignore */}
              {dados.instrucoes.map((t, i) => <li key={i} style={{marginBottom: "8px"}}>{t}</li>)}
            </ol>
          </div>

          <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            {/* @ts-ignore */}
            {dados.opcoes.map((op, i) => (
              <button 
                key={i} 
                onClick={() => setPassoFluxo(op.proximoId)}
                style={{...styles.btnMenu, backgroundColor: op.tema === "vermelho" ? "#dc2626" : op.tema === "verde" ? "#059669" : "#2563eb", padding: "12px"}}
              >
                {op.texto}
              </button>
            ))}
          </div>

          <button onClick={irParaMenu} style={{marginTop: "20px", background: "none", border: "none", textDecoration: "underline", color: "#666", cursor: "pointer"}}>
            Sair do Protocolo
          </button>
        </div>
      </div>
    );
  }

  // 4. TELA: SIMULAÇÃO / TREINO (NOVO!)
  if (telaAtual === "treino_bradi") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{...styles.titulo, fontSize: "18px"}}>Caso Clínico: Sr. João</h2>
          <p style={{fontSize: "14px", fontStyle: "italic", marginBottom: "15px"}}>{cenarioInicial.historia}</p>

          {/* O MONITOR VIRTUAL */}
          <div style={styles.monitor}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <div>
                <span style={styles.labelVital}>FC (bpm)</span>
                <span style={{...styles.valVital, color: sinaisVitais.fc < 50 ? "#ff4444" : "#0f0"}}>{sinaisVitais.fc}</span>
              </div>
              <div>
                <span style={styles.labelVital}>PA (mmHg)</span>
                <span style={{...styles.valVital, color: parseInt(sinaisVitais.pa) < 90 ? "#ff4444" : "#0f0"}}>{sinaisVitais.pa}</span>
              </div>
              <div>
                <span style={styles.labelVital}>SatO2</span>
                <span style={styles.valVital}>{sinaisVitais.sat}%</span>
              </div>
            </div>
            <div style={{marginTop: "10px", borderTop: "1px solid #333", paddingTop: "5px"}}>
              <span style={styles.labelVital}>Consciência: </span>
              <span style={{color: "white"}}>{sinaisVitais.consciencia}</span>
            </div>
          </div>

          <div style={styles.feedbackBox}>
            <strong>Status:</strong> {feedbackSimulacao}
          </div>

          {/* CONTROLES DO JOGO */}
          {etapaSimulacao === "inicio" && (
            <div style={{display: "grid", gap: "10px"}}>
              <button style={{...styles.btnMenu, backgroundColor: "#eab308"}} onClick={() => acaoSimulacao("atropina")}>
                💉 Administrar Atropina
              </button>
              <button style={{...styles.btnMenu, backgroundColor: "#ef4444"}} onClick={() => acaoSimulacao("marcapasso")}>
                ⚡ Marcapasso Transcutâneo
              </button>
              <button style={{...styles.btnMenu, backgroundColor: "#6b7280"}} onClick={() => acaoSimulacao("observar")}>
                👁️ Apenas Observar
              </button>
            </div>
          )}

          {etapaSimulacao === "falha_atropina" && (
            <div style={{display: "grid", gap: "10px"}}>
              <button style={{...styles.btnMenu, backgroundColor: "#ef4444"}} onClick={() => acaoSimulacao("marcapasso")}>
                ⚡ Instalar Marcapasso Agora
              </button>
            </div>
          )}

          {(etapaSimulacao === "sucesso" || etapaSimulacao === "piora") && (
            <button style={{...styles.btnMenu, backgroundColor: "#3b82f6"}} onClick={resetSimulacao}>
              🔄 Reiniciar Caso
            </button>
          )}

          <button onClick={irParaMenu} style={{marginTop: "20px", background: "none", border: "none", textDecoration: "underline", color: "#666", cursor: "pointer"}}>
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return null;
}