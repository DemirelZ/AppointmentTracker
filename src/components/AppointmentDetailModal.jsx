import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {format} from 'date-fns';
import {enUS} from 'date-fns/locale';

const AppointmentDetailModal = ({
  visible,
  onClose,
  appointment,
  onEdit,
  onDelete,
}) => {
  if (!appointment) return null;

  const getPaymentStatusColor = status => {
    switch (status) {
      case 'Paid':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getPaymentStatusText = status => {
    switch (status) {
      case 'Paid':
        return 'Paid';
      case 'Pending':
        return 'Pending';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getCompletionStatusText = completed => {
    return completed ? 'Completed' : 'Not Completed';
  };

  const getCompletionStatusColor = completed => {
    return completed ? '#4CAF50' : '#FF9800';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              <Text style={styles.sectionValue}>{appointment.title}</Text>
            </View>

            {appointment.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionValue}>
                  {appointment.description}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date and Time</Text>
              <Text style={styles.sectionValue}>
                {format(new Date(appointment.date), 'PPP - HH:mm', {
                  locale: enUS,
                })}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.sectionValue}>
                {appointment.contact_name}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getPaymentStatusColor(
                        appointment.payment_status,
                      ),
                    },
                  ]}>
                  <Text style={styles.statusText}>
                    {getPaymentStatusText(appointment.payment_status)}
                  </Text>
                </View>
              </View>
              {appointment.payment_status_description && (
                <Text style={styles.statusDescription}>
                  {appointment.payment_status_description}
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getCompletionStatusColor(
                        appointment.completed,
                      ),
                    },
                  ]}>
                  <Text style={styles.statusText}>
                    {getCompletionStatusText(appointment.completed)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Created At</Text>
              <Text style={styles.sectionValue}>
                {format(new Date(appointment.created_at), 'PPP - HH:mm', {
                  locale: enUS,
                })}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.editButton]}
              onPress={() => {
                onClose();
                onEdit(appointment);
              }}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.deleteButton]}
              onPress={() => {
                onClose();
                onDelete(appointment.id);
              }}>
              <Text style={styles.deleteButtonText}>Delete</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppointmentDetailModal;
