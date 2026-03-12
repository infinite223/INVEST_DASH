import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, FileText, Upload, PieChart, Info } from 'lucide-react-native';

const steps = [
  {
    icon: FileText,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    title: '1. Pobierz raport z XTB',
    desc: 'W XTB wybierz historię konta i ustaw zakres dat (np. od początku do końca wybranego miesiąca). Pobierz jako plik XLSX.',
  },
  {
    icon: Upload,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    title: '2. Wgraj plik',
    desc: 'Wybierz pobrany plik XLSX. Aplikacja automatycznie przetworzy dane dla danego miesiąca.',
  },
  {
    icon: PieChart,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    title: '3. Analizuj i planuj',
    desc: 'Sprawdź swoje wyniki, zysk totalny oraz nadchodzące wypłaty dywidend.',
  },
];

export const WelcomeModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View className="flex-1 items-center justify-center bg-black/60 p-4">
        <View className="max-h-[80%] w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <TouchableOpacity onPress={onClose} className="absolute right-6 top-6 z-10 p-2">
            <X size={24} color="#94a3b8" />
          </TouchableOpacity>

          <ScrollView className="p-8">
            <View className="mb-8 flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Image source={require('../assets/icon.png')} className="h-10 w-10" />
              </View>
              <View>
                <Text className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
                  Witaj w Assets Track
                </Text>
                <Text className="mt-1 text-xs font-bold uppercase tracking-widest text-indigo-500">
                  Twój osobisty analityk portfela
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              <Text className="text-base font-medium italic leading-relaxed text-slate-500">
                Aplikacja została stworzona, abyś mógł błyskawicznie analizować swoje inwestycje bez
                ręcznego wpisywania danych.
              </Text>

              {steps.map((step, i) => (
                <View
                  key={i}
                  className="flex-row gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <View
                    className={`h-10 w-10 rounded-xl ${step.bg} ${step.color} items-center justify-center`}>
                    <step.icon size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black uppercase italic text-slate-800">
                      {step.title}
                    </Text>
                    <Text className="mt-1 text-xs font-bold text-slate-400">{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-8 flex-row items-start gap-2 rounded-2xl bg-indigo-50 p-4">
              <Info size={16} color="#4f46e5" className="mt-0.5" />
              <Text className="flex-1 text-[11px] font-black uppercase italic text-indigo-700">
                Twoje dane nie opuszczają Twojego urządzenia. Wszystko przetwarzane jest lokalnie.
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="mt-6 items-center rounded-2xl bg-slate-800 py-5 font-black uppercase italic shadow-xl">
              <Text className="font-black tracking-widest text-white">ZACZYNAMY!</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
