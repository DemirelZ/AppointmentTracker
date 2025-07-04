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
import {
  validateName,
  validateEmail,
  validatePhone,
  getValidationErrorMessage,
} from '../utils/validation';

const AddContactScreen = ({navigation, route}) => {
  const editingContact = route?.params?.contact;
  console.log('editingContact', editingContact);
  const {returnToAppointment} = route?.params || {};
  const [name, setName] = useState(editingContact?.name || '');
  const [phone, setPhone] = useState(editingContact?.phone || '');
  const [email, setEmail] = useState(editingContact?.email || '');

  const [errors, setErrors] = useState({});
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
    setIsChanged(true);
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

      return () => clearTimeout(timer);
    }
  }, [isChanged]);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = getValidationErrorMessage('name', name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Validate email if provided
    if (email.trim()) {
      const emailError = getValidationErrorMessage('email', email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Validate phone if provided
    if (phone.trim()) {
      const phoneError = getValidationErrorMessage('phone', phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
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
              Please don't forget to save the changes!
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.label}>Name Surname *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={handleInputChange(setName)}
              placeholder="Name Surname"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={handleInputChange(setPhone)}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={handleInputChange(setEmail)}
              placeholder="E-mail address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

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
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    backgroundColor: '#FFD300',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  changeWarningText: {
    fontSize: 16,
    color: 'black',
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AddContactScreen;
