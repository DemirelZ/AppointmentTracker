import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
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
        <Text style={styles.statLabel}>Bugün</Text>
        <Text style={styles.statValue}>{stats.today}</Text>
      </View>
      <View style={[styles.statBox, styles.statBoxMiddle]}>
        <Text style={styles.statLabel}>Bu Hafta</Text>
        <Text style={styles.statValue}>{stats.week}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Bu Ay</Text>
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
          {format(date, 'EEEE, d MMMM', {locale: tr})}
          {isCurrentDay && <Text style={styles.todayBadge}> • Bugün</Text>}
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
                onPress={() =>
                  navigation.navigate('AppointmentsScreen', {
                    appointmentId: appointment.id,
                  })
                }>
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
            <Text style={styles.noAppointment}>Randevu yok</Text>
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
            <Text style={styles.headerButtonText}>Önceki Hafta</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToToday}
          style={[styles.headerButton, styles.todayButton]}>
          <Text style={styles.todayButtonText}>Bu Hafta</Text>
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
            <Text style={styles.headerButtonText}>Sonraki Hafta</Text>
            <ArrowRight2 size="22" color="#666" />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.weekContainer}>{renderWeek()}</ScrollView>
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
    padding: 8,
    borderRadius: 4,
  },
  headerButtonText: {
    color: '#666',
  },
  todayButton: {
    backgroundColor: '#2196F3',
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
    padding: 4,
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
});

export default HomeScreen;
