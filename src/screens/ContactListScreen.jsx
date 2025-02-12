import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  SafeAreaView,
} from 'react-native';
import {
  getAllContacts,
  deleteContact,
  fetchAppointmentsByContactId,
} from '../service/database';
import {format} from 'date-fns';
import {tr, enUS, fr} from 'date-fns/locale';

const ContactListScreen = ({navigation}) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  console.log('appointment for modal', appointments);

  // Kullanıcının seçtiği dili al (Bu değeri ayarlardan veya state'ten alabilirsin)
  const userLanguage = 'tr'; // "tr", "en", "fr" olabilir

  // Locale eşlemesi
  const localeMap = {
    tr: tr, // Türkçe
    en: enUS, // İngilizce
    fr: fr, // Fransızca
  };

  // Kullanıcının diline göre locale ayarla
  const selectedLocale = localeMap[userLanguage] || enUS;

  const loadContacts = useCallback(async () => {
    try {
      const result = await getAllContacts();
      setContacts(result);
    } catch (error) {
      Alert.alert('Hata', 'Kişiler yüklenirken bir hata oluştu.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadContacts();
    });

    return unsubscribe;
  }, [navigation, loadContacts]);

  const handleContactPress = async contact => {
    setSelectedContact(contact);
    const appointmentsData = await fetchAppointmentsByContactId(contact.id);
    setAppointments(appointmentsData);
    setModalVisible(true);
  };

  const handleDelete = async id => {
    Alert.alert('Kişiyi Sil', 'Bu kişiyi silmek istediğinizden emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContact(id);
            loadContacts();
          } catch (error) {
            Alert.alert('Hata', 'Kişi silinirken bir hata oluştu.');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleContactPress(item)}
      style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phone && <Text style={styles.contactDetail}>{item.phone}</Text>}
        {item.email && <Text style={styles.contactDetail}>{item.email}</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() =>
            navigation.navigate('AddContactScreen', {
              contact: item,
            })
          }>
          <Text style={styles.buttonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{textAlign: 'center'}}>Liste boş</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContactScreen')}>
        <Text style={styles.addButtonText}>+ Yeni Kişi</Text>
      </TouchableOpacity>

      {/* Modal for showing appointments */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{flex: 1, padding: 20}}>
          {/* Modal Başlık - Toplam Randevu Sayısı */}
          <View style={{padding: 10}}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              {selectedContact?.name} randevu bilgileri:
            </Text>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
              {appointments.length} randevu
            </Text>
          </View>

          {/* Randevu Listesi */}
          <FlatList
            data={appointments}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  borderBottomWidth: 1,
                }}>
                <View
                  style={{
                    paddingHorizontal: 2,
                    alignItems: 'center',
                    justifyContent: 'start',
                  }}>
                  {/* Sıra Numarası */}
                  <Text
                    style={{
                      fontWeight: 'bold',
                    }}>
                    {index + 1}.
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 6,
                  }}>
                  <Text>{item.title}</Text>
                  <Text>{item.description}</Text>
                  {/* Tarihi formatlı gösterme */}
                  <Text style={{color: 'gray'}}>
                    📅{' '}
                    {format(new Date(item.date), 'dd MMMM yyyy, EEEE - HH.mm', {
                      locale: selectedLocale,
                    })}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1, // View'in tüm alanı kaplamasını sağla
                  justifyContent: 'center', // Dikey ortalama
                  alignItems: 'center', // Yatay ortalama
                }}>
                <Text style={{textAlign: 'center'}}>Liste boş</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={{
              width: '80%',
              alignSelf: 'center',
              marginBottom: 20,
              backgroundColor: '#f44336',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setModalVisible(false)}>
            <Text style={{color: 'white', fontSize: 16}}>Kapat</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5B913B',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // contactItem: {
  //   flexDirection: 'row',
  //   padding: 16,
  //   marginBottom: 12,
  //   borderRadius: 8,
  //   backgroundColor: '#fff',
  //   shadowColor: '#000',
  //   shadowOffset: {width: 0, height: 2},
  //   shadowOpacity: 0.1,
  //   shadowRadius: 5,
  //   elevation: 3, // Android için gölge
  //   justifyContent: 'space-between',
  // },
  // contactInfo: {
  //   flex: 1,
  //   justifyContent: 'center',
  // },
  // contactName: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   color: '#333',
  // },
  // contactDetail: {
  //   fontSize: 14,
  //   color: '#666',
  //   marginTop: 4,
  // },
  // buttonContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  //   alignItems: 'center',
  // },
  // button: {
  //   paddingHorizontal: 16,
  //   paddingVertical: 8,
  //   borderRadius: 20,
  //   marginLeft: 8,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // editButton: {
  //   backgroundColor: '#4CAF50',
  // },
  // deleteButton: {
  //   backgroundColor: '#F44336',
  // },
  // buttonText: {
  //   color: '#fff',
  //   fontSize: 14,
  //   fontWeight: '500',
  // },

  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#388E3C',
    shadowColor: '#000', // iOS için
    shadowOffset: {width: 0, height: 2}, // iOS için
    shadowOpacity: 0.5, // iOS için
    shadowRadius: 6, // iOS için
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactListScreen;
