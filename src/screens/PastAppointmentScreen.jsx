import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
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

  const loadAppointments = useCallback(async () => {
    try {
      const result = await getPastAppointments();
      setPastAppointments(result);
    } catch (error) {
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
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

  const renderItem = ({item}) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate('AddAppointmentScreen', {appointment: item})
            }>
            <Edit2 size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}>
            <Trash size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.appointmentDetails}>
        <View style={styles.dateContainer}>
          <Calendar size={18} color="#888" />

          <Text style={styles.appointmentDate}>
            {format(new Date(item.date), 'PPP - HH:mm', {locale: tr})}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.appointmentDescription}>{item.description}</Text>
        )}

        <Text style={styles.contactName}>Kişi: {item.contact_name}</Text>
      </View>

      {/* <View
        style={[
          styles.countdownContainer,
          {
            borderWidth: 2,
            borderColor: calculateTimeLeft(item.date).containerColor,
          },
        ]}>
        <Text style={styles.countdownText}>
          {calculateTimeLeft(item.date).timeLeft}
        </Text>
      </View> */}
    </View>

    /* <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate('AddAppointmentScreen', {
                appointment: item,
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
      </View>
      <Text style={styles.appointmentDate}>
        {format(new Date(item.date), 'PPP - HH:mm', {locale: tr})}
      </Text>
      {item.description && (
        <Text style={styles.appointmentDescription}>{item.description}</Text>
      )}
      <Text style={styles.contactName}>Kişi: {item.contact_name}</Text>
    </View> */
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pastAppointments}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={{textAlign: 'center'}}>Liste boş</Text>
        }
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={handleAllAppointmentsDelete}>
          <Text style={styles.addButtonText}>Tüm Geçmiş Randevuları Sil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAppointmentScreen')}>
          <Text style={styles.addButtonText}>+ Yeni Randevu</Text>
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
  /*
  appointmentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appointmentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  }, */

  appointmentItem: {
    backgroundColor: '#f0f4f7',
    borderWidth: 2,
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  },
  deleteButton: {
    backgroundColor: '#f44336',
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
});

export default PastAppointmentsScreen;
