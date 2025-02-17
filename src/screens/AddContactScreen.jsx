import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {addContact, updateContact} from '../service/database';
import {RadioButton} from 'react-native-paper';
import CustomRadioButton from '../components/CustomRadioButton';

const AddContactScreen = ({navigation, route}) => {
  const editingContact = route?.params?.contact;
  console.log('editingContact', editingContact);
  const returnToAppointment = route?.params?.returnToAppointment;
  const [name, setName] = useState(editingContact?.name || '');
  const [phone, setPhone] = useState(editingContact?.phone || '');
  const [email, setEmail] = useState(editingContact?.email || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Lütfen kişi adını giriniz.');
      return;
    }

    try {
      let contactId;
      if (editingContact) {
        await updateContact(editingContact.id, name, phone, email);
        contactId = editingContact.id;
      } else {
        contactId = await addContact(name, phone, email);
      }

      if (returnToAppointment) {
        // Önce Appointments tab'ına dön ve yeni kişiyi seç
        navigation.navigate('Appointments', {
          screen: 'AddAppointmentScreen',
          params: {
            selectedContactId: contactId,
            selectedContactName: name,
            clearForm: true,
          },
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Kişi kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ad Soyad"
            />

            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefon numarası"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresi"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingContact ? 'Güncelle' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
  },
  form: {
    padding: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },

  paymentStatusContainer: {
    borderWidth: 1, // Çerçeve ekliyoruz
    borderColor: '#ddd', // Çerçevenin rengini belirliyoruz
    borderRadius: 8, // Köşeleri yuvarlatıyoruz
    padding: 16, // İçeriğe boşluk ekliyoruz
    backgroundColor: '#f9f9f9', // Arka plan rengini belirliyoruz
    marginVertical: 0, // Üst ve alt boşluk
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 30,
    marginVertical: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddContactScreen;
