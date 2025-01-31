import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {getAllAppointments, deleteAppointment} from '../service/database';

const AppointmentsScreen = ({navigation}) => {
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = useCallback(async () => {
    try {
      const result = await getAllAppointments();
      setAppointments(result);
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

  const renderItem = ({item}) => (
    <View style={styles.appointmentItem}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;
