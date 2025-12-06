import React, { useState, useEffect } from "react";

// ==========================================
// 1. DEFINIÇÃO DE TIPOS (TYPESCRIPT)
// ==========================================

type Tema = "neutro" | "alerta" | "perigo" | "sucesso" | "azul" | "vermelho" | "verde";

interface Opcao {
  texto: string;
  proximoId: string;
  tema: Tema;
}

interface PassoProtocolo {
  titulo: string;
  instrucoes: (string | JSX.Element)[];
  tipo: Tema;
  opcoes: Opcao[];
}

interface Protocolos {
  [key: string]: PassoProtocolo;
}

interface SinaisVitais {
  fc: number;
  pa: string;
  sat: number;
  consciencia: string;
}

// ==========================================
// 2. DADOS (ACLS - BRADICARDIA)
// ==========================================

const protocoloBradicardia: Protocolos = {
  inicio: {
    titulo: "Abordagem Inicial (Bradicardia)",
    instrucoes: [
      "Identifique a Bradicardia (FC < 50 bpm).",
      "Realize o M.O.V. (Monitor, Oxigênio se Sat < 94%, Veia).",
      "Solicite ECG de 12 Derivações.",
      "Avalie a condição clínica geral."
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "Próximo: Avaliar Causas", proximoId: "causas_reversiveis", tema: "azul" }
    ]
  },
  causas_reversiveis: {
    titulo: "Causas Reversíveis",
    instrucoes: [
      "Investigue o histórico do paciente:",
      "• Medicamentos (Betabloq, Bloq. Canal de Cálcio)",
      "• Distúrbios Eletrolíticos (K+, Mg++, Ca++)",
      "• Isquemia Miocárdica (IAM inferior/direita)"
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "Avaliar Estabilidade", proximoId: "instabilidade", tema: "azul" }
    ]
  },
  instabilidade: {
    titulo: "Critérios de Instabilidade",
    instrucoes: [
      "Busque os '4 D's' e sinais de choque:",
      "1. Dispneia / Congestão Pulmonar",
      "2. Dor Anginosa (Torácica)",
      "3. Diminuição da consciência",
      "4. Diminuição da PA (Hipotensão)"
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
      "O paciente está estável, mas o bloqueio pode ser maligno.",
      "Analise o traçado. Existe:",
      "• BAV Total (BAVT)?",
      "• BAV 2º Grau Mobitz II?",
      "• Pausa > 3 segundos?"
    ],
    tipo: "neutro",
    opcoes: [
      { texto: "SIM (Alto Risco)", proximoId: "risco_bavt", tema: "alerta" },
      { texto: "NÃO (Baixo Risco)", proximoId: "observacao", tema: "verde" }
    ]
  },
  risco_bavt: {
    titulo: "ALERTA: RISCO DE ASSISTOLIA",
    instrucoes: [
      "Atenção: Bloqueio Maligno!",
      "Embora estável, o paciente pode parar subitamente.",
      <>
        CONDUTA: Instalar <strong>Marcapasso Transcutâneo</strong> em modo 'Stand-by' (pronto para uso) imediatamente ou preparar Dopamina.
      </>
    ],
    tipo: "perigo",
    opcoes: [
      { texto: "Configurar MP Stand-by", proximoId: "config_marcapasso", tema: "vermelho" }
    ]
  },
  observacao: {
    titulo: "Bradicardia Benigna",
    instrucoes: [
      "Provavelmente BAV 1º grau ou Mobitz I.",
      "Mantenha observação contínua.",
      "Monitore ritmo e sinais vitais.",
      "Se houver piora, reavalie a