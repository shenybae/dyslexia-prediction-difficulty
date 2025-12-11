import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Shield, ArrowRight, RefreshCw, LogOut } from 'lucide-react-native';

export const TwoFactorAuth: React.FC<{ email: string, onVerify: () => void, onCancel: () => void }> = ({ email, onVerify, onCancel }) => {
  const [code, setCode] = useState('');

  useEffect(() => {
      setTimeout(() => Alert.alert("Demo Code", "Your code is 123456"), 1000);
  }, []);

  const handleVerify = () => {
      if (code === '123456') onVerify();
      else Alert.alert("Error", "Invalid Code");
  };

  return (
    <View style={styles.container}>
        <Shield size={60} color="#4A90E2" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.sub}>Enter code sent to {email}</Text>
        
        <TextInput 
            value={code} 
            onChangeText={setCode} 
            style={styles.input} 
            placeholder="000000" 
            keyboardType="number-pad" 
            maxLength={6}
        />
        
        <TouchableOpacity onPress={handleVerify} style={styles.btn}>
            <Text style={styles.btnText}>Verify</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FDFBF7' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    sub: { color: '#666', marginBottom: 30 },
    input: { fontSize: 32, letterSpacing: 5, borderBottomWidth: 2, borderColor: '#4A90E2', marginBottom: 40, width: 200, textAlign: 'center' },
    btn: { backgroundColor: '#4A90E2', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, width: '100%', alignItems: 'center' },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    cancel: { marginTop: 20 },
    cancelText: { color: '#666' }
});