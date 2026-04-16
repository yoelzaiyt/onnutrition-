'use client';

import React, { useState } from 'react';
import { Quote, Star, Zap, ChevronRight, ArrowRight, Play, ChevronLeft, Leaf, Droplets, Apple, Carrot, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '@/app/components/ui/Logo';

import Image from 'next/image';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onDemoMode: () => void;
  hasConfig?: boolean;
}

const foodImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', title: 'Salada Colorida', category: 'Almoço Saudável', icon: Leaf },
  { id: 2, src: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800', title: 'Bowl de Frutas', category: 'Café da Manhã', icon: Apple },
  { id: 3, src: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=800', title: 'Smoothie Verde', category: 'Suco Detox', icon: Droplets },
  { id: 4, src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', title: 'Buddha Bowl', category: 'Almoço Nutritivo', icon: Leaf },
  { id: 5, src: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&q=80&w=800', title: 'Suco de Laranja', category: 'Suco Natural', icon: Droplets },
  { id: 6, src: 'https://images.unsplash.com/photo-1604937455095-ef3fe8c9e10d?auto=format&fit=crop&q=80&w=800', title: 'Avo toast', category: 'Café Saudável', icon: Apple },
  { id: 7, src: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800', title: 'Salada de Vegetais', category: 'Refeição Leve', icon: Carrot },
  { id: 8, src: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=800', title: 'Smoothie Frutas', category: 'Café da Manhã', icon: Droplets },
  { id: 9, src: 'https://images.unsplash.com/photo-1482049016gy-84b44a585fe1?auto=format&fit=crop&q=80&w=800', title: 'Panqueca Integral', category: 'Café Saudável', icon: Apple },
  { id: 10, src: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=800', title: 'Suco Verde', category: 'Detox', icon: Leaf },
  { id: 11, src: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=800', title: 'Salada Primavera', category: 'Almoço', icon: Carrot },
  { id: 12, src: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800', title: 'Açaí Bowl', category: 'Lanche Saudável', icon: Droplets },
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onDemoMode, hasConfig = true }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonials = [
    {
      quote: "O ONNutrition revolucionou minha prática. A IA que analisa as fotos dos pacientes me poupa horas de trabalho por semana.",
      author: "Dra. Camila Santos",
      role: "Nutricionista Esportiva",
      initials: "DCS"
    },
    {
      quote: "Migrei do Dietbox e não me arrependo. A estabilidade é muito superior e as teleconsultas integradas são um diferencial.",
      author: "Dr. Ricardo Lima",
      role: "Nutricionista Clínico",
      initials: "DRL"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <Logo showTagline={true} />
        
        <div className="hidden lg:flex items-center gap-10 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-[#22B391] transition-all">Recursos</a>
          <a href="#" className="hover:text-[#22B391] transition-all">Metodologia</a>
          <a href="#" className="hover:text-[#22B391] transition-all">Preços</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-slate-900 font-black text-sm hover:text-[#22B391] transition-all px-4"
          >
            Entrar
          </button>
          <button 
            onClick={onRegister}
            className="bg-[#0B2B24] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#22B391] transition-all shadow-2xl shadow-slate-200"
          >
            Começar Agora
          </button>
        </div>
      </nav>

      {/* Hero Section - Editorial Style */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E9F7F4] text-[#22B391] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Zap className="w-3 h-3 fill-current" />
                Inteligência Nutricional
              </div>
              
              <h1 className="text-[12vw] lg:text-[7rem] font-serif italic leading-[0.85] text-[#0B2B24] mb-10 tracking-[-0.04em]">
                O futuro da <br/>
                <span className="text-[#22B391] not-italic font-sans font-black uppercase tracking-tighter">Nutrição</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mb-12 font-medium leading-relaxed">
                A plataforma definitiva para nutricionistas que buscam excelência, automação e resultados reais para seus pacientes.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onRegister}
                  className="bg-[#22B391] text-white px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-[#22B391]/30 flex items-center gap-3"
                >
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={onDemoMode}
                  className="bg-white text-[#0B2B24] px-10 py-5 rounded-3xl font-black text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-3"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Ver Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-[#0B2B24] rounded-[4rem] overflow-hidden shadow-2xl relative group">
                <Image 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2000" 
                  alt="Healthy Food" 
                  fill
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B24] via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] text-white">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#22B391] text-[#22B391]" />
                      ))}
                    </div>
                    <p className="text-lg font-medium italic mb-6 leading-relaxed">
                      &quot;A melhor ferramenta que já usei para acompanhar meus pacientes em tempo real.&quot;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#22B391] rounded-full flex items-center justify-center font-black text-xs">CS</div>
                      <div>
                        <p className="font-black text-sm">Dra. Camila Santos</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-60">Nutricionista Esportiva</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#22B391] rounded-full blur-[80px] opacity-30" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF8C69] rounded-full blur-[100px] opacity-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Food Gallery */}
      <section className="py-20 px-6 bg-[#0B2B24]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              Inspire-se com receitas saudáveis
            </h2>
            <p className="text-white/60 text-lg font-medium">
             Descubra opções deliciosas e nutritivas para seus pacientes
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {foodImages.slice(0, 6).map((food, i) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group"
                >
                  <Image 
                    src={food.src}
                    alt={food.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl">
                      <p className="text-white font-black text-xs">{food.title}</p>
                      <p className="text-white/70 text-[10px]">{food.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              {[0, 1].map((slide) => (
                <button
                  key={slide}
                  onClick={() => setCurrentSlide(slide)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === slide ? 'bg-[#22B391] w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {foodImages.slice(6, 12).map((food, i) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group"
              >
                <Image 
                  src={food.src}
                  alt={food.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl">
                    <p className="text-white font-black text-xs">{food.title}</p>
                    <p className="text-white/70 text-[10px]">{food.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Nutricionistas', value: '5k+' },
              { label: 'Pacientes Ativos', value: '120k+' },
              { label: 'Refeições Analisadas', value: '2M+' },
              { label: 'Satisfação', value: '99%' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl lg:text-5xl font-black text-[#0B2B24] mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-6xl font-black text-[#0B2B24] mb-6 tracking-tight">Tudo o que você precisa.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Uma plataforma integrada que cuida de toda a jornada do seu paciente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Diário com IA', 
                desc: 'Análise automática de fotos de refeições usando visão computacional.',
                icon: Zap,
                color: 'bg-[#22B391]'
              },
              { 
                title: 'Prontuário Digital', 
                desc: 'Histórico completo, exames e anamnese em um só lugar.',
                icon: ChevronRight,
                color: 'bg-[#0B2B24]'
              },
              { 
                title: 'Fluxo de Pacientes', 
                desc: 'Gestão inteligente de entrada, espera e consulta em tempo real.',
                icon: ChevronRight,
                color: 'bg-[#FF8C69]'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                <div className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-[#0B2B24] mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B2B24] py-20 px-6 text-white text-center">
        <div className="max-w-7xl mx-auto">
          <Logo whiteOn={true} className="justify-center mb-12" showTagline={true} />
          <p className="text-white/40 text-sm font-bold tracking-widest uppercase mb-8">© 2026 ONNutrition. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            <a href="#" className="hover:text-[#22B391] transition-all">Privacidade</a>
            <a href="#" className="hover:text-[#22B391] transition-all">Termos</a>
            <a href="#" className="hover:text-[#22B391] transition-all">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
