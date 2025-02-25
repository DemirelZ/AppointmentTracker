import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {format, addDays, startOfDay, subDays} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  getAppointmentsByDateRange,
  getTodayAppointmentsCount,
  getWeekAppointmentsCount,
  getMonthAppointmentsCount,
} from '../service/database';
import {ArrowLeft2, ArrowRight2} from 'iconsax-react-native';

const HomeScreen = ({navigation}) => {
  const [weekAppointments, setWeekAppointments] = useState([]);
  //const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Pazar) - 6 (Cumartesi)
    const monday = subDays(today, dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Haftanın Pazartesi gününü bul
    return startOfDay(monday);
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const [today, week, month] = await Promise.all([
        getTodayAppointmentsCount(),
        getWeekAppointmentsCount(),
        getMonthAppointmentsCount(),
      ]);
      setStats({today, week, month});
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  }, []);

  const loadWeekAppointments = useCallback(async () => {
    try {
      const endDate = addDays(startDate, 6);
      const appointments = await getAppointmentsByDateRange(
        startDate.toISOString(),
        endDate.toISOString(),
      );
      setWeekAppointments(appointments);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while loading appointments.');
    }
  }, [startDate]);

  useEffect(() => {
    loadWeekAppointments();
    loadStats();
  }, [loadWeekAppointments, loadStats]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWeekAppointments();
      loadStats();
    });

    return unsubscribe;
  }, [navigation, loadWeekAppointments, loadStats]);

  const isToday = date => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // const goToToday = () => {
  //   setStartDate(startOfDay(new Date()));
  // };
  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Bugünün haftanın günü (0 - Pazar, 1 - Pazartesi, ...)

    // Pazartesi'yi haftanın başı olarak kabul et
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Eğer Pazar ise 6 gün geriye git, aksi halde (1-6) Pazartesi'ye git
    const monday = addDays(today, -daysToSubtract); // Pazartesi'yi bul

    setStartDate(monday); // Haftanın Pazartesi'sini başlangıç tarihi olarak ayarla
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Today</Text>
        <Text style={styles.statValue}>{stats.today}</Text>
      </View>
      <View style={[styles.statBox, styles.statBoxMiddle]}>
        <Text style={styles.statLabel}>This Week</Text>
        <Text style={styles.statValue}>{stats.week}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>This Month</Text>
        <Text style={styles.statValue}>{stats.month}</Text>
      </View>
    </View>
  );

  const renderDayAppointments = date => {
    const dayAppointments = weekAppointments.filter(
      app =>
        format(new Date(app.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    );

    const isCurrentDay = isToday(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return (
      <View
        style={[styles.dayContainer, isWeekend && styles.weekendDayContainer]}
        key={date.toISOString()}>
        <Text style={[styles.dayHeader, isCurrentDay && styles.todayHeader]}>
          {format(date, 'EEEE, d MMMM')}
          {isCurrentDay && <Text style={styles.todayBadge}> • Today</Text>}
        </Text>
        <View
          style={[
            styles.appointmentsContainer,
            isWeekend && !isCurrentDay && styles.weekendAppointmentsContainer,
            isCurrentDay && styles.todayContainer,
          ]}>
          {dayAppointments.length > 0 ? (
            dayAppointments.map(appointment => (
              <TouchableOpacity
                key={appointment.id}
                style={[
                  styles.appointmentItem,
                  isWeekend && !isCurrentDay && styles.weekendAppointmentItem,
                  isCurrentDay && styles.todayAppointmentItem,
                ]}
                onPress={() => {
                  setSelectedAppointment(appointment); // Seçilen randevuyu güncelle
                  setModalVisible(true); // Modal'ı aç
                }}>
                <Text style={styles.appointmentTime}>
                  {format(new Date(appointment.date), 'HH:mm')}
                </Text>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentTitle}>
                    {appointment.title}
                  </Text>
                  <Text style={styles.contactName}>
                    {appointment.contact_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noAppointment}>No appointment</Text>
          )}
        </View>
      </View>
    );
  };

  const renderWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(renderDayAppointments(addDays(startDate, i)));
    }
    return days;
  };

  return (
    <View style={styles.container}>
      {renderStats()}
      <View style={styles.header}>
        {/* <TouchableOpacity
          onPress={() => setStartDate(addDays(startDate, -7))}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>← Önceki Hafta</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => setStartDate(addDays(startDate, -7))}
          style={styles.headerButton}>
          <View style={styles.prevWeek}>
            <ArrowLeft2 size="22" color="#666" />
            <Text style={styles.headerButtonText}>Previous Week</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToToday}
          style={[styles.headerButton, styles.todayButton]}>
          <Text style={styles.todayButtonText}>This Week</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => setStartDate(addDays(startDate, 7))}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Sonraki Hafta →</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => setStartDate(addDays(startDate, 7))}
          style={styles.headerButton}>
          <View style={styles.afterWeek}>
            <Text style={styles.headerButtonText}>Next Week</Text>
            <ArrowRight2 size="22" color="#666" />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.weekContainer}>{renderWeek()}</ScrollView>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalFrame}>
              <View style={styles.modalContent}>
                {selectedAppointment ? (
                  <>
                    <Text style={styles.modalTitleHead}>
                      Appointment Details
                    </Text>
                    <Text
                      style={styles.modalTitle}
                      numberOfLines={3}
                      ellipsizeMode="tail">
                      {selectedAppointment.title}
                    </Text>

                    <View style={styles.detailContainer}>
                      <Text style={styles.modalLabel}>Time:</Text>
                      <Text style={styles.modalValue}>
                        {format(new Date(selectedAppointment.date), 'HH:mm')}
                      </Text>
                    </View>

                    <View style={styles.detailContainer}>
                      <Text style={styles.modalLabel}>Contact:</Text>
                      <Text style={styles.modalValue}>
                        {selectedAppointment.contact_name}
                      </Text>
                    </View>

                    <View style={styles.detailContainer}>
                      <Text style={styles.modalLabel}>Phone:</Text>
                      <Text style={styles.modalValue}>
                        {selectedAppointment.contact_phone}
                      </Text>
                    </View>

                    <View style={styles.descriptionContainer}>
                      <Text style={styles.modalLabel}>Description:</Text>
                      <ScrollView style={styles.scrollView}>
                        <Text style={styles.modalDescription}>
                          {selectedAppointment.description}
                        </Text>
                      </ScrollView>
                    </View>

                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.loadingText}>Loading...</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    padding: 6,
    borderRadius: 4,
  },
  headerButtonText: {
    color: '#666',
  },
  todayButton: {
    // backgroundColor: '#2196F3',
    backgroundColor: '#3674B5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayHeader: {
    color: '#2196F3',
  },
  todayBadge: {
    color: '#2196F3',
    fontWeight: 'normal',
  },
  todayContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 8,
  },
  todayAppointmentItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  weekContainer: {
    flex: 1,
  },
  dayContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  appointmentItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    color: '#2196F3',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noAppointment: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  statBoxMiddle: {
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  appointmentsContainer: {
    borderRadius: 8,
  },
  weekendDayContainer: {
    backgroundColor: '#f8f9ff',
  },
  weekendAppointmentsContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 8,
  },
  weekendAppointmentItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3ff',
  },
  prevWeek: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  afterWeek: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Koyu şeffaf arka plan
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitleHead: {
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 14,
    color: '#333',
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  modalLabel: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalValue: {
    fontSize: 16,
    color: '#444',
  },
  descriptionContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  scrollView: {
    maxHeight: 120, // Açıklamanın yüksekliği sınırlı olacak, kaydırılabilir
  },
  modalDescription: {
    fontSize: 15,
    color: '#555',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
