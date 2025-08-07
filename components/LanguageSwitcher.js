import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const langLabel = i18n.language === 'el' ? 'ΕΛ' : 'EN';

  return (
    <TouchableOpacity
      onPress={() => i18n.changeLanguage(i18n.language === 'el' ? 'en' : 'el')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        paddingHorizontal: 8,
        height: 28,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.12)',
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <FontAwesome name="globe" size={18} color="white" style={{ marginRight: 4 }} />
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 ,fontFamily:'Inter-Variable'}}>
        {langLabel}
      </Text>
    </TouchableOpacity>
  );
}