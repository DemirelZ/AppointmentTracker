import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const AddContactScreen = ({navigation, route}) => {
  const editingContact = route?.params?.contact;
  console.log('editingContact', editingContact);
  const {returnToAppointment} = route?.params || {};
  const [name, setName] = useState(editingContact?.name || '');
  const [phone, setPhone] = useState(editingContact?.phone || '');
  const [email, setEmail] = useState(editingContact?.email || '');

  const [isChanged, setIsChanged] = useState(false);
  const isChangedRef = useRef(isChanged);

  useFocusEffect(
    useCallback(() => {
      if (!editingContact) {
        setName('');
        setPhone('');
        setEmail('');
      }
    }, [editingContact]),
  );

  // Kullanıcı bir input alanını değiştirdiğinde bunu true yap
  const handleInputChange = setter => text => {
    setter(text); // Input değerini güncelle
    setIsChanged(true); // Kullanıcının değişiklik yaptığını işaretle
  };

  useEffect(() => {
    isChangedRef.current = isChanged;
  }, [isChanged]);

  // Uyarının görünmesini 3 saniye sonra engellemek için
  useEffect(() => {
    if (isChanged) {
      const timer = setTimeout(() => {
        setIsChanged(false); // 3 saniye sonra isChanged'i false yaparak uyarıyı gizle
      }, 3000);

      return () => clearTimeout(timer); // Timer'ı temizle
    }
  }, [isChanged]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Warning', 'Please enter the contact name');
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

      // if (returnToAppointment) {
      //   // Önce Appointments tab'ına dön ve yeni kişiyi seç
      //   navigation.navigate('Appointments', {
      //     screen: 'AddAppointmentScreen',
      //     params: {
      //       selectedContactId: contactId,
      //       selectedContactName: name,
      //       clearForm: true,
      //     },
      //   });
      // } else {
      //   Toast.show({
      //     type: 'success',
      //     text1: editingContact
      //       ? 'The contact was successfully updated'
      //       : 'The contact was successfully created',
      //     visibilityTime: 2000,
      //     position: 'top',
      //     topOffset: 90,
      //   });
      //   navigation.goBack();
      // }

      if (returnToAppointment) {
        navigation.navigate('AddAppointmentScreen', {
          selectedContactId: contactId,
          selectedContactName: name,
          clearForm: true,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: editingContact
            ? 'The contact was successfully updated'
            : 'The contact was successfully created',
          visibilityTime: 2000,
          position: 'top',
          topOffset: 90,
        });
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving the contact');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* isChanged true ve editingContact varsa uyarıyı göster */}
        {isChanged && editingContact && (
          <View style={styles.changeWarning}>
            <Text style={styles.changeWarningText}>
              Please remember to save the changes!
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.label}>Name Surname *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleInputChange(setName)}
              placeholder="Name Surname"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={handleInputChange(setPhone)}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={handleInputChange(setEmail)}
              placeholder="E-mail address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingContact ? 'Update' : 'Save'}
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
    marginTop: 34,
  },
  scrollContent: {
    padding: 8,
  },
  form: {
    paddingHorizontal: 16,
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

  changeWarning: {
    position: 'absolute', // Sabit pozisyon
    top: 6, // Ekranın üst kısmında
    left: 0,
    right: 0,
    backgroundColor: '#FFD300',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Diğer içeriklerin üstünde
  },
  changeWarningText: {
    fontSize: 16,
    color: 'black',
  },
});

export default AddContactScreen;
