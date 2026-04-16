import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  primary: '#22B391',
  primaryDark: '#1C9A7D',
  background: '#0B2B24',
  surface: '#FFFFFF',
  text: '#0B2B24',
  textLight: '#64748B',
  textWhite: '#FFFFFF',
};

interface Meal {
  id: string;
  name: string;
  time: string;
  status: string;
  calories: number;
  foods: { name: string; quantity: number; unit: string; calories: number }[];
}

export default function App() {
  const [screen, setScreen] = useState<'login' | 'dashboard' | 'diet' | 'goals' | 'chat'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [todayCalories, setTodayCalories] = useState(1250);
  const targetCalories = 1800;
  
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Café da Manhã', time: '07:00', status: 'completed', calories: 420, foods: [{ name: 'Ovos mexidos', quantity: 2, unit: 'un', calories: 210 }, { name: 'Pão integral', quantity: 1, unit: 'fatia', calories: 80 }] },
    { id: '2', name: 'Lanche da Manhã', time: '10:00', status: 'completed', calories: 180, foods: [{ name: 'Iogurte natural', quantity: 150, unit: 'g', calories: 90 }] },
    { id: '3', name: 'Almoço', time: '12:30', status: 'pending', calories: 650, foods: [{ name: 'Frango grelhado', quantity: 150, unit: 'g', calories: 165 }, { name: 'Arroz integral', quantity: 100, unit: 'g', calories: 110 }] },
    { id: '4', name: 'Lanche da Tarde', time: '16:00', status: 'pending', calories: 200, foods: [{ name: 'Maçã', quantity: 1, unit: 'un', calories: 95 }] },
    { id: '5', name: 'Jantar', time: '19:30', status: 'pending', calories: 350, foods: [{ name: 'Peixe assado', quantity: 150, unit: 'g', calories: 135 }] },
  ]);

  const [goals] = useState([
    { id: '1', title: 'Perder 5kg', current: 3, target: 5, unit: 'kg', deadline: '30/04/2026' },
    { id: '2', title: 'Beber 2L de água', current: 1500, target: 2000, unit: 'ml', deadline: 'Contínuo' },
    { id: '3', title: 'Malhar 3x/semana', current: 2, target: 3, unit: 'vezes', deadline: 'Semanal' },
  ]);

  const [messages, setMessages] = useState([
    { id: '1', text: 'Olá! Como você está se sentindo com a dieta?', sender: 'nutri', time: '09:00' },
    { id: '2', text: 'Olá! Estão indo bem, mas tenho sentido fome à tarde.', sender: 'patient', time: '09:15' },
    { id: '3', text: 'Entendo. Que tal adicionar um lanche às 15h?', sender: 'nutri', time: '09:20' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setScreen('dashboard');
      setLoading(false);
    }, 1000);
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setScreen('dashboard');
      setLoading(false);
    }, 1000);
  };

  const toggleMealStatus = (mealId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        const newStatus = meal.status === 'completed' ? 'pending' : 'completed';
        setTodayCalories(prev => newStatus === 'completed' ? prev + meal.calories : prev - meal.calories);
        return { ...meal, status: newStatus };
      }
      return meal;
    }));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: newMessage, sender: 'patient', time: 'Agora' }]);
    setNewMessage('');
  };

  const progress = (todayCalories / targetCalories) * 100;

  if (screen === 'login') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ON</Text>
          <Text style={styles.logoSubText}>NUTRITION</Text>
        </View>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.textLight}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.demoButton} onPress={handleDemo}>
            <Text style={styles.demoButtonText}>Entrar com Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <ScrollView style={styles.screen}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Olá, Paciente!</Text>
              <Text style={styles.headerSubtitle}>{email || 'Demo User'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Calorias de Hoje</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{todayCalories} / {targetCalories} kcal</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Refeições</Text>
            {meals.map((meal) => (
              <TouchableOpacity key={meal.id} style={styles.mealCard}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <View style={styles.mealActions}>
                  <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                  <TouchableOpacity
                    style={[styles.mealStatus, meal.status === 'completed' && styles.mealStatusDone]}
                    onPress={() => toggleMealStatus(meal.id)}
                  >
                    <Text style={[styles.mealStatusText, meal.status === 'completed' && styles.mealStatusTextDone]}>
                      {meal.status === 'completed' ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.statValue}>120g</Text>
                <Text style={styles.statLabel}>Proteína</Text>
              </View>
              <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.statValue}>180g</Text>
                <Text style={styles.statLabel}>Carbos</Text>
              </View>
            </View>
          </ScrollView>
        );

      case 'diet':
        return (
          <ScrollView style={styles.screen}>
            <View style={styles.dietHeader}>
              <Text style={styles.dietTitle}>Plano Emagrecimento</Text>
              <Text style={styles.dietTarget}>{targetCalories} kcal/dia</Text>
            </View>
            {meals.map((meal) => (
              <View key={meal.id} style={styles.dietMealCard}>
                <View style={styles.dietMealHeader}>
                  <Text style={styles.dietMealName}>{meal.name}</Text>
                  <Text style={styles.dietMealTime}>{meal.time}</Text>
                </View>
                {meal.foods.map((food, idx) => (
                  <View key={idx} style={styles.dietFoodRow}>
                    <Text style={styles.dietFoodName}>{food.name}</Text>
                    <Text style={styles.dietFoodInfo}>{food.quantity}{food.unit} • {food.calories} kcal</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        );

      case 'goals':
        return (
          <ScrollView style={styles.screen}>
            <Text style={styles.goalsTitle}>Suas Metas</Text>
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDeadline}>{goal.deadline}</Text>
                </View>
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressBar}>
                    <View style={[styles.goalProgressFill, { width: `${(goal.current / goal.target) * 100}%` }]} />
                  </View>
                  <Text style={styles.goalProgressText}>{goal.current} / {goal.target} {goal.unit}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'chat':
        return (
          <View style={styles.chatScreen}>
            <ScrollView style={styles.chatMessages}>
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.message, msg.sender === 'patient' ? styles.messageSent : styles.messageReceived]}>
                  <Text style={[styles.messageText, msg.sender === 'patient' && styles.messageTextSent]}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{msg.time}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatInputField}
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor={COLORS.textLight}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {[
          { id: 'dashboard', label: '🏠', screen: 'Início' },
          { id: 'diet', label: '🍽️', screen: 'Dieta' },
          { id: 'goals', label: '🎯', screen: 'Metas' },
          { id: 'chat', label: '💬', screen: 'Chat' },
        ].map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setScreen(tab.id as any)}>
            <Text style={styles.tabLabel}>{tab.label}</Text>
            <Text style={[styles.tabText, screen === tab.id && styles.tabTextActive]}>{tab.screen}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
  },
  logoSubText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1E3D36',
    borderRadius: 12,
    padding: 16,
    color: COLORS.textWhite,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  demoButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    gap: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  mealActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  mealStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealStatusDone: {
    backgroundColor: COLORS.primary,
  },
  mealStatusText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  mealStatusTextDone: {
    color: COLORS.textWhite,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  tabLabel: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dietHeader: {
    marginBottom: 20,
  },
  dietTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  dietTarget: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dietMealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dietMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dietMealName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dietMealTime: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dietFoodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dietFoodName: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  dietFoodInfo: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  goalsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  goalDeadline: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  goalProgress: {
    gap: 8,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  goalProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageSent: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageReceived: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
  },
  messageTextSent: {
    color: COLORS.textWhite,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatInputField: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonText: {
    fontSize: 20,
    color: COLORS.textWhite,
  },
});