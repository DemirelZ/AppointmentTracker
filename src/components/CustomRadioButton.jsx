import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const CustomRadioButton = ({value, selectedValue, onChange}) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(value)}
      style={[
        {flexDirection: 'row', alignItems: 'center'},
        value === 'Beklemede' ? styles.pendingStatus : styles.paidStatus,
      ]}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: value == 'Beklemede' ? 'orange' : 'green',
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
              backgroundColor: '#333',
            }}
          />
        )}
      </View>
      <Text style={{color: value === 'Beklemede' ? 'orange' : 'green'}}>
        {value}
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
});

export default CustomRadioButton;
