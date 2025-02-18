import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  addAppointment,
  updateAppointment,
  getAllContacts,
} from '../service/database';
import DateTimePickerModal from '../components/DateTimePickerModal';
import CustomRadioButton from '../components/CustomRadioButton';

const AddAppointmentScreen = ({navigation, route}) => {
  const editingAppointment = route.params?.appointment;
  const selectedContactId = route.params?.selectedContactId;
  const selectedContactName = route.params?.selectedContactName;
  const shouldClearForm = route.params?.clearForm;

  const [title, setTitle] = useState(editingAppointment?.title || '');
  const [description, setDescription] = useState(
    editingAppointment?.description || '',
  );
  const [date, setDate] = useState(
    editingAppointment ? new Date(editingAppointment.date) : new Date(),
  );
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(
    editingAppointment?.contact_id || selectedContactId || null,
  );
  const [showContactModal, setShowContactModal] = useState(false);

  // PAYMENT
  const [paymentStatus, setPaymentStatus] = useState(
    editingAppointment?.payment_status || 'Beklemede',
  );
  const [paymentDescription, setPaymentDescription] = useState(
    editingAppointment?.payment_status_description || '',
  );

  useEffect(() => {
    loadContacts();

    const unsubscribe = navigation.addListener('focus', () => {
      loadContacts();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedContactId) {
      setSelectedContact(selectedContactId);
    }
  }, [selectedContactId]);

  useEffect(() => {
    if (shouldClearForm) {
      setTitle('');
      setDescription('');
      setDate(new Date());
      navigation.setParams({clearForm: undefined});
    }
  }, [shouldClearForm, navigation]);

  const loadContacts = async () => {
    try {
      const result = await getAllContacts();
      setContacts(result);
    } catch (error) {
      Alert.alert('Hata', 'Kişiler yüklenirken bir hata oluştu.');
    }
  };

  const handleDateSelect = selectedDate => {
    setDate(selectedDate);
  };

  const handleTimeSelect = selectedTime => {
    const newDate = new Date(date);
    newDate.setHours(selectedTime.getHours());
    newDate.setMinutes(selectedTime.getMinutes());
    setDate(newDate);
  };

  // eskisi
  // const handleSave = async () => {
  //   if (!title.trim()) {
  //     Alert.alert('Hata', 'Lütfen randevu başlığını giriniz.');
  //     return;
  //   }

  //   if (!selectedContact) {
  //     Alert.alert('Uyarı', 'Lütfen bir kişi seçiniz.');
  //     return;
  //   }

  //   try {
  //     if (editingAppointment) {
  //       await updateAppointment(
  //         editingAppointment.id,
  //         selectedContact,
  //         title,
  //         description,
  //         date.toISOString(),
  //       );
  //     } else {
  //       await addAppointment(
  //         selectedContact,
  //         title,
  //         description,
  //         date.toISOString(),
  //       );
  //     }
  //     navigation.goBack();
  //   } catch (error) {
  //     Alert.alert('Hata', 'Randevu kaydedilirken bir hata oluştu.');
  //   }
  // };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen randevu başlığını giriniz.');
      return;
    }

    if (!selectedContact) {
      Alert.alert('Uyarı', 'Lütfen bir kişi seçiniz.');
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointment(
          editingAppointment.id,
          selectedContact,
          title,
          description,
          date.toISOString(),
          paymentStatus, // Mevcut ödeme durumu
          paymentDescription, // Mevcut açıklama
        );
      } else {
        await addAppointment(
          selectedContact,
          title,
          description,
          date.toISOString(),
          paymentStatus, // Varsayılan değer
          paymentDescription, // Varsayılan değer
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Randevu kaydedilirken bir hata oluştu.');
    }
  };

  const handleAddNewContact = () => {
    setShowContactModal(false);
    navigation.navigate('Contacts', {
      screen: 'AddContactScreen',
      params: {
        returnToAppointment: true,
      },
      initial: false,
    });
  };

  // const getSelectedContactName = () => {
  //   if (selectedContact) {
  //     const contact = contacts.find(c => c.id === selectedContact);
  //     return contact?.name || selectedContactName;
  //   }
  //   return null;
  // };

  const getSelectedContactDetails = () => {
    if (selectedContact) {
      const contact = contacts.find(c => c.id === selectedContact);
      return {
        name: contact?.name || selectedContactName,
        phone: contact?.phone || 'Numara bulunamadı',
      };
    }
    return {name: null, phone: null};
  };

  const selectedContactDetails = getSelectedContactDetails();

  const ContactSelectionModal = () => (
    <Modal
      visible={showContactModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowContactModal(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kişi Seçimi</Text>
          <ScrollView style={styles.modalScrollView}>
            {contacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.modalContactItem,
                  selectedContact === contact.id &&
                    styles.selectedModalContactItem,
                ]}
                onPress={() => {
                  setSelectedContact(contact.id);
                  setShowContactModal(false);
                }}>
                <Text
                  style={[
                    styles.modalContactText,
                    selectedContact === contact.id &&
                      styles.selectedModalContactText,
                  ]}>
                  {contact.name}
                </Text>
                {contact.phone && (
                  <Text style={styles.modalContactDetail}>{contact.phone}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowContactModal(false), setSelectedContact(null);
              }}>
              <Text style={styles.modalButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addNewButton]}
              onPress={() => {
                setShowContactModal(false);
                handleAddNewContact();
              }}>
              <Text style={styles.modalButtonText}>Yeni Kişi Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <View style={styles.form}>
            <Text style={styles.label}>Kişi</Text>
            <View style={styles.contactSelectionContainer}>
              {selectedContact ? (
                <View style={styles.selectedContactContainer}>
                  <View>
                    <Text style={styles.selectedContactText}>
                      {selectedContactDetails.name}
                    </Text>
                    {selectedContactDetails.phone && (
                      <Text style={styles.selectedContactPhoneText}>
                        {selectedContactDetails.phone}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.changeContactButton}
                    onPress={() => setShowContactModal(true)}>
                    <Text style={styles.changeContactButtonText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectContactButton}
                  onPress={() => setShowContactModal(true)}>
                  <Text style={styles.selectContactButtonText}>Kişi Seç</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Başlık</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Randevu başlığı"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Randevu açıklaması"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Tarih</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerModal(true)}>
              <Text style={styles.dateButtonText}>
                {format(date, 'PPP', {locale: tr})}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Saat</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePickerModal(true)}>
              <Text style={styles.dateButtonText}>
                {format(date, 'HH:mm', {locale: tr})}
              </Text>
            </TouchableOpacity>

            {/**------------ PAYMENT---------------- */}
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.paymentStatusContainer}>
              <View style={styles.radioGroup}>
                <CustomRadioButton
                  value="Beklemede"
                  selectedValue={paymentStatus}
                  onChange={setPaymentStatus}
                />
                <CustomRadioButton
                  value="Ödendi"
                  selectedValue={paymentStatus}
                  onChange={setPaymentStatus}
                />
              </View>

              <Text style={styles.label}>Payment Description</Text>
              <TextInput
                style={styles.paymentTextarea}
                value={paymentDescription}
                onChangeText={setPaymentDescription}
                placeholder="Payment date, method, status..."
                multiline
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingAppointment ? 'Güncelle' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modals */}
        <ContactSelectionModal />

        <DateTimePickerModal
          visible={showDatePickerModal}
          onClose={() => setShowDatePickerModal(false)}
          onSelect={handleDateSelect}
          initialDate={date}
          mode="date"
        />

        <DateTimePickerModal
          visible={showTimePickerModal}
          onClose={() => setShowTimePickerModal(false)}
          onSelect={handleTimeSelect}
          initialDate={date}
          mode="time"
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  contactSelectionContainer: {
    marginBottom: 16,
  },
  selectedContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  selectedContactText: {
    fontSize: 16,
    color: '#333',
  },
  changeContactButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeContactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectContactButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectContactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalContactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedModalContactItem: {
    backgroundColor: '#e3f2fd',
  },
  modalContactText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalContactText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalContactDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,

    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  addNewButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedContactPhoneText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4, // İsmin altında biraz boşluk bırakır
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
  paymentTextarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
});

export default AddAppointmentScreen;
