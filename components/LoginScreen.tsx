import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Brain, Lock, Mail, AlertCircle, User, ClipboardList } from 'lucide-react-native';

interface LoginProps {
  onDemoLogin?: (role: 'Guardian' | 'Admin') => void;
  onSignUpClick?: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onDemoLogin, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Guardian' | 'Admin'>('Guardian');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to log in. Please check your connection.');
      }
      setLoading(false);
    }
  };

  const handleDemo = () => {
    if (onDemoLogin) {
      onDemoLogin(role);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Brain size={48} color="#4A90E2" />
          </View>
          <Text style={styles.title}>LexiLearn</Text>
          <Text style={styles.subtitle}>Dyslexia Support Platform</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Category Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>User Category</Text>
            <View style={styles.roleContainer}>
                <TouchableOpacity 
                    onPress={() => setRole('Guardian')}
                    style={[styles.roleButton, role === 'Guardian' ? styles.roleButtonActive : styles.roleButtonInactive]}
                >
                    <Text style={[styles.roleText, role === 'Guardian' ? styles.roleTextActive : styles.roleTextInactive]}>Guardian</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setRole('Admin')}
                    style={[styles.roleButton, role === 'Admin' ? styles.roleButtonActive : styles.roleButtonInactive]}
                >
                    <Text style={[styles.roleText, role === 'Admin' ? styles.roleTextActive : styles.roleTextInactive]}>Admin</Text>
                </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Mail color="#9ca3af" size={20} />
              </View>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="user@lexilearn.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Lock color="#9ca3af" size={20} />
              </View>
              <TextInput 
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>Log In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
           <TouchableOpacity 
             onPress={onSignUpClick}
             style={styles.applyButton}
           >
              <ClipboardList size={20} color="#7e22ce" /> 
              <Text style={styles.applyButtonText}>Don't have an account? Apply</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine}></View>
          <Text style={styles.dividerText}>or test without account</Text>
          <View style={styles.dividerLine}></View>
        </View>

        <TouchableOpacity 
          onPress={handleDemo}
          style={styles.demoButton}
        >
          <User size={20} color="#66BB6A" />
          <Text style={styles.demoButtonText}>Try Demo {role} Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Guardians must be approved by an Admin.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    padding: 16,
    backgroundColor: '#E6F3F7',
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  subtitle: {
    color: '#6B7280',
  },
  form: {
    marginBottom: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleButtonInactive: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  roleText: {
    fontWeight: 'bold',
  },
  roleTextActive: {
    color: 'white',
  },
  roleTextInactive: {
    color: '#6B7280',
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  input: {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerSection: {
    marginTop: 8,
  },
  applyButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
    borderWidth: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonText: {
    color: '#7E22CE',
    fontWeight: 'bold',
  },
  dividerContainer: {
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  demoButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderColor: '#66BB6A',
    borderWidth: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  demoButtonText: {
    color: '#66BB6A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerNote: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
  },
});
