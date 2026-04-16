'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Utensils, 
  Clock, 
  Flame, 
  ChevronRight, 
  Sparkles,
  Camera,
  Plus,
  Heart,
  Share2,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import { GoogleGenAI } from "@google/genai";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Recipe {
  id: string;
  title: string;
  description: string;
  calories: number;
  prep_time: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  category: string;
  image?: string;
  ingredients: string[];
  instructions: string[];
}

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'mock-1',
    title: 'Bowl de Quinoa e Abacate',
    description: 'Um prato equilibrado e rico em gorduras boas e proteínas vegetais.',
    calories: 420,
    prep_time: '15 min',
    difficulty: 'Fácil',
    category: 'Almoço',
    image: 'https://picsum.photos/seed/quinoa/800/600',
    ingredients: ['1 xícara de quinoa cozida', '1/2 abacate fatiado', 'Tomate cereja', 'Grão de bico', 'Molho de limão'],
    instructions: ['Cozinhe a quinoa', 'Disponha os ingredientes em um bowl', 'Tempere com limão e azeite']
  },
  {
    id: 'mock-2',
    title: 'Salmão Grelhado com Aspargos',
    description: 'Proteína de alta qualidade com vegetais crocantes e nutritivos.',
    calories: 380,
    prep_time: '25 min',
    difficulty: 'Médio',
    category: 'Jantar',
    image: 'https://picsum.photos/seed/salmon/800/600',
    ingredients: ['200g de filé de salmão', '1 maço de aspargos', 'Azeite de oliva', 'Ervas finas'],
    instructions: ['Tempere o salmão', 'Grelhe por 5 minutos de cada lado', 'Refogue os aspargos rapidamente']
  },
  {
    id: 'mock-3',
    title: 'Smoothie de Frutas Vermelhas',
    description: 'Antioxidante natural e refrescante para o café da manhã.',
    calories: 250,
    prep_time: '5 min',
    difficulty: 'Fácil',
    category: 'Café da Manhã',
    image: 'https://picsum.photos/seed/smoothie/800/600',
    ingredients: ['1 xícara de mix de berries', '200ml de leite de amêndoas', '1 colher de mel', 'Gelo'],
    instructions: ['Bata tudo no liquidificador', 'Sirva imediatamente']
  }
];

interface RecipeLibraryProps {
  patientId?: string;
  onBack?: () => void;
}

export default function RecipeLibrary({ patientId, onBack }: RecipeLibraryProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<{ [key: string]: boolean }>({});
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Recipe[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      
      if (!isSupabaseConfigured) {
        setRecipes(MOCK_RECIPES);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        console.error('Error fetching recipes:', error);
        setRecipes(MOCK_RECIPES); // Fallback to mock on error
      } else {
        setRecipes(data as Recipe[]);
      }
      setIsLoading(false);
    };

    fetchRecipes();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('recipes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'recipes',
          },
          () => {
            fetchRecipes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateRecipeImage = async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId) || aiSuggestions.find(r => r.id === recipeId);
    if (!recipe) return;

    setIsGeneratingImage({ ...isGeneratingImage, [recipeId]: true });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A professional, high-quality, appetizing food photography of: ${recipe.title}. Description: ${recipe.description}. Style: clean, bright, top-down view, restaurant quality, white background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64EncodeString}`;
            
            // If it's a saved recipe, update it. If it's a suggestion, just update the local state.
            const savedRecipe = recipes.find(r => r.id === recipeId);
            if (savedRecipe && isSupabaseConfigured) {
              const { error } = await supabase
                .from('recipes')
                .update({ image: imageUrl })
                .eq('id', recipeId);

              if (error) throw error;
            }
            
            // Always update local state for immediate feedback
            setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, image: imageUrl } : r));
            setAiSuggestions(prev => prev.map(r => r.id === recipeId ? { ...r, image: imageUrl } : r));
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error generating recipe image:", error);
    } finally {
      setIsGeneratingImage({ ...isGeneratingImage, [recipeId]: false });
    }
  };

  const generateAiSuggestions = async () => {
    if (!patientId) return;
    setIsGeneratingSuggestion(true);
    setShowAiSuggestions(true);
    
    try {
      // Fetch latest anamnesis
      const { data: anamnesisData, error: anamnesisError } = await supabase
        .from('anamnesis')
        .select('data')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (anamnesisError && anamnesisError.code !== 'PGRST116') {
        throw anamnesisError;
      }

      const patientAnamnesis = anamnesisData?.data || {};
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `
        Com base nos dados de anamnese do paciente abaixo, sugira 3 receitas saudáveis e personalizadas.
        
        Dados do Paciente:
        - Objetivos: ${patientAnamnesis.goals?.join(', ') || 'Não especificado'}
        - Preferências: ${patientAnamnesis.preferences || 'Não especificado'}
        - Restrições: ${patientAnamnesis.restrictions || 'Não especificado'}
        - Alergias: ${patientAnamnesis.allergies || 'Não especificado'}
        - Intolerâncias: ${patientAnamnesis.intolerances || 'Não especificado'}
        
        Retorne um JSON com um array de 3 objetos de receita seguindo este formato:
        {
          "suggestions": [
            {
              "title": "Nome da Receita",
              "description": "Breve descrição focada nos benefícios para o objetivo do paciente",
              "calories": 350,
              "prep_time": "20 min",
              "difficulty": "Fácil",
              "category": "Almoço",
              "ingredients": ["item 1", "item 2"],
              "instructions": ["passo 1", "passo 2"]
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{"suggestions": []}');
      const suggestionsWithIds = result.suggestions.map((s: any) => ({
        ...s,
        id: `ai-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setAiSuggestions(suggestionsWithIds);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const saveAiRecipe = async (recipe: Recipe) => {
    try {
      const { id, ...recipeData } = recipe;
      
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('recipes')
          .insert({
            ...recipeData,
            created_by: patientId // Or nutri ID if we had it
          });

        if (error) throw error;
      } else {
        // In demo mode, add to local recipes state
        setRecipes(prev => [{ ...recipe, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
      }
      
      // Remove from suggestions after saving
      setAiSuggestions(prev => prev.filter(r => r.id !== recipe.id));
    } catch (error) {
      console.error("Error saving AI recipe:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Biblioteca de Receitas</h2>
          <p className="text-sm text-slate-500 font-medium">Sugira opções saudáveis e visuais para seus pacientes</p>
        </div>
        <div className="flex items-center gap-3">
          {patientId && (
            <button 
              onClick={generateAiSuggestions}
              disabled={isGeneratingSuggestion}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingSuggestion ? 'Sugerindo...' : 'Sugerir com IA'}
            </button>
          )}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar receitas..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      <AnimatePresence>
        {showAiSuggestions && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-indigo-900">Sugestões da IA para este Paciente</h3>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Baseado na Anamnese</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiSuggestions(false)}
                className="text-indigo-400 hover:text-indigo-600 font-bold text-sm"
              >
                Fechar
              </button>
            </div>

            {isGeneratingSuggestion ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-indigo-600 font-bold animate-pulse">Analisando anamnese e criando receitas personalizadas...</p>
              </div>
            ) : aiSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiSuggestions.map((recipe) => (
                  <motion.div 
                    key={recipe.id}
                    layoutId={recipe.id}
                    className="bg-white rounded-3xl border border-indigo-100 p-6 space-y-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-800 leading-tight">{recipe.title}</h4>
                      <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                        {recipe.category}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{recipe.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.prep_time}
                      <Flame className="w-3.5 h-3.5 ml-2" />
                      {recipe.calories} kcal
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        Ver Detalhes
                      </button>
                      <button 
                        onClick={() => saveAiRecipe(recipe)}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
                      >
                        Salvar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-indigo-400 font-medium">Nenhuma sugestão gerada ainda.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, idx) => (
          <motion.div 
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              {recipe.image ? (
                <Image 
                  src={recipe.image} 
                  alt={recipe.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="p-4 bg-white rounded-3xl text-slate-300 shadow-sm">
                    <Utensils className="w-12 h-12" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">Sem imagem ilustrativa</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        generateRecipeImage(recipe.id);
                      }}
                      disabled={isGeneratingImage[recipe.id]}
                      className="mt-4 flex items-center gap-2 px-6 py-2 bg-[#22B391] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#1C9A7D] transition-all disabled:opacity-50"
                    >
                      {isGeneratingImage[recipe.id] ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Gerar com IA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-[#22B391] uppercase tracking-widest shadow-sm">
                {recipe.category}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-lg transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white rounded-full text-slate-400 hover:text-[#22B391] shadow-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 leading-tight">{recipe.title}</h3>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-black">{recipe.calories} kcal</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  {recipe.prep_time}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  {recipe.difficulty}
                </div>
              </div>

              <button 
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full py-3 mt-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                Ver Receita Completa
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-[#0B2B24]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Side: Image */}
              <div className="w-full md:w-1/2 relative bg-slate-50 min-h-[300px]">
                {selectedRecipe.image ? (
                  <Image 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-4">
                    <Utensils className="w-16 h-16 text-slate-200" />
                    <button 
                      onClick={() => generateRecipeImage(selectedRecipe.id)}
                      disabled={isGeneratingImage[selectedRecipe.id]}
                      className="flex items-center gap-2 px-8 py-3 bg-[#22B391] text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#1C9A7D] transition-all"
                    >
                      {isGeneratingImage[selectedRecipe.id] ? 'Gerando...' : 'Gerar Imagem com IA'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>

                <div className="space-y-8">
                  <div>
                    <div className="px-3 py-1 bg-[#E9F7F4] text-[#22B391] rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
                      {selectedRecipe.category}
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 leading-tight">{selectedRecipe.title}</h2>
                    <p className="text-slate-500 font-medium mt-2 leading-relaxed">{selectedRecipe.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <div className="text-orange-500 font-black text-lg">{selectedRecipe.calories}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Kcal</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <div className="text-blue-500 font-black text-lg">{selectedRecipe.prep_time}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Preparo</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <div className="text-emerald-500 font-black text-lg">{selectedRecipe.difficulty}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Nível</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ingredientes</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 bg-[#22B391] rounded-full" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Modo de Preparo</h3>
                    <div className="space-y-4">
                      {selectedRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20 flex items-center justify-center gap-3">
                      <Plus className="w-5 h-5" />
                      Adicionar ao Plano do Paciente
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {onBack && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-[#22B391] hover:bg-[#22B391]/5 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Painel
          </button>
        </div>
      )}
    </div>
  );
}
