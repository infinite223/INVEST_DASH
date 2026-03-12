import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}: any) => {
  const [showPicker, setShowPicker] = useState(false);

  const currentDate = new Date(selectedYear, selectedMonth - 1, 1);

  const onDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Data raportu</Text>

          <Text style={styles.label}>WYBIERZ MIESIĄC I ROK</Text>
          <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>
              {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={onUpload}>
            <Text style={styles.saveButtonText}>ZAPISZ RAPORT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  dateSelector: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
    textTransform: 'capitalize',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 },
  box: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    minWidth: 50,
  },
  activeBox: { backgroundColor: '#4f46e5' },
  text: { fontWeight: 'bold', color: '#334155' },
  activeText: { color: 'white' },
  saveButton: { backgroundColor: '#4f46e5', padding: 20, borderRadius: 20, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '900', letterSpacing: 1 },
  cancelButton: { marginTop: 15, alignItems: 'center' },
  cancelButtonText: { color: '#94a3b8', fontWeight: '900', letterSpacing: 1 },
});
