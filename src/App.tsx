import React, { useState, useRef, useEffect } from "react";

// ==========================================
// 0. CONFIGURAÇÃO DE TIPOS (PARA TYPESCRIPT)
// ==========================================
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
      "Dispneia (Dificuldade de respirar) / Congestão Pulmonar",
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
      "Administre Atropina IV:|||(1 mg em Bolus)", 
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
      "Dopamina EV:|||(5 a 20 mcg/kg/min)",
      "OU Epinefrina EV:|||(2 a 10 mcg/min)",
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
      "Ajuste a Frequência:|||(70 a 80 bpm)",
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
      "O pulso deve corresponder à frequência do Marcapasso."
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
      "Aumente 10% de segurança:|||(Ex: Se capturou com 50mA, deixe em 55mA)",
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
  const [feedbackSimulacao, setFeedbackSimulacao] = useState<React.ReactNode>(cenarioInicial.feedback);
  const [etapaSimulacao, setEtapaSimulacao] = useState("apresentacao_caso");
  const [comandoUsuario, setComandoUsuario] = useState("");
  const [monitorVisivel, setMonitorVisivel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mostrarECG, setMostrarECG] = useState(false);
  const [esperandoDiagnosticoECG, setEsperandoDiagnosticoECG] = useState(false);
  const [tentativasECG, setTentativasECG] = useState(0);
  const [esperandoDose, setEsperandoDose] = useState<string | null>(null);
  const [atropinaCount, setAtropinaCount] = useState(0);
  const [esperandoTipoMp, setEsperandoTipoMp] = useState(false);
  const [checklist, setChecklist] = useState({
    movFeito: false, paAferida: false, satAferida: false, estabilidadeChecada: false,
    ecgFeito: false, atropinaFeita: false, tipoMpDefinido: false, pasColocadas: false,
    sedacaoFeita: false, mpLigado: false, capturaEletrica: false, capturaMecanica: false
  });
  const [msgErroAtual, setMsgErroAtual] = useState<string | null>(null);
  const [mostrarDica, setMostrarDica] = useState(false);

  // --- REFS PARA O SCROLL HÍBRIDO ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // VELOCIDADE FIXADA EM 0.65
  const BASE_SPEED = 0.70; 
  
  const currentSpeedRef = useRef(BASE_SPEED); 
  const targetSpeedRef = useRef(BASE_SPEED); 
  const animationFrameRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);

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
    setEsperandoTipoMp(false);
    setMsgErroAtual(null);
    setMostrarDica(false);
    setChecklist({
      movFeito: false,
      paAferida: false,
      satAferida: false,
      estabilidadeChecada: false,
      ecgFeito: false,
      atropinaFeita: false,
      tipoMpDefinido: false,
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

  const acionarCondutaErrada = (motivo: string) => {
    setMsgErroAtual(motivo);
    setMostrarDica(false);
    setComandoUsuario("");
  };

  const continuarAposDica = () => {
      setMsgErroAtual(null);
      setMostrarDica(false);
  };

  // =========================================================
  // LOGICA DO SCROLL HÍBRIDO (AUTO + MOUSE)
  // =========================================================
  const handleMouseMoveScroll = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    const { left, width } = scrollContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left; 
    const percentage = mouseX / width; 

    // LÓGICA DE VELOCIDADE
    if (percentage < 0.25) {
        // Borda Esquerda: Acelera pra esquerda (negativo)
        targetSpeedRef.current = -12 * (1 - (percentage / 0.25)) - BASE_SPEED; 
    } else if (percentage > 0.75) {
        // Borda Direita: Acelera pra direita (positivo)
        targetSpeedRef.current = 12 * ((percentage - 0.75) / 0.25) + BASE_SPEED;
    } else {
        // CENTRO: QUASE PARANDO (Velocidade muito baixa para leitura)
        targetSpeedRef.current = 0.2; 
    }
  };

  const handleMouseLeaveScroll = () => {
      // Saiu do módulo: Volta para velocidade padrão
      targetSpeedRef.current = BASE_SPEED;
  };

  // Loop de animação com FÍSICA (Inércia)
  useEffect(() => {
      const loop = () => {
          if (scrollContainerRef.current) {
              const container = scrollContainerRef.current;

              // Suavização (Easing) para transição de velocidade fluida
              const easingFactor = 0.05;
              currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * easingFactor;
              
              container.scrollLeft += currentSpeedRef.current;
              scrollPosRef.current += currentSpeedRef.current; // Mantem controle no ref float

              // LÓGICA DE REINÍCIO PERFEITO
              // Largura do Card (300px) + Gap (25px) = 325px
              // 5 Cards únicos * 325px = 1625px (Tamanho de 1 Bloco)
              // Usamos 6 blocos no array abaixo para garantir buffer infinito
              const singleBlockWidth = 1625;

              // Quando passar de 2 blocos completos, volta 1 bloco
              // Isso mantém a posição visual inalterada, mas reseta o numero
              if (scrollPosRef.current >= singleBlockWidth * 2) {
                  container.scrollLeft -= singleBlockWidth;
                  scrollPosRef.current -= singleBlockWidth;
              } 
              // Se rolar pra trás (mouse na esquerda)
              else if (scrollPosRef.current <= singleBlockWidth) {
                  container.scrollLeft += singleBlockWidth;
                  scrollPosRef.current += singleBlockWidth;
              }
          }
          animationFrameRef.current = requestAnimationFrame(loop);
      };
      
      // Inicia o scroll um pouco a frente para ter buffer para esquerda
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 1625 * 1.5;
          scrollPosRef.current = 1625 * 1.5;
      }

      loop();
      
      return () => {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
  }, []);


  // =========================================================
  // FUNÇÃO DE GRAVAÇÃO DE VOZ (SPEECH TO TEXT)
  // =========================================================
  const iniciarGravacao = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setComandoUsuario(transcript.replace(/\.$/, "")); 
    };

    recognition.start();
  };

  // --- LÓGICA DO "CÉREBRO" (RIGOROSO COM O FLUXOGRAMA) ---
  const enviarComando = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comandoUsuario) return;

    const cmd = comandoUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (esperandoDiagnosticoECG) {
        if (cmd.includes("sinusal") && (cmd.includes("bradi") || cmd.includes("lento"))) {
            setFeedbackSimulacao("✅ EXCELENTE! Diagnóstico correto: Bradicardia Sinusal.\n\nO ritmo é regular, tem onda P antes de todo QRS, mas a frequência está baixa (<50 bpm).\n\nQual o próximo passo, doutor?");
            setEsperandoDiagnosticoECG(false);
            setMostrarECG(false);
        } else {
            const mensagensErro = [
                "🤔 Diagnóstico incorreto, doutor. Observe com calma: Existe onda P antes de cada QRS?",
                "⚠️ Tente outro diagnóstico.",
                "❌ O impulso nasce no nó sinusal, mas está lento.",
                "👀 Olhe o DII longo. Onda P positiva, seguida de QRS estreito... Qual o nome?"
            ];
            const msgAtual = mensagensErro[tentativasECG % mensagensErro.length];
            setFeedbackSimulacao(msgAtual);
            setTentativasECG(prev => prev + 1);
        }
        setComandoUsuario("");
        return;
    }

    if (esperandoTipoMp) {
        if (cmd.includes("transcutaneo") || cmd.includes("externo")) {
            setChecklist(prev => ({...prev, tipoMpDefinido: true}));
            setFeedbackSimulacao("Equipe: \"Certo. Marcapasso Transcutâneo selecionado. Pode guiar a sequência (Pás, Sedação...)\"");
            setEsperandoTipoMp(false);
        } else if (cmd.includes("transvenoso")) {
            setFeedbackSimulacao("Equipe: \"Doutor, o acesso Transvenoso vai demorar para ser pego. A paciente está instável. Qual a opção mais rápida?\"");
        } else {
            setFeedbackSimulacao("Equipe: \"Por favor doutor, precisamos saber o tipo. Transvenoso ou Transcutâneo?\"");
        }
        setComandoUsuario("");
        return;
    }
    
    if (esperandoDose === "atropina") {
      if (
          cmd.includes("1mg") || 
          cmd.includes("1 mg") || 
          cmd.includes("1 miligrama") || 
          cmd.includes("um miligrama")
      ) {
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

    if (
      cmd.includes("sentindo") || cmd.includes("sente") || cmd.includes("ajudar") ||
      cmd.includes("queixa") || cmd.includes("fale") || cmd.includes("conte") ||
      (cmd.includes("o que") && cmd.includes("tem"))
    ) {
      setFeedbackSimulacao("Dona Creusa (com voz pastosa): \"Ai doutor... uma fraqueza que não passa... parece que a luz tá apagando... minha cabeça tá rodando...\"");
      setComandoUsuario("");
      return;
    }
    else if (cmd.includes("aconteceu") || cmd.includes("houve") || cmd.includes("tempo") || cmd.includes("quando")) {
      setFeedbackSimulacao("Acompanhante: \"Há mais ou menos 2 horas, doutor. Ela estava sentada vendo TV, levantou rápido e ficou pálida desse jeito, quase desmaiou.\"");
      setComandoUsuario("");
      return;
    }
    else if (cmd.includes("remedio") || cmd.includes("medicamento") || cmd.includes("toma") || cmd.includes("alergia")) {
      setFeedbackSimulacao("Acompanhante: \"Ela toma remédio pra pressão e pro coração, mas não sei o nome. Que eu saiba, não tem alergia a nada.\"");
      setComandoUsuario("");
      return;
    }
    else if (cmd.includes("historia") || cmd.includes("anamnese") || cmd.includes("antecedentes")) {
      setFeedbackSimulacao("Acompanhante: \"Ela é hipertensa e tem problema cardíaco antigo. Nunca desmaiou assim antes.\"");
      setComandoUsuario("");
      return;
    }

    else if (cmd.includes("instavel") || cmd.includes("instabilidade")) {
      setChecklist(prev => ({...prev, estabilidadeChecada: true}));
      setFeedbackSimulacao(
        <div>
          <p style={{margin: "0 0 10px 0", color: "#059669", fontWeight: "bold"}}>✅ PARABÉNS! AVALIAÇÃO CORRETA.</p>
          <p style={{margin: "0 0 10px 0"}}>Você identificou corretamente a <strong>Instabilidade Hemodinâmica</strong>.</p>
          <p style={{margin: "0 0 5px 0"}}>Lembre-se sempre dos <strong>4 D's da Instabilidade</strong>:</p>
          <ul style={{margin: "0 0 10px 0", paddingLeft: "20px", textAlign: "left"}}>
            <li><strong>D</strong>or Torácica (Angina)</li>
            <li><strong>D</strong>ispneia (Congestão Pulmonar)</li>
            <li><strong>D</strong>iminuição da Consciência</li>
            <li><strong>D</strong>iminuição da PA (Hipotensão/Choque)</li>
          </ul>
        </div>
      );
      setComandoUsuario("");
      return;
    }
    
    else if (cmd.includes("estavel") && !cmd.includes("instavel")) {
        acionarCondutaErrada("Cuidado doutor. Avalie novamente. PA 80/40 e Sonolência são sinais de estabilidade?");
        return;
    }

    else if (cmd.includes("dor") || cmd.includes("peito") || cmd.includes("angina")) {
      setFeedbackSimulacao("Dona Creusa: \"Não, doutor. Não sinto dor no peito.\" (Dor Anginosa: AUSENTE)");
      setComandoUsuario("");
      return;
    }
    else if ((cmd.includes("falta") && cmd.includes("ar")) || cmd.includes("dispneia") || (cmd.includes("dificuldade") && cmd.includes("respirar"))) {
      setFeedbackSimulacao("Dona Creusa: \"O ar entra normal, não sinto falta de ar não.\" (Dispneia: AUSENTE)");
      setComandoUsuario("");
      return;
    }
    else if (cmd.includes("consciencia") || cmd.includes("desmaio") || cmd.includes("sonolencia")) {
      setFeedbackSimulacao("Acompanhante: \"Ela está muito sonolenta, doutor!\" (Diminuição da Consciência: PRESENTE)");
      setComandoUsuario("");
      return;
    }
    else if (cmd.includes("hipotensao") || (cmd.includes("diminuicao") && cmd.includes("pa"))) {
      setFeedbackSimulacao("Equipe: \"A PA está 80/40 mmHg. Isso configura Hipotensão, doutor? (Aguardando sua classificação)\"");
      setComandoUsuario("");
      return;
    }

    else if (cmd.includes("monitor") || cmd.includes("mov") || cmd.includes("oxigenio") || cmd.includes("veia")) {
      let respostaEquipe = "Equipe: \"Compreendido.\"";
      if (cmd.includes("monitor") || cmd.includes("mov")) {
          setMonitorVisivel(true);
          respostaEquipe = "Equipe: \"Monitor conectado. O2 instalado e acesso garantido.\"";
      } else {
        respostaEquipe = "Equipe: \"Acesso e O2 instalados. Aguardando monitorização.\"";
      }
      setChecklist(prev => ({...prev, movFeito: true}));
      setFeedbackSimulacao(respostaEquipe);
    }

    else if (cmd.includes("ecg") || cmd.includes("eletro")) {
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você solicitou ECG antes de monitorizar o paciente (MOV).");
        return;
      }
      setChecklist(prev => ({...prev, ecgFeito: true}));
      setMostrarECG(true);
      setEsperandoDiagnosticoECG(true);
      setFeedbackSimulacao("Equipe: \"Rodando ECG... Pronto. Qual o seu laudo?\"");
    }

    else if (cmd.includes("pa") || cmd.includes("pressao") || cmd.includes("estabilidade") || cmd.includes("sinais") || cmd.includes("sinais vitais")) {
      
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você tentou avaliar sinais vitais sem monitorizar o paciente (MOV) antes.");
        return;
      }
      
      setChecklist(prev => ({...prev, paAferida: true, satAferida: true}));
      setFeedbackSimulacao("Equipe: \"Doutor(a), aqui estão os dados: PA 80/40 mmHg, FC 36 bpm, SatO2 94% em ar ambiente. Extremidades frias.\"");
    }

    else if (cmd.includes("atropina")) {
      if (!checklist.movFeito) {
        acionarCondutaErrada("Você tentou medicar sem realizar o MOV antes.");
        return;
      }
      if (!checklist.estabilidadeChecada) {
        acionarCondutaErrada("A equipe precisa saber: O paciente está ESTÁVEL ou INSTÁVEL? (Classifique a instabilidade verbalmente antes de medicar).");
        return;
      }

      if (atropinaCount >= 3) {
        acionarCondutaErrada("Dose máxima de Atropina atingida.");
        return;
      }

      setFeedbackSimulacao("Equipe: \"Certo, Atropina. Qual a dose?\"");
      setEsperandoDose("atropina");
    }

    else if (cmd.includes("marcapasso") || cmd.includes("mp") || cmd.includes("pas") || cmd.includes("sedacao") || cmd.includes("ligar")) {
      
      if (!checklist.estabilidadeChecada) {
          acionarCondutaErrada("A equipe precisa saber: O paciente está ESTÁVEL ou INSTÁVEL? (Classifique a instabilidade verbalmente antes de indicar Marcapasso).");
          return;
      }
      
      if (!checklist.atropinaFeita && !cmd.includes("bavt")) {
          acionarCondutaErrada("O protocolo indica tentativa de Atropina antes do Marcapasso (exceto em BAVT imediato).");
          return;
      }

      if ((cmd.includes("marcapasso") || cmd.includes("mp")) && !checklist.tipoMpDefinido && !cmd.includes("transcutaneo")) {
          setEsperandoTipoMp(true);
          setFeedbackSimulacao("Equipe: \"Entendido, indicação de Marcapasso. Qual o tipo de Marcapasso vamos usar?\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("pas") || cmd.includes("conectar")) {
          if (!checklist.tipoMpDefinido) { setEsperandoTipoMp(true); setFeedbackSimulacao("Qual o tipo de marcapasso?"); return; }

          setChecklist(prev => ({...prev, pasColocadas: true}));
          setFeedbackSimulacao("Equipe: \"Pás conectadas. Marcapasso Transcutâneo em Stand-by.\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("sedacao") || cmd.includes("analgesia")) {
          if (!checklist.pasColocadas) {
              setFeedbackSimulacao("Equipe: \"Doutor, as pás ainda não foram conectadas.\"");
              setComandoUsuario("");
              return;
          }
          setChecklist(prev => ({...prev, sedacaoFeita: true}));
          setFeedbackSimulacao("Equipe: \"Analgesia realizada. Paciente sedada.\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("ligar") || cmd.includes("config") || cmd.includes("fixo")) {
          if (!checklist.sedacaoFeita) {
              acionarCondutaErrada("ERRO CRÍTICO: Sedação necessária antes de ligar o Marcapasso.");
              return;
          }
          setChecklist(prev => ({...prev, mpLigado: true}));
          setFeedbackSimulacao("Equipe: \"Marcapasso ligado em Modo Fixo. Frequência 70 bpm. Aguardando ajuste de corrente.\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("aumentar") || cmd.includes("corrente")) {
          if (!checklist.mpLigado) {
              setFeedbackSimulacao("Equipe: \"O Marcapasso ainda está desligado.\"");
              setComandoUsuario("");
              return;
          }
          setChecklist(prev => ({...prev, capturaEletrica: true}));
          setFeedbackSimulacao("Equipe: \"Aumentando mA... Temos captura elétrica no monitor!\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("pulso") || cmd.includes("femoral")) {
          if (!checklist.capturaEletrica) {
              setFeedbackSimulacao("Equipe: \"Ainda não visualizamos captura elétrica.\"");
              return;
          }
          setChecklist(prev => ({...prev, capturaMecanica: true}));
          setFeedbackSimulacao("Equipe: \"Checando pulso... Sim! Pulso femoral palpável, sincrônico com o Marcapasso.\"");
          setComandoUsuario("");
          return;
      }

      if (cmd.includes("margem") || cmd.includes("10%") || cmd.includes("seguranca")) {
          if (!checklist.capturaMecanica) {
              acionarCondutaErrada("Confirme o pulso mecânico antes de ajustar a margem.");
              return;
          }
          setSinaisVitais({ ...sinaisVitais, fc: 70, pa: "110/70", consciencia: "Melhorando" });
          setFeedbackSimulacao("Equipe: \"Margem de segurança ajustada. Paciente estável com Marcapasso Transcutâneo. Ótimo trabalho!\"");
          setEtapaSimulacao("sucesso");
          setComandoUsuario("");
          return;
      }
      
      setFeedbackSimulacao("Equipe: \"Vamos preparar o Marcapasso. Guie a sequência: Pás, Sedação, Ligar, Corrente, Pulso e Margem.\"");
    }

    else if (cmd.includes("exame") || cmd.includes("ausculta")) {
      setFeedbackSimulacao("Equipe: \"Exame físico: Pulmões limpos, extremidades frias.\"");
    }
    
    else {
        setFeedbackSimulacao("Equipe: \"Não compreendi. Tente reformular a ordem.\"");
    }

    if (esperandoDose !== "atropina" && !esperandoTipoMp) {
      setComandoUsuario("");
    }
  };

  // --- DADOS DOS CARDS PARA O CARROSSEL ---
  const cardsData = [
    {
        id: "bradi",
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        imgSrc: "https://i.imgur.com/FC7vOtt.png",
        imgAlt: "Coração Vermelho Bradicardia",
        imgSize: "180px", 
        label: "EMERGÊNCIA",
        title: "Bradicardias",
        desc: "Organize condutas e salve vidas em 5 passos.",
        iconFooter: "https://i.imgur.com/FC7vOtt.png",
        textFooter: "App de Protocolos",
        btnText: "ABRIR",
        action: () => setTelaAtual("selecao_bradi")
    },
    {
        id: "taqui",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
        imgSrc: "https://i.imgur.com/oqjaMV4.png",
        imgAlt: "Raio Taquicardia",
        imgSize: "130px",
        label: "ARRITMIA",
        title: "Taquicardias",
        desc: "Diagnóstico e cardioversão rápida.",
        iconFooter: "https://i.imgur.com/oqjaMV4.png",
        textFooter: "Módulo em Breve",
        btnText: "ATUALIZAR",
        action: () => alert("Em construção: Módulo de Taquicardias em breve!")
    },
    {
        id: "pcr_chocavel",
        gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        imgSrc: "https://i.imgur.com/uPXPUD8.png", // IMAGEM DO USUÁRIO
        imgAlt: "Monitor FV TV",
        imgSize: "200px", 
        label: "PCR CHOCÁVEL",
        title: "FV e TV sem Pulso",
        desc: "Protocolo de desfibrilação imediata.",
        iconFooter: "https://i.imgur.com/uPXPUD8.png",
        textFooter: "Parada Cardíaca",
        btnText: "ABRIR",
        action: () => alert("Em construção: Protocolo de PCR Chocável")
    },
    {
        id: "assistolia",
        gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)", // Tons verdes
        imgSrc: "https://i.imgur.com/T4QxtYu.png", 
        imgAlt: "Linha reta Assistolia",
        imgSize: "210px", 
        label: "PCR NÃO CHOCÁVEL",
        title: "Assistolia e AESP",
        desc: "Protocolo de adrenalina e via aérea.",
        iconFooter: "https://i.imgur.com/T4QxtYu.png",
        textFooter: "Parada Cardíaca",
        btnText: "ABRIR",
        action: () => alert("Em construção: Protocolo de Assistolia/AESP")
    },
    {
        id: "sca",
        gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", // Tons vermelhos
        imgSrc: "https://i.imgur.com/lbebkzD.png", // IMAGEM DO USUÁRIO
        imgAlt: "Coração SCA",
        imgSize: "200px", 
        label: "CORONÁRIA",
        title: "S. Coronariana Aguda",
        desc: "IAM com e sem supra de ST.",
        iconFooter: "https://i.imgur.com/lbebkzD.png",
        textFooter: "Cardiologia",
        btnText: "ABRIR",
        action: () => alert("Em construção: Protocolo de SCA")
    }
  ];

  // AUMENTADO PARA 6 VEZES PARA GARANTIR BUFFER INFINITO
  const infiniteCards = [...cardsData, ...cardsData, ...cardsData, ...cardsData, ...cardsData, ...cardsData];

  // --- ESTILOS GERAIS ---
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box" as const
    },
    menuContainer: {
        width: "100%",
        // REMOVIDO MAX-WIDTH PARA OCUPAR TELA TODA
        padding: "20px 0",
        textAlign: "left" as const,
        overflow: "hidden" 
    },
    headerTitle: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#1c1c1e",
        marginBottom: "20px",
        paddingLeft: "10px"
    },
    sectionTitle: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#1c1c1e",
        marginBottom: "15px",
        paddingLeft: "10px",
        marginTop: "30px"
    },
    marqueeContainer: {
        overflow: "hidden", 
        width: "100%",
        padding: "40px 0", 
        marginTop: "-40px"
    },
    marqueeTrack: {
        display: "flex",
        gap: "25px",
        width: "max-content", 
        paddingLeft: "20px",
        paddingRight: "20px"
    },
    bigCard: {
        flex: "0 0 300px",
        minHeight: "380px",
        borderRadius: "20px",
        position: "relative" as const,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between"
    },
    cardTopPadding: {
         padding: "30px 20px 20px 20px",
         flex: "1 0 auto", 
         display: "flex",
         flexDirection: "column" as const,
         justifyContent: "flex-end", 
         zIndex: 2,
         color: "white",
         background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%)"
    },
    cardBottomBar: {
         padding: "15px 20px",
         display: "flex",
         alignItems: "center",
         justifyContent: "space-between",
         backgroundColor: "rgba(0,0,0,0.2)", 
         backdropFilter: "blur(10px)",
         borderTop: "1px solid rgba(255,255,255,0.15)",
         zIndex: 2,
         color: "white"
    },
    cardImage3D: {
        position: "absolute" as const,
        top: "30%", // IMAGEM MAIS ALTA
        left: "50%",
        transform: "translate(-50%, -50%)", 
        objectFit: "contain" as const,
        zIndex: 1,
        filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.4)) drop-shadow(0px 5px 10px rgba(0,0,0,0.2))"
    },
    textLabel: {
        fontSize: "12px", 
        opacity: 0.9, 
        textTransform: "uppercase" as const, 
        letterSpacing: "1px", 
        fontWeight: 700,
        marginBottom: "5px",
        textAlign: "left" as const
    },
    actionButton: {
        backgroundColor: "rgba(255,255,255,0.25)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white",
        padding: "8px 24px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
    },
    // ... (Outros estilos mantidos: smallCard, card, monitor, etc.)
    smallCard: {
        flex: "1 1 200px",
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        height: "160px",
        cursor: "not-allowed",
        opacity: 0.8
    },
    card: {
      backgroundColor: "white",
      width: "100%",
      maxWidth: "800px",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      textAlign: "center" as const,
      position: "relative" as const
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

  // --- NOVA TELA DE MENU ---
  if (telaAtual === "menu") {
    return (
      <div style={styles.container}>
        <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div style={styles.menuContainer}>
            <h1 style={styles.headerTitle}>Protocolos de Emergência</h1>
            
            <h3 style={styles.sectionTitle}>Comece Agora</h3>
            
            <div 
                style={styles.marqueeContainer}
                className="hide-scrollbar"
                ref={scrollContainerRef}
                onMouseMove={handleMouseMoveScroll}
                onMouseLeave={handleMouseLeaveScroll}
            >
                <div style={styles.marqueeTrack}>
                    {infiniteCards.map((card, index) => (
                        <div 
                            key={`${card.id}-${index}`}
                            onClick={card.action}
                            style={{...styles.bigCard, background: card.gradient}}
                        >
                            <img 
                                src={card.imgSrc} 
                                alt={card.imgAlt} 
                                style={{...styles.cardImage3D, width: card.imgSize, height: card.imgSize}} 
                            />
                            
                            <div style={styles.cardTopPadding}>
                                <p style={styles.textLabel}>{card.label}</p>
                                <h2 style={{margin: "0 0 8px 0", fontSize: "28px", fontWeight: 800}}>{card.title}</h2>
                                <p style={{margin: "0", fontSize: "15px", opacity: 0.95, lineHeight: "1.5", maxWidth: "90%"}}>
                                    {card.desc}
                                </p>
                            </div>

                            <div style={styles.cardBottomBar}>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <img src={card.iconFooter} style={{width: "24px", height: "24px", marginRight: "10px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"}} />
                                    <span style={{fontWeight: 600, fontSize: "15px"}}>{card.textFooter}</span>
                                </div>
                                <button style={styles.actionButton}>{card.btnText}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <h3 style={styles.sectionTitle}>Mais Protocolos</h3>
            <div style={{display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "flex-start", paddingLeft: "10px"}}>
                <div style={styles.smallCard}>
                    <div style={{fontSize: "30px", marginBottom: "10px"}}>🫀</div>
                    <div>
                        <h4 style={{margin: "0", color: "#333"}}>IAM com Supra</h4>
                        <p style={{fontSize: "12px", color: "#666", marginTop: "5px"}}>Trombolítico ou Angioplastia?</p>
                    </div>
                </div>
                 <div style={styles.smallCard}>
                    <div style={{fontSize: "30px", marginBottom: "10px"}}>🧠</div>
                    <div>
                        <h4 style={{margin: "0", color: "#333"}}>AVC Agudo</h4>
                        <p style={{fontSize: "12px", color: "#666", marginTop: "5px"}}>Protocolo de trombólise e janela.</p>
                    </div>
                </div>
                 <div style={styles.smallCard}>
                    <div style={{fontSize: "30px", marginBottom: "10px"}}>🦠</div>
                    <div>
                        <h4 style={{margin: "0", color: "#333"}}>Sepse 1h</h4>
                        <p style={{fontSize: "12px", color: "#666", marginTop: "5px"}}>Bundle da primeira hora.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MANTENDO AS OUTRAS TELAS INTACTAS ---
  if (telaAtual === "selecao_bradi") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <button onClick={irParaMenu} style={{float: "left", background: "none", border: "none", fontSize: "20px", cursor: "pointer"}}>⬅ Voltar</button>
          <div style={{clear: "both", marginTop: "20px"}}>
             <img src="https://i.imgur.com/FC7vOtt.png" style={{width: "80px", marginBottom: "10px"}} />
             <h2 style={styles.titulo}>Módulo de Bradicardias</h2>
          </div>
          <p style={{marginBottom: "30px", color: "#666"}}>Como você deseja estudar hoje?</p>
          <button style={{...styles.btnMenu, backgroundColor: "#10b981"}} onClick={() => setTelaAtual("fluxo_bradi")}>
            📖 Fluxo de Atendimento (Teoria)
          </button>
          <button style={{...styles.btnMenu, backgroundColor: "#8b5cf6"}} onClick={() => setTelaAtual("treino_bradi")}>
            🎮 Modo Treino (Simulação Real)
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
              {dados.instrucoes.map((t, i) => {
                const partes = t.split("|||");
                return (
                  <li key={i} style={{marginBottom: "8px"}}>
                    {partes.length > 1 ? (
                      <>
                        {partes[0]}
                        <strong style={{ display: "block", marginTop: "5px" }}>
                          ({partes[1]})
                        </strong>
                      </>
                    ) : (
                      t
                    )}
                  </li>
                );
              })}
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

  // 4. TELA: SIMULAÇÃO / TREINO
  if (telaAtual === "treino_bradi") {
    const isApresentacao = etapaSimulacao === "apresentacao_caso";

    return (
      <div style={styles.container}>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>

        <div style={styles.card}>
          
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
              
              {monitorVisivel && (
                <div style={styles.monitor}>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                      <span style={styles.labelVital}>FC (bpm)</span>
                      <span style={{...styles.valVital, color: sinaisVitais.fc < 50 ? "#ff4444" : "#0f0"}}>{sinaisVitais.fc}</span>
                    </div>
                    <div>
                      <span style={styles.labelVital}>PA (mmHg)</span>
                      <span style={{...styles.valVital, color: checklist.paAferida ? (parseInt(sinaisVitais.pa) < 90 ? "#ff4444" : "#0f0") : "#333"}}>
                          {checklist.paAferida ? sinaisVitais.pa : "--/--"}
                      </span>
                    </div>
                    <div>
                      <span style={styles.labelVital}>SatO2</span>
                      <span style={styles.valVital}>{checklist.satAferida ? sinaisVitais.sat + "%" : "--"}</span>
                    </div>
                  </div>
                </div>
              )}

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

              <div style={styles.feedbackBox}>
                {feedbackSimulacao}
              </div>

              {(etapaSimulacao !== "sucesso" && etapaSimulacao !== "piora") && (
                <form onSubmit={enviarComando} style={{marginTop: "20px"}}>
                  <p style={{fontSize: "16px", fontWeight: "bold", marginBottom: "10px", color: "#1f2937"}}>
                    {esperandoDose ? `Qual a dose, Dr?` : (esperandoDiagnosticoECG ? "Qual o laudo, Dr?" : (esperandoTipoMp ? "Qual o tipo, Dr?" : "Como deseja prosseguir, Dr?"))}
                  </p>
                  
                  <div style={{display: "flex", gap: "10px", marginBottom: "10px"}}>
                    <input
                      type="text"
                      placeholder="Digite ou fale sua conduta..."
                      style={{...styles.inputCmd, marginBottom: 0}}
                      value={comandoUsuario}
                      onChange={(e) => setComandoUsuario(e.target.value)}
                      autoFocus
                      disabled={!!msgErroAtual || isRecording}
                    />
                    
                    <button
                      type="button"
                      onClick={iniciarGravacao}
                      disabled={!!msgErroAtual || isRecording}
                      style={{
                        backgroundColor: isRecording ? "#ef4444" : "#cbd5e1",
                        border: "none",
                        borderRadius: "8px",
                        width: "50px",
                        cursor: "pointer",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        animation: isRecording ? "pulse 1.5s infinite" : "none"
                      }}
                      title="Gravar Áudio"
                    >
                      {isRecording ? "⬛" : "🎙️"}
                    </button>
                  </div>

                  <button type="submit" style={styles.btnEnviar} disabled={!!msgErroAtual || isRecording}>
                    Enviar Conduta
                  </button>
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