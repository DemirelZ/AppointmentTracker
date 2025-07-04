import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const CompletionToggle = ({completed, onChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Completion Status</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            !completed && styles.activeOption,
            completed && styles.inactiveOption,
          ]}
          onPress={() => onChange(false)}>
          <View style={styles.optionContent}>
            <View
              style={[
                styles.iconContainer,
                !completed && styles.activeIconContainer,
              ]}>
              <Text
                style={[styles.iconText, !completed && styles.activeIconText]}>
                ✗
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                !completed && styles.activeOptionText,
              ]}>
              Not Completed
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleOption,
            completed && styles.activeOption,
            !completed && styles.inactiveOption,
          ]}
          onPress={() => onChange(true)}>
          <View style={styles.optionContent}>
            <View
              style={[
                styles.iconContainer,
                completed && styles.activeIconContainer,
              ]}>
              <Text
                style={[styles.iconText, completed && styles.activeIconText]}>
                ✓
              </Text>
            </View>
            <Text
              style={[styles.optionText, completed && styles.activeOptionText]}>
              Completed
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleOption: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
  },
  activeOption: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveOption: {
    backgroundColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeOptionText: {
    color: '#fff',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  activeIconText: {
    color: '#fff',
  },
});

export default CompletionToggle;
