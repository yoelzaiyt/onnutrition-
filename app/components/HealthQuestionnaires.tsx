'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardList, 
  Stethoscope, 
  Brain, 
  Flame, 
  Dna, 
  Utensils, 
  Moon, 
  Activity,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  Send,
  BarChart3,
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { collection, query, onSnapshot, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { handleFirestoreError, OperationType } from '@/app/lib/firebase-service';

// --- Types ---

type Frequency = 'Nunca' | 'Às vezes' | 'Frequente' | 'Sempre';

interface Question {
  id: string;
  text: string;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  value: number; // 0, 1, 2, 3
}

interface QuestionnaireResult {
  id?: string;
  questionnaireId: string;
  score: number;
  status: 'Respondido' | 'Pendente';
  answers: Answer[];
  aiAnalysis?: string;
  lastUpdated: string;
}

// --- Data ---

const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'metabolico',
    title: 'Risco Metabólico',
    description: 'Avalia obesidade, resistência à insulina e síndrome metabólica.',
    icon: Stethoscope,
    color: 'text-blue-500',
    questions: [
      { id: 'm1', text: 'Circunferência abdominal elevada?' },
      { id: 'm2', text: 'Histórico de Diabetes Tipo 2?' },
      { id: 'm3', text: 'Pressão alta (Hipertensão)?' },
      { id: 'm4', text: 'Fadiga constante?' },
      { id: 'm5', text: 'Sono ruim?' },
    ]
  },
  {
    id: 'comportamento',
    title: 'Comportamento Alimentar',
    description: 'Detecta compulsão alimentar, comer emocional e falta de controle.',
    icon: Brain,
    color: 'text-purple-500',
    questions: [
      { id: 'c1', text: 'Come sem fome?' },
      { id: 'c2', text: 'Perde controle ao comer?' },
      { id: 'c3', text: 'Sente culpa após comer?' },
      { id: 'c4', text: 'Usa comida como recompensa?' },
    ]
  },
  {
    id: 'inflamacao',
    title: 'Inflamação Corporal',
    description: 'Indicadores de dores frequentes, inchaço e cansaço.',
    icon: Flame,
    color: 'text-orange-500',
    questions: [
      { id: 'i1', text: 'Sente inchaço abdominal?' },
      { id: 'i2', text: 'Dores articulares frequentes?' },
      { id: 'i3', text: 'Fadiga ao acordar?' },
      { id: 'i4', text: 'Problemas de pele?' },
    ]
  },
  {
    id: 'hormonal',
    title: 'Saúde Hormonal',
    description: 'Avalia desequilíbrios hormonais e metabolismo lento.',
    icon: Dna,
    color: 'text-pink-500',
    questions: [
      { id: 'h1', text: 'Queda de cabelo?' },
      { id: 'h2', text: 'Baixa libido?' },
      { id: 'h3', text: 'Oscilação de humor?' },
      { id: 'h4', text: 'Dificuldade para emagrecer?' },
    ]
  },
  {
    id: 'digestiva',
    title: 'Saúde Digestiva',
    description: 'Avalia intestino e absorção de nutrientes.',
    icon: Utensils,
    color: 'text-emerald-500',
    questions: [
      { id: 'd1', text: 'Constipação?' },
      { id: 'd2', text: 'Diarreia frequente?' },
      { id: 'd3', text: 'Gases excessivos?' },
      { id: 'd4', text: 'Refluxo?' },
    ]
  },
  {
    id: 'sono',
    title: 'Sono e Recuperação',
    description: 'Qualidade do descanso e reparação celular.',
    icon: Moon,
    color: 'text-indigo-500',
    questions: [
      { id: 's1', text: 'Dorme menos de 6h?' },
      { id: 's2', text: 'Acorda cansado?' },
      { id: 's3', text: 'Insônia?' },
      { id: 's4', text: 'Sono interrompido?' },
    ]
  },
  {
    id: 'estilo',
    title: 'Estilo de Vida',
    description: 'Sedentarismo, estresse e hábitos sociais.',
    icon: Activity,
    color: 'text-slate-500',
    questions: [
      { id: 'e1', text: 'Sedentarismo?' },
      { id: 'e2', text: 'Nível de estresse?' },
      { id: 'e3', text: 'Consumo de álcool?' },
      { id: 'e4', text: 'Rotina irregular?' },
    ]
  }
];

// --- Main Component ---

export default function HealthQuestionnaires({ patientId }: { patientId: string }) {
  const [view, setView] = useState<'dashboard' | 'quiz' | 'result'>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Questionnaire | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<QuestionnaireResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const populateMockData = async () => {
    if (!patientId) return;
    
    const mockResults: QuestionnaireResult[] = [
      {
        questionnaireId: 'metabolico',
        score: 12,
        status: 'Respondido',
        answers: [
          { questionId: 'm1', value: 3 },
          { questionId: 'm2', value: 1 },
          { questionId: 'm3', value: 2 },
          { questionId: 'm4', value: 3 },
          { questionId: 'm5', value: 3 },
        ],
        aiAnalysis: "O paciente apresenta um risco metabólico moderado a alto, com destaque para fadiga e sono de má qualidade. A circunferência abdominal elevada sugere resistência à insulina incipiente. Recomenda-se foco em higiene do sono e controle glicêmico.",
        lastUpdated: new Date().toISOString()
      },
      {
        questionnaireId: 'comportamento',
        score: 8,
        status: 'Respondido',
        answers: [
          { questionId: 'c1', value: 2 },
          { questionId: 'c2', value: 1 },
          { questionId: 'c3', value: 3 },
          { questionId: 'c4', value: 2 },
        ],
        aiAnalysis: "Comportamento alimentar com traços de comer emocional e culpa pós-refeição. É necessário trabalhar a relação com a comida e técnicas de mindful eating.",
        lastUpdated: new Date().toISOString()
      },
      {
        questionnaireId: 'digestiva',
        score: 10,
        status: 'Respondido',
        answers: [
          { questionId: 'd1', value: 3 },
          { questionId: 'd2', value: 0 },
          { questionId: 'd3', value: 3 },
          { questionId: 'd4', value: 2 },
        ],
        aiAnalysis: "Sintomas digestivos significativos, principalmente constipação e gases. Sugere-se aumento na ingestão de fibras solúveis e hidratação, além de avaliação de intolerâncias alimentares.",
        lastUpdated: new Date().toISOString()
      }
    ];

    for (const res of mockResults) {
      await saveResult(res);
    }
  };

  // --- Firestore Integration ---

  useEffect(() => {
    if (!patientId) return;

    const q = query(collection(db, 'patients', patientId, 'questionnaireResults'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionnaireResult[];
      setResults(fetchedResults);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching questionnaire results:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  const saveResult = async (result: QuestionnaireResult) => {
    if (!patientId || !auth.currentUser) return;

    try {
      const resultId = result.id || result.questionnaireId;
      const docRef = doc(db, 'patients', patientId, 'questionnaireResults', resultId);
      await setDoc(docRef, {
        ...result,
        createdBy: auth.currentUser.uid,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `patients/${patientId}/questionnaireResults`);
    }
  };

  // --- AI Analysis ---

  const generateAIAnalysis = async (quiz: Questionnaire, result: QuestionnaireResult) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Resultados do questionário para o paciente.
        Questionário: ${quiz.title}
        Descrição: ${quiz.description}
        Respostas (0=Nunca, 1=Às vezes, 2=Frequente, 3=Sempre):
        ${result.answers.map(a => {
          const q = quiz.questions.find(q => q.id === a.questionId);
          return `- ${q?.text}: ${a.value}`;
        }).join('\n')}`,
        config: {
          systemInstruction: `Você é um nutricionista clínico especialista em triagem metabólica e funcional.
        Analise os resultados do questionário "${quiz.title}" e forneça uma análise técnica, porém humanizada.
        A análise deve incluir:
        1. Interpretação do Score (Score atual: ${result.score} de um máximo de ${quiz.questions.length * 3}).
        2. Principais pontos de atenção baseados nas respostas.
        3. Recomendações práticas e imediatas.
        4. Sugestão de próximos passos clínicos.
        Mantenha o tom profissional, encorajador e direto. Máximo de 3 parágrafos.`,
        }
      });

      const response = await model;
      const analysis = response.text || "Não foi possível gerar a análise no momento.";
      
      // Update result with AI analysis
      const updatedResult = { ...result, aiAnalysis: analysis };
      await saveResult(updatedResult);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Logic ---

  const handleStartQuiz = (quiz: Questionnaire) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setCurrentAnswers([]);
    setView('quiz');
  };

  const handleAnswer = async (value: number) => {
    if (!selectedQuiz) return;
    
    const questionId = selectedQuiz.questions[currentQuestionIndex].id;
    const newAnswers = [...currentAnswers, { questionId, value }];
    setCurrentAnswers(newAnswers);

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finish Quiz
      const score = newAnswers.reduce((acc, curr) => acc + curr.value, 0);
      const newResult: QuestionnaireResult = {
        questionnaireId: selectedQuiz.id,
        score,
        status: 'Respondido',
        answers: newAnswers,
        lastUpdated: new Date().toISOString()
      };
      
      await saveResult(newResult);
      setView('result');
      
      // Trigger AI Analysis
      generateAIAnalysis(selectedQuiz, newResult);
    }
  };

  const getClassification = (score: number) => {
    if (score <= 10) return { label: 'Baixo Risco', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (score <= 20) return { label: 'Moderado', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    if (score <= 30) return { label: 'Alto', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    return { label: 'Crítico', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
  };

  const generalHealthScore = useMemo(() => {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(totalScore / results.length);
  }, [results]);

  const activeAlerts = useMemo(() => {
    const alerts = [];
    results.forEach(res => {
      if (res.score >= 21) {
        const quiz = QUESTIONNAIRES.find(q => q.id === res.questionnaireId);
        alerts.push({ quiz: quiz?.title, score: res.score });
      }
    });
    return alerts;
  }, [results]);

  const radarData = useMemo(() => {
    return QUESTIONNAIRES.map(quiz => {
      const result = results.find(r => r.questionnaireId === quiz.id);
      return {
        subject: quiz.title,
        A: result ? result.score : 0,
        fullMark: quiz.questions.length * 3,
      };
    });
  }, [results]);

  const getAIDiagnosis = () => {
    if (!selectedQuiz || view !== 'result') return null;
    const result = results.find(r => r.questionnaireId === selectedQuiz.id);
    if (!result) return null;

    if (isAnalyzing) return "Analisando dados com IA...";
    if (result.aiAnalysis) return result.aiAnalysis;
    
    return "Aguardando análise da IA...";
  };

  // --- Render Dashboard ---

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#22B391] animate-spin" />
        </div>
      );
    }

    return (
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#0B2B24]">Questionários de Saúde</h2>
            <div className="flex items-center gap-4">
              <p className="text-slate-400 font-bold text-sm">Triagem clínica avançada e monitoramento de riscos.</p>
              <button 
                onClick={populateMockData}
                className="text-[10px] font-black text-[#22B391] uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Popular com Dados de Exemplo
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Geral</p>
                <p className="text-xl font-black text-[#0B2B24]">{generalHealthScore}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas Ativos</p>
                <p className="text-xl font-black text-[#0B2B24]">{activeAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUESTIONNAIRES.map((quiz) => {
              const result = results.find(r => r.questionnaireId === quiz.id);
              const classification = result ? getClassification(result.score) : null;
              
              return (
                <motion.div 
                  key={quiz.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${quiz.color}`}>
                        <quiz.icon className="w-6 h-6" />
                      </div>
                      {result ? (
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${classification?.bg} ${classification?.color}`}>
                          {classification?.label}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400">
                          Pendente
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#0B2B24] mb-2">{quiz.title}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">{quiz.description}</p>
                  </div>

                  <div className="space-y-4">
                    {result && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                        <span className="text-sm font-black text-[#0B2B24]">{result.score} pts</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleStartQuiz(quiz)}
                      className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        result 
                          ? 'bg-slate-50 text-slate-500 hover:bg-slate-100' 
                          : 'bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20 hover:scale-105'
                      }`}
                    >
                      {result ? 'Refazer Teste' : 'Iniciar Agora'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="text-lg font-black text-[#0B2B24] mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#22B391]" />
                Perfil de Saúde
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 15]} tick={false} axisLine={false} />
                    <Radar
                      name="Saúde"
                      dataKey="A"
                      stroke="#22B391"
                      fill="#22B391"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {activeAlerts.length > 0 && (
              <div className="space-y-4">
                {activeAlerts.map((alert, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Alerta Crítico</p>
                      <p className="text-sm font-black text-red-700">{alert.quiz}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Render Quiz ---

  const renderQuiz = () => {
    if (!selectedQuiz) return null;
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Cancelar
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Questionário</p>
            <p className="text-sm font-black text-[#0B2B24]">{selectedQuiz.title}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
          <div className="w-full mb-12">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black text-[#22B391] uppercase tracking-widest">Pergunta {currentQuestionIndex + 1} de {selectedQuiz.questions.length}</span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#22B391]"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-12 w-full"
            >
              <h2 className="text-3xl font-black text-[#0B2B24] leading-tight">{currentQuestion.text}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Nunca', value: 0, color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                  { label: 'Às vezes', value: 1, color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' },
                  { label: 'Frequente', value: 2, color: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200' },
                  { label: 'Sempre', value: 3, color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.value)}
                    className={`p-6 rounded-3xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-sm transition-all bg-white ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // --- Render Result ---

  const renderResult = () => {
    if (!selectedQuiz) return null;
    const result = results.find(r => r.questionnaireId === selectedQuiz.id);
    if (!result) return null;
    const classification = getClassification(result.score);
    const diagnosis = getAIDiagnosis();

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#0B2B24]">Resultado da Triagem</h2>
            <p className="text-slate-400 font-bold text-sm">Análise concluída para {selectedQuiz.title}.</p>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Voltar ao Painel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Score Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center border border-slate-50">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="96" cy="96" r="80" 
                    stroke="currentColor" strokeWidth="16" 
                    fill="transparent" 
                    strokeDasharray={502} 
                    strokeDashoffset={502 - (502 * Math.min(result.score, selectedQuiz.questions.length * 3)) / (selectedQuiz.questions.length * 3)} 
                    className={classification.color} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-[#0B2B24]">{result.score}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pontos</span>
                </div>
              </div>
              <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-2 ${classification.bg} ${classification.color}`}>
                {classification.label}
              </div>
              <p className="text-xs text-slate-400 font-bold max-w-[200px]">
                O score indica o nível de atenção necessário para esta categoria.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Perfil Comparativo</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 8, fontWeight: 700 }} />
                    <Radar
                      name="Saúde"
                      dataKey="A"
                      stroke="#22B391"
                      fill="#22B391"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Analysis & Recommendations */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0B2B24] p-10 rounded-[48px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391] opacity-10 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-3xl bg-[#22B391] flex items-center justify-center shadow-lg shadow-[#22B391]/20">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Análise ONNutrition AI</h3>
                    <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest">Inteligência Nutricional Ativa</p>
                  </div>
                </div>
                <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm min-h-[120px] flex items-center justify-center">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 text-[#22B391] animate-spin" />
                      <p className="text-sm font-bold text-emerald-400/60 uppercase tracking-widest animate-pulse">Analisando com IA...</p>
                    </div>
                  ) : (
                    <p className="text-xl text-slate-200 font-medium leading-relaxed italic">
                      "{diagnosis}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-[#0B2B24] uppercase tracking-widest">Recomendações</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    'Ajustar ingestão de micronutrientes específicos.',
                    'Monitorar sintomas gastrointestinais por 7 dias.',
                    'Priorizar higiene do sono e redução de telas.'
                  ].map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22B391] mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-[#0B2B24] uppercase tracking-widest">Próximos Passos</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    'Agendar retorno em 15 dias.',
                    'Realizar exames laboratoriais sugeridos.',
                    'Iniciar diário alimentar no app.'
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between p-8 bg-emerald-50 rounded-[40px] border border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0B2B24]">Compartilhar Resultados</p>
                  <p className="text-xs text-emerald-600/70 font-bold">Enviar relatório completo para o nutricionista.</p>
                </div>
              </div>
              <button 
                className="px-8 py-4 bg-[#22B391] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#22B391]/20 hover:scale-105 transition-all"
              >
                Enviar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-[#F8FAFC] overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderDashboard()}
          </motion.div>
        )}
        {view === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            {renderQuiz()}
          </motion.div>
        )}
        {view === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderResult()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
