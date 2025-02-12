import {View, Text, TouchableOpacity} from 'react-native';

const CustomRadioButton = ({value, selectedValue, onChange}) => (
  <TouchableOpacity
    onPress={() => onChange(value)}
    style={{flexDirection: 'row', alignItems: 'center'}}>
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
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
    <Text>{value}</Text>
  </TouchableOpacity>
);

export default CustomRadioButton;
