import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import db, {
  deleteAppointment,
  getUpcomingAppointments,
} from '../service/database';
import {Calendar, Edit2, Trash} from 'iconsax-react-native';

const AppointmentsScreen = ({navigation}) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('upcomingAppointments', upcomingAppointments);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUpcomingAppointments();
      setUpcomingAppointments(result);
    } catch (error) {
      //Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
      setError('Randevular yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });

    return unsubscribe;
  }, [navigation, loadAppointments]);

  const handleDelete = async id => {
    Alert.alert(
      'Randevu Sil',
      'Bu randevuyu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(id);
              loadAppointments();
            } catch (error) {
              Alert.alert('Hata', 'Randevu silinirken bir hata oluştu.');
            }
          },
        },
      ],
    );
  };

  const getPaymentStatusStyle = status => {
    if (status === 'Beklemede') {
      return styles.pendingStatus; // Sarı daire için stil
    } else if (status === 'Ödendi') {
      return styles.paidStatus; // Yeşil daire için stil
    }
    return styles.defaultStatus; // Varsayılan stil
  };

  const renderItem = ({item}) => (
    <View style={styles.appointmentItem}>
      <View style={styles.infoContainer}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
        </View>
        <View style={styles.appointmentDetails}>
          <View style={styles.dateContainer}>
            <Calendar size={18} color="#888" />
            <Text style={styles.appointmentDate}>
              {format(new Date(item.date), 'PPP - HH:mm', {locale: tr})}
            </Text>
          </View>
          {item.description && (
            <Text style={styles.appointmentDescription}>
              {item.description}
            </Text>
          )}
          <Text style={styles.appointmentContactName}>{item.contact_name}</Text>
          <Text
            style={[
              styles.appointmentDescription,
              getPaymentStatusStyle(item.payment_status),
            ]}>
            Payment: {item.payment_status === 'Beklemede' ? 'Pending' : 'Paid'}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() =>
            navigation.navigate('AddAppointmentScreen', {appointment: item})
          }>
          <Edit2 size={20} color="#fff" />
          <Text style={styles.editText}>Edit appointment &</Text>
          <Text style={styles.editText}>payment staus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Trash size={20} color="#fff" />
          <Text style={styles.editText}>Delete appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && (
        <View style={{padding: 10, backgroundColor: 'red', marginBottom: 10}}>
          <Text style={{color: 'white', textAlign: 'center'}}>{error}</Text>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={upcomingAppointments}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAppointmentScreen')}>
        <Text style={styles.addButtonText}>+ Yeni Randevu</Text>
      </TouchableOpacity>
    </View>
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
  appointmentItem: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f7',
    borderRadius: 15,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4C7B8B',
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  infoContainer: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  appointmentDetails: {
    marginTop: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  appointmentDescription: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
  },
  contactName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  countdownContainer: {
    marginTop: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    alignItems: 'center',
    marginBottom: 20,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    alignItems: 'center',
  },
  paymentButton: {
    backgroundColor: '#ba68c8',
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

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Modal arkaplanına hafif siyahlık ekleme
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
  appointmentContactName: {
    marginVertical: 10,
    fontWeight: 'bold',
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
    maxHeight: 120, // Açıklamanın yüksekliği sınırlı olacak, kaydırılabilir
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
    backgroundColor: '#007bff',
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

  pendingStatus: {
    color: 'orange', // Yazı rengi
    paddingHorizontal: 10, // Yatay padding
    paddingVertical: 5, // Dikey padding
    backgroundColor: 'rgba(255, 255, 0, 0.2)', // Sarı tonlu arka plan
    borderRadius: 50, // Yuvarlak form
    borderWidth: 1,
    borderColor: 'orange',
    alignSelf: 'flex-start', // İçeriğin genişliği kadar olacak
  },
  paidStatus: {
    color: 'green', // Yeşil
    paddingHorizontal: 10, // Yatay padding
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 128, 0, 0.2)', // Yeşil arka plan
    borderRadius: 50, // Yuvarlak form
    borderWidth: 1,
    borderColor: 'green',
    alignSelf: 'flex-start',
  },
  defaultStatus: {
    color: 'gray', // Varsayılan gri renk
  },
});

export default AppointmentsScreen;
