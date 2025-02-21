import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {format, addMonths, subMonths, addDays, isSameDay} from 'date-fns';
import {tr} from 'date-fns/locale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HOURS = Array.from({length: 24}, (_, i) => i);
const MINUTES = ['00', '15', '30', '45'];

const DateTimePickerModal = ({
  visible,
  onClose,
  onSelect,
  initialDate,
  mode = 'date', // 'date' veya 'time'
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const [selectedHour, setSelectedHour] = useState(
    initialDate?.getHours() || 9,
  );
  const [selectedMinute, setSelectedMinute] = useState(
    initialDate?.getMinutes() || 0,
  );

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = date => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (hour, minute) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(selectedHour);
    finalDate.setMinutes(selectedMinute);
    onSelect(finalDate);
    onClose();
  };

  const formatHourAMPM = hour => {
    const period = hour < 12 ? 'AM' : 'PM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // 0'ı 12 AM, 12'yi 12 PM yap
    return `${formattedHour} ${period}`;
  };

  // Eski calendar
  // const renderCalendar = () => {
  //   const start = new Date(
  //     currentMonth.getFullYear(),
  //     currentMonth.getMonth(),
  //     1,
  //   );
  //   const days = [];
  //   start.setDate(start.getDate() - start.getDay());

  //   for (let i = 0; i < 42; i++) {
  //     const date = addDays(start, i);
  //     const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
  //     const isSelected = isSameDay(date, selectedDate);
  //     const isToday = isSameDay(date, new Date());
  //     const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  //     days.push(
  //       <TouchableOpacity
  //         key={i}
  //         style={[
  //           styles.dayButton,
  //           isWeekend && styles.weekendDay,
  //           !isCurrentMonth && styles.otherMonthDay,
  //           isSelected && styles.selectedDay,
  //           isToday && styles.today,
  //         ]}
  //         onPress={() => handleDateSelect(date)}
  //         disabled={!isCurrentMonth}>
  //         <Text
  //           style={[
  //             styles.dayText,
  //             isWeekend && styles.weekendDayText,
  //             !isCurrentMonth && styles.otherMonthDayText,
  //             isSelected && styles.selectedDayText,
  //             isToday && styles.todayText,
  //           ]}>
  //           {date.getDate()}
  //         </Text>
  //       </TouchableOpacity>,
  //     );
  //   }

  //   return (
  //     <View style={styles.calendar}>
  //       {/* Haftanın günleri */}
  //       <View style={styles.weekDays}>
  //         {['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'].map((day, index) => (
  //           <Text
  //             key={index}
  //             style={[
  //               styles.weekDayText,
  //               (index === 0 || index === 6) && styles.weekendDayHeaderText, // Hafta sonu günleri için özel stil
  //             ]}>
  //             {day}
  //           </Text>
  //         ))}
  //       </View>

  //       {/* Günler */}
  //       <View style={styles.daysContainer}>{days}</View>
  //     </View>
  //   );
  // };

  const renderCalendar = () => {
    const start = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const days = [];

    // Haftanın ilk günü Pazartesi olarak ayarla
    start.setDate(
      start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1),
    );

    for (let i = 0; i < 42; i++) {
      const date = addDays(start, i);
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayButton,
            isWeekend && styles.weekendDay,
            !isCurrentMonth && styles.otherMonthDay,
            isSelected && styles.selectedDay,
            isToday && styles.today,
          ]}
          onPress={() => handleDateSelect(date)}
          disabled={!isCurrentMonth}>
          <Text
            style={[
              styles.dayText,
              isWeekend && styles.weekendDayText,
              !isCurrentMonth && styles.otherMonthDayText,
              isSelected && styles.selectedDayText,
              isToday && styles.todayText,
            ]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>,
      );
    }

    return (
      <View style={styles.calendar}>
        {/* Haftanın günleri (Pazartesi ile başlıyor) */}
        <View style={styles.weekDays}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
            <Text
              key={index}
              style={[
                styles.weekDayText,
                (index === 5 || index === 6) && styles.weekendDayHeaderText, // Hafta sonu günleri için özel stil
              ]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Günler */}
        <View style={styles.daysContainer}>{days}</View>
      </View>
    );
  };

  const renderTimePicker = () => (
    <View style={styles.timePickerContainer}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeColumnHeader}>Hour</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {HOURS.map(hour => (
            <TouchableOpacity
              key={hour}
              style={[
                styles.timeButton,
                selectedHour === hour && styles.selectedTimeButton,
              ]}
              onPress={() => handleTimeSelect(hour, selectedMinute)}>
              <Text
                style={[
                  styles.timeText,
                  selectedHour === hour && styles.selectedTimeText,
                ]}>
                {/* {hour.toString().padStart(2, '0')} */}
                {formatHourAMPM(hour)} {/* AM/PM formatına çevrildi */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.timeColumn}>
        <Text style={styles.timeColumnHeader}>Min</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {MINUTES.map(minute => (
            <TouchableOpacity
              key={minute}
              style={[
                styles.timeButton,
                selectedMinute === parseInt(minute) &&
                  styles.selectedTimeButton,
              ]}
              onPress={() => handleTimeSelect(selectedHour, parseInt(minute))}>
              <Text
                style={[
                  styles.timeText,
                  selectedMinute === parseInt(minute) &&
                    styles.selectedTimeText,
                ]}>
                {minute}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {mode === 'date' ? (
            <>
              <View style={styles.header}>
                <View style={styles.headerNav}>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handlePrevMonth}>
                    <Text style={styles.headerButtonText}>←</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    {format(currentMonth, 'MMMM yyyy')}
                  </Text>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleNextMonth}>
                    <Text style={styles.headerButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {renderCalendar()}
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Time</Text>
              </View>
              {renderTimePicker()}
            </>
          )}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <Text style={styles.footerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              onPress={handleConfirm}>
              <Text style={[styles.footerButtonText, styles.confirmButtonText]}>
                Select
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: 10,
    minWidth: 44,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },

  calendar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff', // Arka plan rengi
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android için gölge
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: '14%', // Her bir gün için eşit genişlik
  },
  weekendDayHeaderText: {
    color: '#D32F2F', // Hafta sonu günlerinin kırmızı olması
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Günleri taşır, böylece ekran küçük olsa bile sığdırır
    justifyContent: 'space-between',
  },

  dayButton: {
    width: (SCREEN_WIDTH - 40) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: '#999',
  },
  today: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerButton: {
    padding: 10,
    marginLeft: 10,
  },
  footerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 500,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeColumnHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  timeButton: {
    padding: 10,
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 5,
  },
  selectedTimeButton: {
    backgroundColor: '#2196F3',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weekendDay: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  weekendDayText: {
    color: '#1976D2',
  },
  weekendDayHeaderText: {
    color: '#1976D2',
  },
});

export default DateTimePickerModal;
