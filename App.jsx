import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';

// Database
import {
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
    const init = async () => {
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
    };

    init();
  }, []);

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
