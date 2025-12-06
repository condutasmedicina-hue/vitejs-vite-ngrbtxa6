import { useState } from "react";

// --- DADOS DO PROTOCOLO ---
const protocolo = {
  inicio: {
    titulo: "Abordagem Inicial",
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
      { texto: "Reiniciar", proximoId: "inicio", tema: "neutro" }
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
      { texto: "Reiniciar", proximoId: "inicio", tema: "neutro" }
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

export default function App() {
  // @ts-ignore
  const [passoAtual, setPassoAtual] = useState("inicio");
  // @ts-ignore
  const dados = protocolo[passoAtual];

  const cores: any = {
    fundo: "#f0f2f5",
    card: "#ffffff",
    texto: "#1f2937",
    neutro: "#3b82f6",
    sucesso: "#10b981",
    alerta: "#f59e0b",
    perigo: "#ef4444",
    azul: "#0ea5e9"
  };

  // O SEGREDO ESTÁ AQUI: O ": any" desliga o erro de TypeScript
  const styles: any = {
    appContainer: {
      minHeight: "100vh",
      backgroundColor: cores.fundo,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: "20px",
      boxSizing: "border-box"
    },
    card: {
      backgroundColor: cores.card,
      width: "100%",
      maxWidth: "400px",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    },
    header: {
      // @ts-ignore
      backgroundColor: cores[dados.tipo] || cores.neutro,
      padding: "16px",
      textAlign: "center",
      color: "white"
    },
    headerTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    contentContainer: {
      padding: "24px 24px 10px 24px",
      textAlign: "left"
    },
    lista: {
      margin: 0,
      paddingLeft: "20px",
      color: cores.texto,
      fontSize: "18px",
      lineHeight: "1.6",
      fontWeight: "500"
    },
    itemLista: {
      marginBottom: "12px"
    },
    botoesContainer: {
      padding: "20px 24px 30px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    botao: (tema: string) => {
      const temasBtn: any = {
        verde: "#059669",
        vermelho: "#dc2626",
        azul: "#2563eb",
        cinza: "#4b5563",
        neutro: "#6b7280",
        alerta: "#f59e0b"
      };
      return {
        backgroundColor: temasBtn[tema] || temasBtn.azul,
        color: "white",
        border: "none",
        padding: "16px",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        textAlign: "center",
        width: "100%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      };
    },
    resetLink: {
      textAlign: "center",
      paddingBottom: "16px",
      color: "#9ca3af",
      fontSize: "13px",
      textDecoration: "underline",
      cursor: "pointer",
      background: "none",
      border: "none",
      width: "100%"
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>{dados.titulo}</h3>
        </div>

        <div style={styles.contentContainer}>
          <ol style={styles.lista}>
            {dados.instrucoes.map((passo: any, index: number) => (
              <li key={index} style={styles.itemLista}>
                {passo}
              </li>
            ))}
          </ol>
        </div>

        <div style={styles.botoesContainer}>
          {dados.opcoes.map((opcao: any, index: number) => (
            <button
              key={index}
              style={styles.botao(opcao.tema)}
              onClick={() => setPassoAtual(opcao.proximoId)}
            >
              {opcao.texto}
            </button>
          ))}
        </div>

        {passoAtual !== "inicio" && (
          <button style={styles.resetLink} onClick={() => setPassoAtual("inicio")}>
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
}