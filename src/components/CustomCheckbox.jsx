import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const CustomCheckbox = ({checked, onToggle}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(!checked)}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.label, checked && styles.completedLabel]}>
        {checked ? 'Completed' : 'Not Completed'}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomCheckbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#3498db',
  },
  checkmark: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#3498db',
  },
  completedLabel: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
});
