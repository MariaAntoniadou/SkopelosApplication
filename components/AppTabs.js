import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAllMainChapters } from '../api/apiService';
import MainChapters from './MainChapters';
import Home from './Home';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const [mainChapters, setMainChapters] = useState([]);
   const { t, i18n } = useTranslation();

  useEffect(() => {
    async function fetchChapters() {
      const chapters = await getAllMainChapters(i18n.language); 
      setMainChapters(chapters || []);
    }
    fetchChapters();
  }, []);

  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: () => (
            <AppText style={{ fontFamily: 'Inter-Variable', fontSize: 18 }}>
              Home
            </AppText>
          ),
        }}
      />
      {mainChapters.map((chapter) => (
        <Tab.Screen
          key={chapter.id}
          name={chapter.attributes.title}
          component={MainChapters}
          initialParams={{ id: chapter.id }}
          options={{
            tabBarLabel: ({ color, focused }) => (
              <AppText style={{ color, fontFamily: 'Inter-Variable', fontSize: 12 }}>
                {chapter.attributes.title}
              </AppText>
            ),
            headerTitle: () => (
              <AppText style={{ fontFamily: 'Inter-Variable', fontSize: 18 }}>
                {chapter.attributes.title}
              </AppText>
            ),
          }}
        />
      ))}
    </Tab.Navigator>

  );
}
