import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Config ---
// Substituir pelas chaves reais do projeto
const SUPABASE_URL = 'https://wyxyqghxtfvmkpanrdhe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zMA__WPLO2EAtL62vfm50g_a67P62Au';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0a0f16',
  surface: '#0f1520',
  primary: '#22B391',
  secondary: '#45dcb9',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  danger: '#ef4444',
  border: 'rgba(255,255,255,0.05)',
};

export default function App() {
  const [screen, setScreen] = useState<'login' | 'dashboard' | 'diet' | 'chat'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);

  // --- Auth Handlers ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      Alert.alert('Erro de Acesso', error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    fetchPatientData(data.user.id);
  };

  const fetchPatientData = async (userId: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*, diet_plans(*, meals(*, meal_foods(*)))')
      .eq('id', userId) // Assumindo que o patient_id é o mesmo que o user_id no auth
      .single();

    if (data) {
      setPatientData(data);
      setScreen('dashboard');
    } else {
      // Demo fallback if no real patient linked yet
      setScreen('dashboard');
    }
    setLoading(false);
  };

  if (screen === 'login') {
    return (
      <View style={styles.loginContainer}>
        <StatusBar style="light" />
        <View style={styles.loginCard}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>ON</Text>
          </View>
          <Text style={styles.loginTitle}>Acesso Vitalício</Text>
          <Text style={styles.loginSubtitle}>Sua nutrição premium em qualquer lugar</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email profissional ou paciente"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha de acesso"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.loginButtonText}>ENTRAR AGORA</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert('Aviso', 'Entre em contato com seu nutricionista para obter as credenciais.')}>
            <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Paciente</Text>
          <Text style={styles.headerName}>{user?.email || 'Demo'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconCircle}>
            <Text style={{color: COLORS.secondary}}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.premiumCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meta Diária de Calorias</Text>
            <Text style={styles.cardBadge}>PROTEIN+</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '70%' }]} />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressLabel}>1.250 / 1.800 kcal</Text>
            <Text style={styles.progressPercent}>70%</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>84.5</Text>
            <Text style={styles.statLab}>Peso (kg)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, {color: '#60a5fa'}]}>1.5L</Text>
            <Text style={styles.statLab}>Água</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, {color: '#f472b6'}]}>120g</Text>
            <Text style={styles.statLab}>Proteína</Text>
          </View>
        </View>

        {/* Next Meals */}
        <Text style={styles.sectionTitle}>Refeições Próximas</Text>
        <TouchableOpacity style={styles.mealRow}>
          <View style={styles.mealIcon}>
             <Text style={{fontSize: 20}}>🍽️</Text>
          </View>
          <View style={styles.mealInfo}>
             <Text style={styles.mealName}>Almoço de Sábado</Text>
             <Text style={styles.mealTime}>12:30 • Arroz, Frango e Salada</Text>
          </View>
          <Text style={styles.mealKcal}>540 kcal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mealRow}>
          <View style={styles.mealIcon}>
             <Text style={{fontSize: 20}}>🍎</Text>
          </View>
          <View style={styles.mealInfo}>
             <Text style={styles.mealName}>Lanche da Tarde</Text>
             <Text style={styles.mealTime}>16:00 • Maçã e Iogurte</Text>
          </View>
          <Text style={styles.mealKcal}>100 kcal</Text>
        </TouchableOpacity>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Tab Bar Premium */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('dashboard')}>
          <Text style={[styles.tabIcon, screen === 'dashboard' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabText, screen === 'dashboard' && styles.tabTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('diet')}>
          <Text style={[styles.tabIcon, screen === 'diet' && styles.tabIconActive]}>🍽️</Text>
          <Text style={[styles.tabText, screen === 'diet' && styles.tabTextActive]}>Dieta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('chat')}>
          <Text style={[styles.tabIcon, screen === 'chat' && styles.tabIconActive]}>💬</Text>
          <Text style={[styles.tabText, screen === 'chat' && styles.tabTextActive]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => supabase.auth.signOut().then(() => setScreen('login'))}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loginCard: {
    width: '100%',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: '#0a0f16',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  forgotText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  headerName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 2,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 25,
  },
  premiumCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(34,179,145,0.1)',
    color: COLORS.secondary,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLab: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 20,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  mealKcal: {
    fontWeight: '900',
    color: COLORS.text,
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f1520',
    paddingVertical: 15,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  tabIconActive: {
    color: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
});