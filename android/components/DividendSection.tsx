import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { DollarSign, Trash2, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react-native';
import { formatCurrency } from '../utils/formatters';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import biblioteki
export const DividendSection = ({
  dividends,
  form,
  onFormChange,
  onSave,
  onRemove,
  availableSymbols,
  sortConfig,
  onRequestSort,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const screenWidth = Dimensions.get('window').width;
  const [showPicker, setShowPicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onFormChange('date', formattedDate);
    }
  };

  const monthlyData = useMemo(() => {
    const months = [
      'Sty',
      'Lut',
      'Mar',
      'Kwi',
      'Maj',
      'Cze',
      'Lip',
      'Sie',
      'Wrz',
      'Paź',
      'Lis',
      'Gru',
    ];
    const data = months.map(() => 0);
    dividends.forEach((div: any) => {
      const date = new Date(div.payDate);
      if (date.getFullYear() === new Date().getFullYear()) {
        data[date.getMonth()] += div.totalAmount || 0;
      }
    });
    return data;
  }, [dividends]);

  return (
    <View className="gap-6">
      <View className="rounded-[30px] border border-slate-100 bg-white p-6">
        <Text className="mb-4 text-lg font-black">Planuj Dywidendę</Text>
        <View className="mb-3 h-[56px] justify-center rounded-xl bg-slate-50">
          <RNPickerSelect
            onValueChange={(value) => onFormChange('symbol', value)}
            items={availableSymbols.map((s: string) => ({ label: s, value: s }))}
            placeholder={{ label: 'Wybierz spółkę...', value: null }}
            value={form.symbol}
            Icon={() => null}
            useNativeAndroidPickerStyle={false}
            style={{
              inputIOS: {
                paddingHorizontal: 16,
                fontSize: 16,
                fontWeight: 'bold',
                color: '#334155',
              },
              inputAndroid: {
                paddingHorizontal: 16,
                fontSize: 16,
                fontWeight: 'bold',
                color: '#334155',
              },
              inputWeb: {
                paddingHorizontal: 16,
              },
            }}
          />
        </View>
        <TextInput
          placeholder="Stopa (%)"
          className="mb-3 rounded-xl bg-slate-50 p-4 font-bold"
          keyboardType="numeric"
          value={form.yield}
          onChangeText={(v) => onFormChange('yield', v)}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="mb-4 rounded-xl bg-slate-50 p-4">
          <Text className={form.date ? 'font-bold text-slate-800' : 'font-bold text-slate-400'}>
            {form.date || 'Data wypłaty...'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={form.date ? new Date(form.date) : new Date()}
            mode="date"
            placeholderText="Data wypłaty..."
            display="default"
            onChange={onDateChange}
          />
        )}
        <TouchableOpacity onPress={onSave} className="items-center rounded-xl bg-indigo-600 p-4">
          <Text className="font-black uppercase text-white">Dodaj do planu</Text>
        </TouchableOpacity>
      </View>

      <View className="rounded-[30px] border border-slate-100 bg-white p-6">
        <Text className="mb-4 font-black">Prognoza wypłat</Text>
        <BarChart
          data={{
            labels: ['Sty', 'Mar', 'Maj', 'Lip', 'Wrz', 'Lis'],
            datasets: [{ data: monthlyData.filter((_, i) => i % 2 === 0) }],
          }}
          width={screenWidth - 80}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (o = 1) => `rgba(99, 102, 241, ${o})`,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      <View className="overflow-hidden rounded-[30px] border border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-between p-6">
          <Text className="font-black">Harmonogram</Text>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </TouchableOpacity>

        {isExpanded &&
          dividends.map((div: any) => (
            <View
              key={div.id}
              className="flex-row items-center justify-between border-t border-slate-50 px-6 py-4">
              <View>
                <Text className="text-lg font-black">{div.symbol}</Text>
                <Text className="text-xs text-slate-400">{div.payDate}</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <Text className="font-black text-emerald-500">
                  {formatCurrency(div.totalAmount)}
                </Text>
                <TouchableOpacity onPress={() => onRemove(div.id)}>
                  <Trash2 size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};
