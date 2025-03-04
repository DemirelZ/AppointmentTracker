import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  getAllContacts,
  deleteContact,
  fetchAppointmentsByContactId,
} from '../service/database';
import {format} from 'date-fns';
import {tr, enUS, fr} from 'date-fns/locale';
import Toast from 'react-native-toast-message';

const ContactListScreen = ({navigation}) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllContacts();
      setContacts(result);
    } catch (error) {
      setError('An error occurred while loading contacts');
    } finally {
      setIsLoading(false);
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
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(id);
              loadContacts();
              Toast.show({
                type: 'error',
                text1: 'The contact was successfully deleted',
                visibilityTime: 1000,
                position: 'top',
                topOffset: 90,
              });
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting contact.');
            }
          },
        },
      ],
    );
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
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && (
        <View style={{padding: 10, backgroundColor: 'red', marginBottom: 10}}>
          <Text style={{color: 'white', textAlign: 'center'}}>{error}</Text>
        </View>
      )}
      {!isLoading && !error && (
        <FlatList
          data={contacts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{textAlign: 'center'}}>
                No one has been added to the list yet
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContactScreen')}>
        <Text style={styles.addButtonText}>+ New Contact</Text>
      </TouchableOpacity>

      {/* Modal for showing appointments */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Başlık */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {selectedContact?.name} - Appointments
              </Text>
              <Text style={styles.headerSubtitle}>
                {appointments.length} appointments found
              </Text>
            </View>

            {/* Randevu Listesi */}
            <FlatList
              data={appointments}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({item, index}) => (
                <View style={styles.appointmentCard}>
                  <Text style={styles.index}>{index + 1}.</Text>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <ScrollView style={styles.scrollView}>
                      <Text style={styles.description}>{item.description}</Text>
                    </ScrollView>

                    <Text style={styles.date}>
                      📅{' '}
                      {format(
                        new Date(item.date),
                        'MM/dd/yyyy, EEEE - hh:mm a',
                      )}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No appointments have been added yet
                  </Text>
                </View>
              }
            />

            {/* Kapat Butonu */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
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
    backgroundColor: '#578FCA',
  },
  deleteButton: {
    backgroundColor: '#D84040',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal styls
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: 'center',
    marginVertical: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  index: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingRight: 10,
    color: '#444',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    maxHeight: 120,
    marginVertical: 8,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  closeButton: {
    backgroundColor: '#578FCA',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 6,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactListScreen;
