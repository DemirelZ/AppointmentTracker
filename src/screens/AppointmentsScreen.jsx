import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {format} from 'date-fns';
import {
  deleteAppointment,
  getUpcomingAppointments,
  UpdateAppointmentCompleteStatus,
  searchAppointments,
} from '../service/database';
import {Edit2, Trash} from 'iconsax-react-native';
import CustomCheckbox from '../components/CustomCheckbox';
import Toast from 'react-native-toast-message';

const AppointmentsScreen = ({navigation}) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('upcomingAppointments', upcomingAppointments);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUpcomingAppointments();
      setUpcomingAppointments(result);
      setFilteredAppointments(result);
    } catch (error) {
      setError('Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    async term => {
      setSearchTerm(term);

      if (!term.trim()) {
        setFilteredAppointments(upcomingAppointments);
        return;
      }

      try {
        const searchResults = await searchAppointments(term);
        setFilteredAppointments(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredAppointments([]);
      }
    },
    [upcomingAppointments],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });

    return unsubscribe;
  }, [navigation, loadAppointments]);

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
              Toast.show({
                type: 'error',
                text1: 'The appointment was successfully deleted',
                visibilityTime: 1000,
                position: 'top',
                topOffset: 90,
              });
            } catch (error) {
              Alert.alert(
                'Error',
                'An error occurred while deleting an appointment.',
              );
            }
          },
        },
      ],
    );
  };

  const getPaymentStatusStyle = status => {
    if (status === 'Pending') {
      return styles.pendingStatus;
    } else if (status === 'Paid') {
      return styles.paidStatus;
    }
    return styles.defaultStatus;
  };

  const isPastAppointment = appointmentDate => {
    const appointmentDateTime = new Date(appointmentDate);
    const currentDateTime = new Date();
    return appointmentDateTime < currentDateTime;
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.appointmentItem,
        item.completed === 1 && styles.completedAppointmentItem,
        isPastAppointment(item.date) && styles.pastAppointmentItem,
      ]}>
      <View style={styles.infoContainer}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
        </View>
        <View style={styles.appointmentDetails}>
          <View style={styles.dateContainer}>
            <Text style={styles.appointmentDate}>
              📅 {format(new Date(item.date), 'PP - h:mm a')}
            </Text>
          </View>
          {item.description && (
            <Text style={styles.appointmentDescription}>
              🗒️ {item.description}
            </Text>
          )}
          <Text style={styles.appointmentContactName}>
            👤 {item.contact_name}
          </Text>
          <Text
            style={[
              styles.appointmentDescription,
              getPaymentStatusStyle(item.payment_status),
            ]}>
            Payment:{' '}
            {item.payment_status === 'Pending' ? '⌛ Pending' : '✅ Paid'}
          </Text>
          <CustomCheckbox
            checked={item.completed === 1}
            onToggle={async newState => {
              try {
                await UpdateAppointmentCompleteStatus(item.id, newState);

                // 📌 Her iki state'i de güncelle
                setUpcomingAppointments(prevAppointments =>
                  prevAppointments.map(appointment =>
                    appointment.id === item.id
                      ? {...appointment, completed: newState ? 1 : 0}
                      : appointment,
                  ),
                );

                setFilteredAppointments(prevFiltered =>
                  prevFiltered.map(appointment =>
                    appointment.id === item.id
                      ? {...appointment, completed: newState ? 1 : 0}
                      : appointment,
                  ),
                );

                Toast.show({
                  type: 'success',
                  text1: newState
                    ? 'Appointment marked as completed'
                    : 'Appointment marked as incomplete',
                  visibilityTime: 1000,
                  position: 'top',
                  topOffset: 90,
                });
              } catch (error) {
                console.error('Error updating completion status:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Failed to update completion status',
                  visibilityTime: 1000,
                  position: 'top',
                  topOffset: 90,
                });
              }
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
          <Text
            style={styles.editText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}>
            Edit appointment & payment status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Trash size={20} color="#fff" />
          <Text style={styles.editText}> Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search appointments..."
          value={searchTerm}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
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
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{textAlign: 'center'}}>
                {searchTerm
                  ? 'No search results found'
                  : 'No upcoming appointments'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAppointmentScreen')}>
        <Text style={styles.addButtonText}>+ New Appointment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    padding: 16,
  },
  appointmentItem: {
    flexDirection: 'column',
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
    flexDirection: 'row',
  },

  appointmentDetails: {
    marginTop: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  appointmentDescription: {
    fontSize: 15,
    color: '#444',
    marginVertical: 5,
  },
  contactName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  countdownContainer: {
    marginTop: 10,
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
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 10,
    borderRadius: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#578FCA',
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#D84040',
    alignItems: 'center',
    marginLeft: 10,
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

  // MODAL
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
    color: 'orange',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'orange',
    alignSelf: 'flex-start',
  },
  paidStatus: {
    color: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 128, 0, 0.2)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'green',
    alignSelf: 'flex-start',
  },
  defaultStatus: {
    color: 'gray',
  },
  completedAppointmentItem: {
    backgroundColor: '#e8f5e8',
    borderColor: '#27ae60',
    opacity: 0.8,
  },
  pastAppointmentItem: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
});

export default AppointmentsScreen;
