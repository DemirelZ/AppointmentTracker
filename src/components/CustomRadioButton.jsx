import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const CustomRadioButton = ({value, selectedValue, onChange, label}) => {
  const displayText = label || value;
  const isPending = value === 'Pending' || value === false;
  const isPaid = value === 'Paid' || value === true;

  return (
    <TouchableOpacity
      onPress={() => onChange(value)}
      style={[
        {flexDirection: 'row', alignItems: 'center'},
        isPending
          ? styles.pendingStatus
          : isPaid
          ? styles.paidStatus
          : styles.defaultStatus,
      ]}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: isPending ? 'orange' : isPaid ? 'green' : '#666',
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {selectedValue === value && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isPending ? 'orange' : isPaid ? 'green' : '#666',
            }}
          />
        )}
      </View>
      <Text style={{color: isPending ? 'orange' : isPaid ? 'green' : '#666'}}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    color: '#666',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#666',
    alignSelf: 'flex-start',
  },
});

export default CustomRadioButton;
