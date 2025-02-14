import React, {useState} from 'react';
import {Modal, View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const PaymentUpdateModal = ({
  visible,
  onClose,
  appointment,
  updatePaymentStatus,
  db,
}) => {
  const [newAmount, setNewAmount] = useState(appointment.amount.toString());
  const [newPaymentStatus, setNewPaymentStatus] = useState(
    appointment.payment_status,
  );
  const [newPaymentMethod, setNewPaymentMethod] = useState(
    appointment.payment_method,
  );

  const handleUpdatePaymentStatus = () => {
    updatePaymentStatus(
      appointment.id,
      appointment.contact_id,
      parseFloat(newAmount),
      newPaymentStatus,
      newPaymentMethod,
      db,
    )
      .then(() => {
        console.log('Ödeme durumu başarıyla güncellendi');
        onClose();
      })
      .catch(error => {
        console.error('Ödeme durumu güncellenirken hata oluştu:', error);
      });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Ödeme Bilgileri</Text>

          {/* Mevcut Ödeme Bilgileri */}
          <Text style={styles.infoText}>
            💰 Mevcut Ödeme Miktarı: {appointment.amount}₺
          </Text>
          <Text style={styles.infoText}>
            📌 Mevcut Ödeme Durumu: {appointment.payment_status}
          </Text>
          <Text style={styles.infoText}>
            💳 Mevcut Ödeme Yöntemi: {appointment.payment_method}
          </Text>

          {/* Yeni Ödeme Miktarı */}
          <Text>Yeni Ödeme Miktarı:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={newAmount}
            onChangeText={setNewAmount}
          />

          {/* Yeni Ödeme Durumu */}
          <Text>Yeni Ödeme Durumu:</Text>
          <Picker
            selectedValue={newPaymentStatus}
            onValueChange={itemValue => setNewPaymentStatus(itemValue)}>
            <Picker.Item label="Beklemede" value="pending" />
            <Picker.Item label="Ödendi" value="paid" />
            <Picker.Item label="İptal Edildi" value="cancelled" />
          </Picker>

          {/* Yeni Ödeme Yöntemi */}
          <Text>Yeni Ödeme Yöntemi:</Text>
          <Picker
            selectedValue={newPaymentMethod}
            onValueChange={itemValue => setNewPaymentMethod(itemValue)}>
            <Picker.Item label="Nakit" value="cash" />
            <Picker.Item label="Kredi Kartı" value="credit_card" />
            <Picker.Item label="Banka Transferi" value="bank_transfer" />
          </Picker>

          {/* Güncelle & İptal Butonları */}
          <View style={styles.buttonContainer}>
            <Button title="Güncelle" onPress={handleUpdatePaymentStatus} />
            <Button title="İptal" onPress={onClose} color="red" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
});

export default PaymentUpdateModal;
