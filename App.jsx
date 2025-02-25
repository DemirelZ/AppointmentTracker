import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';

// Database
import {initTables} from './src/service/database';

import {Platform, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import RootNavigation from './src/routes/rootNavigation';

const App = () => {
  useEffect(() => {
    //createTables();
    initTables();
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
