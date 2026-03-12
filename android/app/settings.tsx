import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Settings, Database, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { usePortfolio } from '../hooks/usePortfolio';

export default function SettingsPage() {
  const { exportData, importData, resetAllData } = usePortfolio();

  const handleImport = async () => {
    const success = await importData();
    if (success) {
      Alert.alert('Sukces', 'Dane zostały pomyślnie zaimportowane!');
    }
  };

  const handleExport = async () => {
    await exportData();
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-12">
        <View className="mb-2 flex-row items-center gap-2">
          <Settings color="#94a3b8" size={16} />
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Konfiguracja Systemu
          </Text>
        </View>
        <Text className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
          Ustawienia <Text className="text-indigo-600">&</Text> Dane
        </Text>
      </View>

      <View className="gap-3 space-y-6">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleExport}
            className="flex-1 items-center rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <Database color="#6366f1" size={24} />
            <Text className="mt-3 text-xs font-black uppercase">Eksportuj</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            className="flex-1 items-center rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <RefreshCw color="#10b981" size={24} />
            <Text className="mt-3 text-xs font-black uppercase">Importuj</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-4 rounded-[30px] border border-indigo-100 bg-indigo-50 p-6">
          <ShieldCheck color="#4f46e5" size={24} />
          <View className="flex-1">
            <Text className="text-sm font-black uppercase">Twoja Prywatność</Text>
            <Text className="mt-1 text-xs text-slate-600">
              Działa w 100% lokalnie na Twoim urządzeniu.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={resetAllData}
          className="items-center rounded-[30px] border border-slate-200 p-6">
          <Text className="text-xs font-black uppercase text-rose-500">Usuń dane lokalne</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
