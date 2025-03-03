import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import SQLite from 'react-native-sqlite-storage';
// Database
import db, {
  getMonthAppointmentsCount,
  getTodayAppointmentsCount,
  getWeekAppointmentsCount,
  initTables,
} from './src/service/database';

import {Platform, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import RootNavigation from './src/routes/rootNavigation';
import BootSplash from 'react-native-bootsplash';

const App = () => {
  const [dbReady, setDbReady] = useState(false);
  // useEffect(() => {
  //   initTables()
  //     .then(() => {
  //       console.log('✅ Tables initialized, now fetching data...');
  //       getTodayAppointmentsCount();
  //       getWeekAppointmentsCount();
  //       getMonthAppointmentsCount();
  //     })
  //     .catch(error => console.error('❌ Table initialization error:', error));
  // }, []);

  useEffect(() => {
    const openDatabase = () => {
      db; // Burada db zaten database.js dosyasından import edilmiş
      setDbReady(true); // Veritabanı hazır olduğunda bu state'i true yapıyoruz
    };

    openDatabase();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (dbReady) {
        try {
          await initTables();
          console.log('✅ Tables initialized, now fetching data...');

          // Verileri çek
          await Promise.all([
            getTodayAppointmentsCount(),
            getWeekAppointmentsCount(),
            getMonthAppointmentsCount(),
          ]);
        } catch (error) {
          console.error('❌ Table initialization error:', error);
        } finally {
          // BootSplash'ı gizle
          await BootSplash.hide({fade: true});
          console.log('BootSplash has been hidden successfully');
        }
      }
    };

    init();
  }, [dbReady]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Platform.OS === 'android' ? '#3674B5' : undefined}
          />
          <RootNavigation />
          <Toast />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
