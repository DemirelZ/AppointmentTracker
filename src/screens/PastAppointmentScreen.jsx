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
import {
  deleteAppointment,
  deletePastAppointments,
  getPastAppointments,
} from '../service/database';
import {Calendar, Edit2, Trash} from 'iconsax-react-native';

const PastAppointmentsScreen = ({navigation}) => {
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('pastAppointments', pastAppointments);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPastAppointments();
      setPastAppointments(result);
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

  const handleAllAppointmentsDelete = () => {
    Alert.alert(
      'Tüm Geçmiş Randevuları Sil',
      'Tüm geçmiş randevular kalıcı olarak silinecek.\n\nTüm geçmiş randevuları silmek istediğinizden emin misiniz?',
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
              await deletePastAppointments();
              loadAppointments(); // Listeyi güncelle
            } catch (error) {
              Alert.alert(
                'Hata',
                'Geçmiş randevular silinirken bir hata oluştu.',
              );
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
          data={pastAppointments}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{textAlign: 'center'}}>Liste boş</Text>
          }
        />
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={handleAllAppointmentsDelete}>
          <Text style={styles.addButtonText}>Tüm Geçmiş Randevuları Sil</Text>
        </TouchableOpacity>
      </View>
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
    borderWidth: 1.5,
    borderColor: '#f44336',
    borderRadius: 15,
    marginBottom: 20,
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  buttonsContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 4,
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
  deleteAllButton: {
    backgroundColor: '#f44336',
    marginVertical: 5,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    // position: 'absolute',
    // bottom: 24,
    // right: 24,
    marginVertical: 5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    // ...(Platform.OS === 'android'
    //   ? {
    //       elevation: 4, // Android için
    //     }
    //   : {}),
    shadowColor: '#000', // iOS için
    shadowOffset: {width: 0, height: 2}, // iOS için
    shadowOpacity: 0.25, // iOS için
    shadowRadius: 4, // iOS için
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  appointmentContactName: {
    marginVertical: 10,
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: 'orange', // Sarı tonunda olabilir
    padding: 5,
    backgroundColor: 'rgba(255, 255, 0, 0.2)', // Sarı arka plan
    borderRadius: 50, // Yuvarlak form
  },
  paidStatus: {
    color: 'green', // Yeşil
    padding: 5,
    backgroundColor: 'rgba(0, 128, 0, 0.2)', // Yeşil arka plan
    borderRadius: 50, // Yuvarlak form
  },
  defaultStatus: {
    color: 'gray', // Varsayılan gri renk
  },
});

export default PastAppointmentsScreen;
