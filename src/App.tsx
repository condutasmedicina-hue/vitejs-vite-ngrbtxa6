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
        <strong style={{ display: "block", marginTop: "5px" }}>
          (1 mg em Bolus)
        </strong>
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
        <strong style={{ display: "block" }}>
          (5 a 20 mcg/kg/min)
        </strong>
      </>,
      <>
        OU Epinefrina EV:
        <strong style={{ display: "block" }}>
          (2 a 10 mcg/min)
        </strong>
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
        <strong style={{ display: "block" }}>
          (70 a 80 bpm)
        </strong>
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
        <strong style={{ display: "block", marginTop: "5px" }}>
          (Ex: Se capturou com 50mA, deixe em 55mA)
        </strong>
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
const cenarioInicial = {
  historia: "Dona Creusa, 70 anos. Classificada como VERMELHO pela enfermagem. Queixa-se de 'muita vontade de desmaiar' e fraqueza intensa.",
  sinais: { fc: 36, pa: "80/40", sat: 94, consciencia: "Sonolento" },
  feedback: "Equipe: \"Paciente na sala de emergência, doutor(a). Aguardando suas ordens.\""
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [telaAtual, setTelaAtual] = useState("menu");
  const [passoFluxo, setPassoFluxo] = useState("inicio");
    
  // Estados para o simulador
  const [sinaisVitais, setSinaisVitais] = useState(cenarioInicial.sinais);
  const [feedbackSimulacao, setFeedbackSimulacao] = useState<string | JSX.Element>(cenarioInicial.feedback);
  const [etapaSimulacao, setEtapaSimulacao] = useState("apresentacao_caso");
  const [comandoUsuario, setComandoUsuario] = useState("");
  const [monitorVisivel, setMonitorVisivel] = useState(false);
  
  // NOVOS ESTADOS PARA O ECG
  const [mostrarECG, setMostrarECG] = useState(false);
  const [esperandoDiagnosticoECG, setEsperandoDiagnosticoECG] = useState(false);
  const [tentativasECG, setTentativasECG] = useState(0);

  const [esperandoDose, setEsperandoDose] = useState<string | null>(null);
  const [atropinaCount, setAtropinaCount] = useState(0);

  // Checklist rigoroso
  const [checklist, setChecklist] = useState({
    movFeito: false,
    paAferida: false,  
    satAferida: false, 
    estabilidadeChecada: false,
    ecgFeito: false,
    atropinaFeita: false,
    pasColocadas: false,
    sedacaoFeita: false,
    mpLigado: false,
    capturaEletrica: false,
    capturaMecanica: false
  });

  // Estados de Erro
  const [msgErroAtual, setMsgErroAtual] = useState<string | null>(null); 
  const [mostrarDica, setMostrarDica] = useState(false);

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const irParaMenu = () => {
    setTelaAtual("menu");
    setPassoFluxo("inicio");
    resetSimulacao();
  };

  const resetSimulacao = () => {
    setSinaisVitais(cenarioInicial.sinais);
    setFeedbackSimulacao(cenarioInicial.feedback);
    setEtapaSimulacao("apresentacao_caso");
    setComandoUsuario("");
    setMonitorVisivel(false);
    setMostrarECG(false); 
    setEsperandoDiagnosticoECG(false); 
    setTentativasECG(0);
    setEsperandoDose(null);
    setAtropinaCount(0); 
    setMsgErroAtual(null);
    setMostrarDica(false);
    setChecklist({
      movFeito: false,
      paAferida: false,
      satAferida: false,
      estabilidadeChecada: false,
      ecgFeito: false,
      atropinaFeita: false,
      pasColocadas: false,
      sedacaoFeita: false,
      mpLigado: false,
      capturaEletrica: false,
      capturaMecanica: false
    });
  };

  const iniciarAvaliacao = () => {
    setEtapaSimulacao("inicio");
  }

  // Função chamada quando o usuário comete um erro de conduta
  const acionarCondutaErrada = (motivo: string) => {
    setMsgErroAtual(motivo);
    setMostrarDica(false);
    setComandoUsuario(""); 
  };

  const continuarAposDica = () => {
      setMsgErroAtual(null);
      setMostrarDica(false);
  };

  // --- LÓGICA DO "CÉREBRO" (RIGOROSO COM O FLUXOGRAMA) ---
  const enviarComando = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!comandoUsuario) return;

    // NORMALIZAÇÃO: Remove acentos e joga para minúsculo
    const cmd = comandoUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // ===============================================
    // LÓGICA DE DIAGNÓSTICO DO ECG (PRIORIDADE MÁXIMA SE ESTIVER ESPERANDO)
    // ===============================================
    if (esperandoDiagnosticoECG) {
        // Verifica se acertou: "Bradicardia Sinusal" (ou variações)
        if (cmd.includes("sinusal") && (cmd.includes("bradi") || cmd.includes("lento"))) {
            setFeedbackSimulacao("✅ EXCELENTE! Diagnóstico correto: Bradicardia Sinusal.\n\nO ritmo é regular, tem onda P antes de todo QRS, mas a frequência está baixa (<50 bpm).\n\nQual o próximo passo, doutor?");
            setEsperandoDiagnosticoECG(false); 
            setMostrarECG(false); 
        } else {
            // LÓGICA DE MENSAGENS ROTATIVAS
            const mensagensErro = [
                "🤔 Diagnóstico incorreto, doutor. Observe com calma: Existe onda P antes de cada QRS?",
                "⚠️ Ainda não. Note que o ritmo é regular e a frequência está baixa (<50bpm). Tente outro diagnóstico.", 
                "❌ Não é esse. Lembre-se: O impulso nasce no nó sinusal, mas está lento. Tente novamente.",
                "👀 Olhe o DII longo. Onda P positiva, seguida de QRS estreito... Qual o nome desse ritmo?"
            ];
            
            // Pega a mensagem baseada no contador
            const msgAtual = mensagensErro[tentativasECG % mensagensErro.length];
            
            setFeedbackSimulacao(msgAtual);
            setTentativasECG(prev => prev + 1); 
        }
        setComandoUsuario("");
        return; 
    }
    
    // ===============================================
    // LÓGICA DE DOSES (QUANDO ESPERA UMA RESPOSTA)
    // ===============================================
    if (esperandoDose === "atropina") {
      if (cmd.includes("1mg") || cmd.includes("1 mg")) {
        
        // INCREMENTA O CONTADOR DE DOSES
        const novaContagem = atropinaCount + 1;
        setAtropinaCount(novaContagem);

        setFeedbackSimulacao(`Equipe: "Certo doutor. ${novaContagem}ª dose de Atropina 1mg administrada em bolus agora."`);
        setEsperandoDose(null);
        setComandoUsuario("");
        setChecklist(prev => ({...prev, atropinaFeita: true}));
        
        setTimeout(() => {
          setSinaisVitais({ ...sinaisVitais, fc: 35, pa: "78/40" }); 
          setFeedbackSimulacao(`Equipe: "Doutor, 3 minutos se passaram após a ${novaContagem}ª dose. A FC continua em 35 bpm. Sem melhora."`);
          setEtapaSimulacao("falha_atropina");
        }, 2000);
      } else {
        setFeedbackSimulacao("Equipe: \"Doutor, confirma a dose? O protocolo padrão é 1mg.\"");
        setComandoUsuario("");
      }
      return;
    }

    // ===============================================
    // LÓGICA PRIORITÁRIA: PERGUNTAS / ANAMNESE
    // ===============================================

    // 1. Queixa Principal / Como se sente (Paciente fala)
    if (
      cmd.includes("sentindo") || 
      cmd.includes("sente") || 
      cmd.includes("ajudar") || 
      cmd.includes("queixa") || 
      cmd.includes("fale") || 
      cmd.includes("conte") || 
      (cmd.includes("o que") && cmd.includes("tem")) || 
      (cmd.includes("como") && (cmd.includes("voce") || cmd.includes("vc") || cmd.includes("senhora") || cmd.includes("esta"))) 
    ) {
       setFeedbackSimulacao("Dona Creusa (com voz pastosa): \"Ai doutor... uma fraqueza que não passa... parece que a luz tá apagando... minha cabeça tá rodando...\"");
       setComandoUsuario("");
       return;
    }

    // 2. História do Evento / Tempo (Acompanhante fala)
    else if (
      cmd.includes("aconteceu") || 
      cmd.includes("houve") || 
      cmd.includes("tempo") || 
      cmd.includes("quando") || 
      cmd.includes("comecou") || 
      cmd.includes("inicio") ||
      cmd.includes("horas") || 
      (cmd.includes("como") && cmd.includes("foi"))
    ) {
       setFeedbackSimulacao("Acompanhante: \"Há mais ou menos 2 horas, doutor. Ela estava sentada vendo TV, levantou rápido e ficou pálida desse jeito, quase desmaiou.\"");
       setComandoUsuario("");
       return;
    }

    // 3. Medicamentos / Alergias
    else if (cmd.includes("remedio") || cmd.includes("medicamento") || cmd.includes("toma") || cmd.includes("alergia")) {
       setFeedbackSimulacao("Acompanhante: \"Ela toma remédio pra pressão e pro coração, mas não sei o nome. Que eu saiba, não tem alergia a nada.\"");
       setComandoUsuario("");
       return;
    }

    // 4. Antecedentes
    else if (cmd.includes("historia") || cmd.includes("anamnese") || cmd.includes("antecedentes")) {
       setFeedbackSimulacao("Acompanhante: \"Ela é hipertensa e tem problema cardíaco antigo. Nunca desmaiou assim antes.\"");
       setComandoUsuario("");
       return;
    }

    // ===============================================
    // 5. RECONHECIMENTO DE INSTABILIDADE (DIAGNÓSTICO)
    // ===============================================

    // CASO A: ALUNO FALA "INSTÁVEL" + "MARCAPASSO"
    else if ((cmd.includes("instavel") || cmd.includes("instabilidade")) && (cmd.includes("marcapasso") || cmd.includes("mp"))) {
       setChecklist(prev => ({...prev, estabilidadeChecada: true}));
       
       setFeedbackSimulacao(
         <div>
           <p style={{margin: "0 0 10px 0"}}><strong>✅ EXCELENTE!</strong> Paciente <strong style={{color: "#dc2626"}}>INSTÁVEL</strong>.</p>
           <p style={{margin: "0 0 5px 0"}}>Lembre-se sempre dos <strong>4 D's da Instabilidade</strong>:</p>
           <ul style={{margin: "0 0 15px 0", paddingLeft: "20px"}}>
             <li>Dor torácica (Angina)</li>
             <li>Dispneia (Congestão)</li>
             <li>Diminuição da Consciência</li>
             <li>Diminuição da PA (Hipotensão)</li>
           </ul>
           <p style={{margin: 0}}>Você indicou corretamente o Marcapasso. Como deseja montá-lo e qual o tipo agora?</p>
         </div>
       );
       
       setComandoUsuario("");
       return;
    }

    // CASO B: ALUNO FALA SÓ "INSTÁVEL"
    else if (cmd.includes("instavel") || cmd.includes("instabilidade")) {
       setChecklist(prev => ({...prev, estabilidadeChecada: true}));
       
       setFeedbackSimulacao(
         <div>
           <p style={{margin: "0 0 10px 0"}}><strong>✅ CORRETO, DOUTOR(A)!</strong> A paciente está <strong style={{color: "#dc2626"}}>INSTÁVEL</strong>.</p>
           <p style={{margin: "0 0 5px 0"}}>Lembre-se sempre dos <strong>4 D's da Instabilidade</strong>:</p>
           <ul style={{margin: "0 0 15px 0", paddingLeft: "20px"}}>
             <li>Dor torácica (Angina)</li>
             <li>Dispneia (Congestão)</li>
             <li>Diminuição da Consciência</li>
             <li>Diminuição da PA (Hipotensão)</li>
           </ul>
           <p style={{margin: 0}}>O que você deseja fazer agora?</p>
         </div>
       );
       
       setComandoUsuario("");
       return;
    }

    // ===============================================
    // 6. AVALIAÇÃO ESPECÍFICA DOS 4 D's (SINTOMAS)
    // ===============================================

    // A. DOR TORÁCICA / PEITO / ANGINA
    else if (cmd.includes("dor") || cmd.includes("peito") || cmd.includes("angina") || cmd.includes("toracica")) {
       setFeedbackSimulacao("Dona Creusa: \"Não, doutor. Não sinto dor no peito, só o coração batendo devagar e essa moleza.\" (Dor Anginosa: AUSENTE)");
       setComandoUsuario("");
       return;
    }

    // B. DISPNEIA / FALTA DE AR / PULMÃO
    else if (cmd.includes("falta") && cmd.includes("ar") || cmd.includes("respirar") || cmd.includes("dispneia") || cmd.includes("cansaco") || cmd.includes("pulmao")) {
       setFeedbackSimulacao("Dona Creusa: \"O ar entra normal, não sinto falta de ar não.\" (Dispneia/Congestão: AUSENTE)");
       setComandoUsuario("");
       return;
    }

    // C. CONSCIÊNCIA / DESMAIO / SONOLÊNCIA
    else if (cmd.includes("consciencia") || cmd.includes("desmaio") || cmd.includes("sonolencia") || cmd.includes("tontura") || cmd.includes("apagando") || cmd.includes("mental")) {
       setFeedbackSimulacao("Acompanhante: \"Ela está muito sonolenta, doutor. Quase desmaiou agorinha!\" (Diminuição da Consciência: PRESENTE)");
       setComandoUsuario("");
       return;
    }

    // D. HIPOTENSÃO / DIMINUIÇÃO DA PA
    else if (cmd.includes("hipotensao") || (cmd.includes("diminuicao") && cmd.includes("pa"))) {
       setChecklist(prev => ({...prev, paAferida: true})); 
       setFeedbackSimulacao("Equipe: \"Sim, doutor. A PA está 80/40 mmHg. Isso configura Hipotensão.\" (Instabilidade Hemodinâmica: PRESENTE)");
       setComandoUsuario("");
       return;
    }

    // ===============================================
    // 7. PROCEDIMENTOS CLÍNICOS (ALÇA FECHADA)
    // ===============================================

    // MONITOR / MOV (Obrigatório primeiro passo clínico)
    else if (cmd.includes("monitor") || cmd.includes("mov") || cmd.includes("oxigenio") || cmd.includes("veia") || cmd.includes("monitorizacao")) {
      
      let respostaEquipe = "Equipe: \"Compreendido.\"";
      
      // REGRA: SÓ LIGA O QUADRADO PRETO SE PEDIR MONITOR
      if (cmd.includes("monitor") || cmd.includes("monitorizacao") || cmd.includes("mov")) {
          setMonitorVisivel(true); 
          respostaEquipe = "Equipe: \"Monitor conectado. O2 instalado e acesso garantido.\"";
      } else {
          // Se pediu só acesso ou O2, confirma mas NÃO liga o monitor
          respostaEquipe = "Equipe: \"Acesso e O2 instalados. Aguardando monitorização.\"";
      }
      
      setChecklist(prev => ({...prev, movFeito: true}));
      setFeedbackSimulacao(respostaEquipe);
    }

    // ECG (Precisa de MOV antes)
    else if (cmd.includes("ecg") || cmd.includes("eletro")) {
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você solicitou ECG antes de monitorizar o paciente e garantir acesso/O2 (MOV). Siga a ordem: MOV primeiro.");
        return;
      }
      setChecklist(prev => ({...prev, ecgFeito: true}));
      // ATIVA O MODO DE DIAGNÓSTICO DE ECG
      setMostrarECG(true);
      setEsperandoDiagnosticoECG(true);
      setFeedbackSimulacao("Equipe: \"Rodando ECG de 12 derivações... Pronto, doutor. Está na tela. Qual o seu laudo?\"");
    }

    // ESTABILIDADE GERAL / PA / SATURAÇÃO (Comandos gerais)
    else if (cmd.includes("pa") || cmd.includes("pressao") || cmd.includes("estabilidade") || cmd.includes("sinais") || cmd.includes("4d") || cmd.includes("saturacao") || cmd.includes("oximetria") || cmd.includes("sat")) {
      
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você tentou avaliar sinais vitais sem monitorizar o paciente (MOV) antes.");
        return;
      }

      setChecklist(prev => ({...prev, estabilidadeChecada: true}));
      
      // LOGICA DE EXIBIÇÃO ESPECÍFICA
      let msg = "Equipe: \"Aferindo... ";

      // Se pediu PA (ou Pressão)
      if (cmd.includes("pa") || cmd.includes("pressao") || cmd.includes("sinais") || cmd.includes("estabilidade")) {
          setChecklist(prev => ({...prev, paAferida: true}));
          msg += "PA 80/40 mmHg. ";
      }

      // Se pediu Sat
      if (cmd.includes("sat") || cmd.includes("oximetria") || cmd.includes("sinais") || cmd.includes("estabilidade")) {
          setChecklist(prev => ({...prev, satAferida: true}));
          msg += "Saturação 94%. ";
      }

      // Complemento da estabilidade
      msg += "Paciente sonolenta e fria.\"";

      setFeedbackSimulacao(msg);
    }

    // ATROPINA (Precisa de MOV + Estabilidade checada)
    else if (cmd.includes("atropina")) {
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você tentou medicar sem realizar o MOV antes.");
        return;
      }
      if (!checklist.estabilidadeChecada) {
        acionarCondutaErrada("Você decidiu medicar sem antes checar explicitamente os sinais de instabilidade (4Ds / PA).");
        return;
      }

      // VERIFICA SE JÁ ATINGIU A DOSE MÁXIMA (3 DOSES)
      if (atropinaCount >= 3) {
        acionarCondutaErrada("Dose máxima de Atropina (3mg) já atingida. A droga falhou. Não insista. Passe para a 2ª linha (Marcapasso ou Dopamina/Epinefrina).");
        return;
      }

      setFeedbackSimulacao("Equipe: \"Certo, Atropina. Qual a dose o senhor deseja administrar?\"");
      setEsperandoDose("atropina");
    }

    // MARCAPASSO (SEQUÊNCIA RIGOROSA)
    else if (cmd.includes("marcapasso") || cmd.includes("mp") || cmd.includes("pas") || cmd.includes("sedacao") || cmd.includes("ligar")) {
      
      // REGRA: Tentou MP direto sem Atropina
      if (!checklist.atropinaFeita && !cmd.includes("bavt")) {
         acionarCondutaErrada("O protocolo indica tentativa de Atropina antes do MP (exceto em BAVT imediato). Você pulou a Atropina.");
         return;
      }

      // SUB-FLUXO DO MARCAPASSO
      
      // A. PÁS
      if (cmd.includes("pas") || cmd.includes("conectar")) {
         setChecklist(prev => ({...prev, pasColocadas: true}));
         setFeedbackSimulacao("Equipe: \"Pás conectadas no tórax. MP em Stand-by.\"");
         setComandoUsuario("");
         return;
      }

      // B. SEDAÇÃO (Obrigatório ter pás e ser antes de ligar)
      if (cmd.includes("sedacao") || cmd.includes("analgesia") || cmd.includes("fentanil")) {
         if (!checklist.pasColocadas) {
             setFeedbackSimulacao("Equipe: \"Doutor, as pás ainda não foram conectadas.\"");
             setComandoUsuario("");
             return;
         }
         setChecklist(prev => ({...prev, sedacaoFeita: true}));
         setFeedbackSimulacao("Equipe: \"Analgesia realizada com Fentanil e Midazolam. Paciente sedada.\"");
         setComandoUsuario("");
         return;
      }

      // C. LIGAR / CONFIGURAR
      if (cmd.includes("ligar") || cmd.includes("config") || cmd.includes("fixo") || cmd.includes("70") || cmd.includes("80")) {
         if (!checklist.sedacaoFeita) {
             acionarCondutaErrada("ERRO CRÍTICO: Você tentou ligar o Marcapasso (Choque) sem realizar sedação/analgesia antes.");
             return;
         }
         setChecklist(prev => ({...prev, mpLigado: true}));
         setFeedbackSimulacao("Equipe: \"MP ligado em Modo Fixo. Frequência 70 bpm. Aguardando ajuste de corrente.\"");
         setComandoUsuario("");
         return;
      }

      // D. AUMENTAR CORRENTE / CAPTURA ELÉTRICA
      if (cmd.includes("aumentar") || cmd.includes("corrente") || cmd.includes("ma")) {
         if (!checklist.mpLigado) {
             setFeedbackSimulacao("Equipe: \"O aparelho ainda está desligado, doutor.\"");
             setComandoUsuario("");
             return;
         }
         setChecklist(prev => ({...prev, capturaEletrica: true}));
         setFeedbackSimulacao("Equipe: \"Aumentando mA... Temos captura elétrica no monitor! (Espícula seguida de QRS).\"");
         setComandoUsuario("");
         return;
      }

      // E. CHECAR PULSO (CAPTURA MECÂNICA)
      if (cmd.includes("pulso") || cmd.includes("femoral")) {
         if (!checklist.capturaEletrica) {
             setFeedbackSimulacao("Equipe: \"Ainda não visualizamos captura elétrica no monitor.\"");
             setComandoUsuario("");
             return;
         }
         setChecklist(prev => ({...prev, capturaMecanica: true}));
         setFeedbackSimulacao("Equipe: \"Checando pulso... Sim! Pulso femoral palpável e forte, sincrônico com o MP.\"");
         setComandoUsuario("");
         return;
      }

      // F. MARGEM DE SEGURANÇA (FIM)
      if (cmd.includes("margem") || cmd.includes("10%") || cmd.includes("seguranca")) {
         if (!checklist.capturaMecanica) {
             acionarCondutaErrada("Você ajustou a margem de segurança sem antes confirmar o pulso mecânico.");
             return;
         }
         setSinaisVitais({ ...sinaisVitais, fc: 70, pa: "110/70", consciencia: "Melhorando" }); 
         setFeedbackSimulacao("Equipe: \"Margem de segurança ajustada. Paciente estável. Ótimo trabalho, doutor!\"");
         setEtapaSimulacao("sucesso");
         setComandoUsuario("");
         return;
      }
      
      // Se digitou "marcapasso" genérico
      setFeedbackSimulacao("Equipe: \"Vamos preparar o Marcapasso. Por favor, guie a sequência: Pás, Sedação, Ligar, Corrente, Pulso e Margem.\"");
    }

    // EXAME FÍSICO
    else if (cmd.includes("exame") || cmd.includes("ausculta") || cmd.includes("fisico")) {
      setFeedbackSimulacao("Equipe: \"Exame físico: Pulmões limpos, extremidades frias e pálidas. Perfusão > 4s.\"");
    }
    
    // COMANDO DESCONHECIDO (CATCH-ALL FINAL)
    else {
        setFeedbackSimulacao("Equipe: \"Doutor, essas informações não temos. Tente perguntar de outra forma, escrever de outro jeito ou siga os passos do fluxograma.\"");
    }

    if (esperandoDose !== "atropina") {
       setComandoUsuario("");
    }
  };

  // --- ESTILOS GERAIS ---
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box" as const
    },
    card: {
      backgroundColor: "white",
      width: "100%",
      maxWidth: "800px",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      textAlign: "center" as const,
      position: "relative" as const // Necessário para o overlay de erro
    },
    titulo: { color: "#1f2937", marginBottom: "20px", fontSize: "22px", fontWeight: "bold" },
    btnMenu: {
      width: "100%", padding: "18px", margin: "8px 0", borderRadius: "12px",
      border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer",
      color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
    },
    monitor: {
      backgroundColor: "#000", color: "#0f0", padding: "20px", borderRadius: "10px",
      fontFamily: "Courier New, monospace", marginBottom: "20px", textAlign: "left" as const,
      border: "4px solid #333",
      animation: "fadeIn 0.5s"
    },
    valVital: { fontSize: "28px", fontWeight: "bold", display: "block" },
    labelVital: { fontSize: "12px", color: "#666", textTransform: "uppercase" },
    
    // FEEDBACK MAIOR E COM DESTAQUE (EMOJIS REDUZIDOS)
    feedbackBox: {
      backgroundColor: "#f0f9ff", 
      color: "#0369a1", 
      padding: "25px", 
      borderRadius: "12px",
      marginBottom: "25px", 
      fontSize: "18px", 
      borderLeft: "8px solid #0ea5e9",
      textAlign: "left" as const,
      fontStyle: "italic",
      fontWeight: "500",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      lineHeight: "1.6" 
    },
    
    inputCmd: {
      width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #ddd",
      fontSize: "16px", outline: "none", marginBottom: "10px",
      boxSizing: "border-box" as const
    },
    btnEnviar: {
      padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none",
      borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%",
      boxSizing: "border-box" as const
    },
    // ESTILO PARA O OVERLAY DE ERRO
    errorOverlay: {
        position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.98)", borderRadius: "16px",
        display: "flex", flexDirection: "column" as const, justifyContent: "center", alignItems: "center",
        padding: "30px", boxSizing: "border-box" as const, zIndex: 10
    },
    btnErro: {
        padding: "12px 24px", border: "none", borderRadius: "8px",
        fontWeight: "bold", cursor: "pointer", color: "white", fontSize: "14px", margin: "0 10px"
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DAS TELAS
  // ==========================================

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
        </div>
      </div>
    );
  }

  if (telaAtual === "selecao_bradi") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <button onClick={irParaMenu} style={{float: "left", background: "none", border: "none", fontSize: "20px", cursor: "pointer"}}>⬅</button>
          <h2 style={styles.titulo}>Bradicardias</h2>
          <p style={{marginBottom: "30px", color: "#666"}}>Escolha o modo de uso:</p>
          <button style={{...styles.btnMenu, backgroundColor: "#10b981"}} onClick={() => setTelaAtual("fluxo_bradi")}>
            📖 Fluxo de Atendimento
          </button>
          <button style={{...styles.btnMenu, backgroundColor: "#8b5cf6"}} onClick={() => setTelaAtual("treino_bradi")}>
            🎮 Modo Treino (Simulação)
          </button>
        </div>
      </div>
    );
  }

  if (telaAtual === "fluxo_bradi") {
    const dados = protocoloBradicardia[passoFluxo as keyof typeof protocoloBradicardia];
    const corTopo = { neutro: "#3b82f6", sucesso: "#10b981", alerta: "#f59e0b", perigo: "#ef4444", azul: "#0ea5e9" };
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
              {dados.instrucoes.map((t, i) => <li key={i} style={{marginBottom: "8px"}}>{t}</li>)}
            </ol>
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            {dados.opcoes.map((op, i) => (
              <button 
                key={i} 
                // @ts-ignore
                onClick={() => setPassoFluxo(op.proximoId)}
                // @ts-ignore
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

  // 4. TELA: SIMULAÇÃO / TREINO (COM LÓGICA DE MONITOR E DOSES)
  if (telaAtual === "treino_bradi") {
    const isApresentacao = etapaSimulacao === "apresentacao_caso";

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          
          {/* === OVERLAY DE CONDUTA ERRADA === */}
          {msgErroAtual && (
            <div style={styles.errorOverlay}>
                <div style={{textAlign: "center", maxWidth: "80%"}}>
                    <h2 style={{color: "#b91c1c", marginBottom: "20px", fontSize: "24px"}}>⚠️ Conduta Incorreta</h2>
                    
                    {!mostrarDica ? (
                        <div style={{marginBottom: "30px"}}>
                            <p style={{color: "#555", marginBottom: "15px"}}>Você cometeu um erro crítico no protocolo.</p>
                            <div style={{display: "flex", justifyContent: "center", gap: "20px"}}>
                                <button 
                                    style={{...styles.btnErro, backgroundColor: "#f59e0b", color: "white"}}
                                    onClick={() => setMostrarDica(true)}
                                >
                                    👁️ Ver Dica
                                </button>
                                <button 
                                    style={{...styles.btnErro, backgroundColor: "#ef4444"}} 
                                    onClick={resetSimulacao}
                                >
                                    🔄 Reiniciar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{backgroundColor: "#fee2e2", padding: "20px", borderRadius: "10px", marginBottom: "30px", color: "#7f1d1d", fontSize: "18px", animation: "fadeIn 0.5s"}}>
                                <strong>Dica do Protocolo:</strong><br/><br/>
                                {msgErroAtual}
                            </div>
                            <div style={{display: "flex", justifyContent: "center", gap: "20px"}}>
                                <button 
                                    style={{...styles.btnErro, backgroundColor: "#3b82f6"}} 
                                    onClick={continuarAposDica}
                                >
                                    ✅ Continuar
                                </button>
                                <button 
                                    style={{...styles.btnErro, backgroundColor: "#ef4444"}} 
                                    onClick={resetSimulacao}
                                >
                                    🔄 Reiniciar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
          )}
          
          <h2 style={{...styles.titulo, fontSize: "18px", marginBottom: "10px"}}>Caso Clínico</h2>

          {isApresentacao && (
            <div style={{animation: "fadeIn 0.5s"}}>
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <video 
                  autoPlay loop muted playsInline width="100%" 
                  style={{ borderRadius: "10px", maxHeight: "300px", maxWidth: "400px", objectFit: "cover", backgroundColor: "#000", pointerEvents: "none", margin: "0 auto", display: "block" }}
                >
                  <source src="https://i.imgur.com/8o2hBrl.mp4" type="video/mp4" />
                </video>
              </div>
              <div style={{backgroundColor: "#fee2e2", borderLeft: "4px solid #ef4444", padding: "15px", textAlign: "left", marginBottom: "20px"}}>
                <p style={{margin: 0, fontWeight: "bold", color: "#b91c1c"}}>TRIAGEM: VERMELHO 🔴</p>
                <p style={{marginTop: "10px", fontSize: "15px", color: "#333"}}>
                  {cenarioInicial.historia}
                </p>
              </div>
              <h3 style={{color: "#d97706", fontWeight: "bold", marginBottom: "20px"}}>
                Qual a conduta imediata?
              </h3>
               <button 
                style={{...styles.btnMenu, backgroundColor: "#3b82f6", padding: "15px"}} 
                onClick={iniciarAvaliacao}
              >
                🩺 Iniciar Atendimento
              </button>
            </div>
          )}

          {!isApresentacao && (
            <div style={{animation: "fadeIn 0.5s", opacity: msgErroAtual ? 0.3 : 1, pointerEvents: msgErroAtual ? "none" : "auto"}}>
              
              {/* ÁREA DO MONITOR - SÓ APARECE SE TIVER SIDO SOLICITADO */}
              {monitorVisivel && (
                <div style={styles.monitor}>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                      <span style={styles.labelVital}>FC (bpm)</span>
                      <span style={{...styles.valVital, color: sinaisVitais.fc < 50 ? "#ff4444" : "#0f0"}}>{sinaisVitais.fc}</span>
                    </div>
                    <div>
                      <span style={styles.labelVital}>PA (mmHg)</span>
                      {/* LÓGICA: SÓ MOSTRA PA SE TIVER FEITO O CHECK DE PA */}
                      <span style={{...styles.valVital, color: checklist.paAferida ? (parseInt(sinaisVitais.pa) < 90 ? "#ff4444" : "#0f0") : "#333"}}>
                          {checklist.paAferida ? sinaisVitais.pa : "--/--"}
                      </span>
                    </div>
                    <div>
                      <span style={styles.labelVital}>SatO2</span>
                      {/* LÓGICA: SÓ MOSTRA SAT SE TIVER FEITO O CHECK DE SAT */}
                      <span style={styles.valVital}>{checklist.satAferida ? sinaisVitais.sat + "%" : "--"}</span>
                    </div>
                  </div>
                </div>
              )}

               {/* ÁREA DO ECG (Se solicitado) */}
              {mostrarECG && (
                  <div style={{margin: "20px 0", textAlign: "center", animation: "fadeIn 0.5s"}}>
                      <img 
                          src="https://i.imgur.com/EVantJ0.gif" 
                          alt="ECG do Paciente" 
                          style={{maxWidth: "100%", borderRadius: "8px", border: "2px solid #333"}}
                      />
                      <p style={{fontSize: "14px", color: "#666", marginTop: "5px"}}>ECG de 12 Derivações (DII Longo)</p>
                  </div>
              )}

              {/* FEEDBACK DO SISTEMA (ALÇA FECHADA) */}
              <div style={styles.feedbackBox}>
                {feedbackSimulacao}
              </div>

              {/* ÁREA DE COMANDO DE TEXTO */}
              {(etapaSimulacao !== "sucesso" && etapaSimulacao !== "piora") && (
                <form onSubmit={enviarComando} style={{marginTop: "20px"}}>
                  <p style={{fontSize: "16px", fontWeight: "bold", marginBottom: "10px", color: "#1f2937"}}>
                    {esperandoDose ? `Qual a dose, Dr?` : (esperandoDiagnosticoECG ? "Qual o laudo, Dr?" : "Como deseja prosseguir, Dr?")}
                  </p>
                  <input 
                    type="text" 
                    placeholder="" 
                    style={styles.inputCmd}
                    value={comandoUsuario}
                    onChange={(e) => setComandoUsuario(e.target.value)}
                    autoFocus
                    disabled={!!msgErroAtual} // Desabilita input se houver erro na tela
                  />
                  <button type="submit" style={styles.btnEnviar} disabled={!!msgErroAtual}>Enviar Conduta</button>
                </form>
              )}

              {(etapaSimulacao === "sucesso" || etapaSimulacao === "piora") && (
                <button style={{...styles.btnMenu, backgroundColor: "#3b82f6"}} onClick={resetSimulacao}>
                  🔄 Reiniciar Caso
                </button>
              )}
            </div>
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