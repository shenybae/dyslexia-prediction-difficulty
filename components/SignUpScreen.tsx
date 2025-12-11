import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Brain, Mail, User, Baby, FileText, ArrowLeft, CheckCircle, Send } from 'lucide-react-native';
import { db } from '../firebaseConfig';
// @ts-ignore
import { collection, addDoc } from 'firebase/firestore';
import { GuardianApplication } from '../types';

interface SignUpProps {
  onBack: () => void;
}

export const SignUpScreen: React.FC<SignUpProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    guardianName: '',
    email: '',
    childName: '',
    childAge: '',
    relationship: 'Parent',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!formData.guardianName || !formData.email || !formData.childName || !formData.childAge) {
        Alert.alert("Missing Fields", "Please fill in all required fields.");
        return;
    }
    setLoading(true);

    try {
      const applicationData: GuardianApplication = {
        ...formData,
        status: 'PENDING',
        dateApplied: new Date().toISOString()
      };

      await addDoc(collection(db, 'applications'), applicationData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application: ", error);
      Alert.alert("Error", "There was an error submitting your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIconBg}>
            <CheckCircle size={48} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Application Sent!</Text>
          <Text style={styles.successText}>
            Thank you for applying to LexiLearn. An Administrator will review your details. 
            {'\n\n'}
            <Text style={styles.boldText}>If approved, you will receive your login credentials via email at:</Text>
            {'\n'}
            <Text style={styles.emailText}>{formData.email}</Text>
          </Text>
          <TouchableOpacity 
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backLink}
        >
          <ArrowLeft size={20} color="#6b7280" /> 
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Brain size={32} color="#4A90E2" />
          </View>
          <Text style={styles.title}>Guardian Application</Text>
          <Text style={styles.subtitle}>
            Apply for an account. Our admins will create your secure access profile.
          </Text>
        </View>

        <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Guardian Name</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}><User color="#9ca3af" size={18} /></View>
                <TextInput 
                  value={formData.guardianName}
                  onChangeText={(t) => setFormData({...formData, guardianName: t})}
                  style={styles.input}
                  placeholder="Your Name"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Relationship</Text>
              <View style={styles.relationshipContainer}>
                  {['Parent', 'Teacher', 'Other'].map(opt => (
                      <TouchableOpacity 
                        key={opt}
                        onPress={() => setFormData({...formData, relationship: opt})}
                        style={[styles.relButton, formData.relationship === opt ? styles.relButtonActive : styles.relButtonInactive]}
                      >
                          <Text style={formData.relationship === opt ? styles.relTextActive : styles.relTextInactive}>{opt}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
            </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}><Mail color="#9ca3af" size={18} /></View>
              <TextInput 
                value={formData.email}
                onChangeText={(t) => setFormData({...formData, email: t})}
                style={styles.input}
                placeholder="Where to send login info"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Child's Name</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}><Baby color="#9ca3af" size={18} /></View>
                <TextInput 
                  value={formData.childName}
                  onChangeText={(t) => setFormData({...formData, childName: t})}
                  style={styles.input}
                  placeholder="Name"
                />
              </View>
            </View>
            <View style={styles.flex03}>
              <Text style={styles.label}>Age</Text>
              <TextInput 
                value={formData.childAge}
                onChangeText={(t) => setFormData({...formData, childAge: t})}
                style={[styles.input, { paddingLeft: 16, textAlign: 'center' }]}
                placeholder="Age"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <View style={styles.inputWrapper}>
              <View style={[styles.inputIcon, { top: 16 }]}><FileText color="#9ca3af" size={18} /></View>
              <TextInput 
                value={formData.notes}
                onChangeText={(t) => setFormData({...formData, notes: t})}
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Any specific concerns..."
                multiline
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? <ActivityIndicator color="white" /> : <><Send size={20} color="white" /> <Text style={styles.submitButtonText}>Submit Application</Text></>}
          </TouchableOpacity>
        </View>
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
    marginVertical: 32,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  backLinkText: {
    color: '#6B7280',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBg: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  input: {
    width: '100%',
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    fontSize: 16,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  relButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  relButtonInactive: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  relTextActive: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  relTextInactive: {
    color: '#4B5563',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  flex1: {
    flex: 1,
  },
  flex03: {
    width: '30%',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    padding: 16,
  },
  successCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
    borderColor: 'rgba(102, 187, 106, 0.2)',
    borderWidth: 2,
    alignItems: 'center',
  },
  successIconBg: {
    width: 80,
    height: 80,
    backgroundColor: '#DCFCE7',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#4B5563',
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  emailText: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  backButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
