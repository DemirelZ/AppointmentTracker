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
  UpdateAppointmentCompleteStatus,
} from '../service/database';
import {ArrowDown2, Calendar, Edit2, Trash} from 'iconsax-react-native';
import {Picker} from '@react-native-picker/picker';
import {Button, Menu} from 'react-native-paper';
import CustomCheckbox from '../components/CustomCheckbox';
import moment from 'moment-timezone';
import {userTimeZone} from '../../App';

const PastAppointmentsScreen = ({navigation}) => {
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  console.log('pastAppointments filteredAppointments', filteredAppointments);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPastAppointments();
      setPastAppointments(result);
      filterAppointments(result);
    } catch (error) {
      //Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
      setError('Randevular yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    filterAppointments(pastAppointments);
  }, [pastAppointments]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });

    return unsubscribe;
  }, [navigation, loadAppointments]);

  useEffect(() => {
    filterAppointments();
  }, [selectedFilter]);

  const handleDelete = async id => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
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
              await deleteAppointment(id);
              loadAppointments();
            } catch (error) {
              Alert.alert(
                'Error',
                'An error occurred while deleting an appointment',
              );
            }
          },
        },
      ],
    );
  };

  const handleAllAppointmentsDelete = () => {
    Alert.alert(
      'Delete All Past Appointments',
      'All past appointments will be permanently deleted.\n\nAre you sure you want to delete all past appointments?',
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
              await deletePastAppointments();
              loadAppointments(); // Listeyi güncelle
            } catch (error) {
              Alert.alert(
                'Error',
                'An error occurred while deleting past appointments',
              );
            }
          },
        },
      ],
    );
  };

  const getPaymentStatusStyle = status => {
    if (status === 'Pending') {
      return styles.pendingStatus; // Sarı daire için stil
    } else if (status === 'Paid') {
      return styles.paidStatus; // Yeşil daire için stil
    }
    return styles.defaultStatus; // Varsayılan stil
  };

  const filterAppointments = (appointments = pastAppointments) => {
    if (selectedFilter === 'All') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(
        appointment => appointment.payment_status === selectedFilter,
      );
      setFilteredAppointments(filtered);
    }
  };

  const convertToUserTimeZone = utcDate => {
    return moment.utc(utcDate).tz(userTimeZone).toDate(); // Date nesnesi olarak dönç
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
              {format(new Date(item.date), 'PP - h:mm a')}
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
            Payment: {item.payment_status === 'Pending' ? 'Pending' : 'Paid'}
          </Text>
          <CustomCheckbox
            checked={item.completed === 1}
            onToggle={async newState => {
              await UpdateAppointmentCompleteStatus(item.id, newState);

              setPastAppointments(prevAppointments => {
                const updatedAppointments = prevAppointments.map(appointment =>
                  appointment.id === item.id
                    ? {...appointment, completed: newState ? 1 : 0}
                    : appointment,
                );
                return [...updatedAppointments]; // Yeni referans oluştur
              });
            }}
          />
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
          <Text style={styles.editText}>payment status</Text>
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
      {/* Dropdown Butonu */}
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              style={styles.dropdownButton}
              labelStyle={styles.dropdownButtonText}
              onPress={() => setMenuVisible(true)}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{selectedFilter}</Text>
                <ArrowDown2 size={18} color="black" />
              </View>
            </Button>
          }
          contentStyle={styles.menuContent}>
          <Menu.Item
            onPress={() => {
              setSelectedFilter('All');
              setMenuVisible(false);
            }}
            title="All"
            titleStyle={styles.menuItemText}
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilter('Paid');
              setMenuVisible(false);
            }}
            title="Paid"
            titleStyle={styles.menuItemText}
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilter('Pending');
              setMenuVisible(false);
            }}
            title="Pending"
            titleStyle={styles.menuItemText}
          />
        </Menu>
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && (
        <View style={{padding: 10, backgroundColor: 'red', marginBottom: 10}}>
          <Text style={{color: 'white', textAlign: 'center'}}>{error}</Text>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={filteredAppointments}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{textAlign: 'center'}}>List empty</Text>
          }
        />
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={handleAllAppointmentsDelete}>
          <Text style={styles.addButtonText}>Delete All Past Appointments</Text>
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
    backgroundColor: '#578FCA',
    alignItems: 'center',
    marginBottom: 20,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#D84040',
    alignItems: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#f44336',
    marginTop: 5,
    marginBottom: 24,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
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

  // -------- MENU ---------
  menuContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginTop: 10,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingVertical: 1,
    alignSelf: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: 'black',
  },
  buttonContent: {
    flexDirection: 'row', // Yatay hizalama
    alignItems: 'center', // Dikey hizalama
    justifyContent: 'center', // İçeriği ortalamak için
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    marginRight: 8, // İkon ile metin arasına boşluk ekler
  },
  menuContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5, // Android gölge efekti
    shadowColor: '#000', // iOS gölge efekti
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 5, // Butonun hemen altından başlasın
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 10,
  },
});

export default PastAppointmentsScreen;
