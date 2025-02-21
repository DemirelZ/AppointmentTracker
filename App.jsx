import React, {useCallback, useEffect} from 'react';
import {
  CommonActions,
  NavigationContainer,
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Calendar, Profile, AddSquare, Personalcard} from 'iconsax-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AddAppointmentScreen from './src/screens/AddAppointmentScreen';
import ContactListScreen from './src/screens/ContactListScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import PastAppointmentsScreen from './src/screens/PastAppointmentScreen';

// Database
import {initTables} from './src/service/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import {Button} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';

const AppointmentsStack = () => (
  <PaperProvider>
    <Stack.Navigator initialRouteName="AppointmentsList">
      <Stack.Screen
        name="AppointmentsList"
        component={AppointmentsScreen}
        options={({navigation}) => ({
          title: 'Randevular',
          headerRight: () => (
            <Button
              title="go to archive"
              onPress={() => navigation.navigate('PastAppointmentsScreen')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddAppointmentScreen"
        component={AddAppointmentScreen}
        options={({route}) => ({
          title: route.params?.appointment ? 'Randevu Düzenle' : 'Yeni Randevu',
        })}
      />
      <Stack.Screen
        name="PastAppointmentsScreen"
        component={PastAppointmentsScreen}
        options={{title: 'Geçmiş Randevular'}}
      />
    </Stack.Navigator>
  </PaperProvider>
);

const ContactsStack = () => (
  <Stack.Navigator initialRouteName="ContactsList">
    <Stack.Screen
      name="ContactsList"
      component={ContactListScreen}
      options={{title: 'Kişiler'}}
    />
    <Stack.Screen
      name="AddContactScreen"
      component={AddContactScreen}
      options={({route}) => ({
        title: route.params?.contact ? 'Kişi Düzenle' : 'Yeni Kişi',
        unmountOnBlur: true,
      })}
    />
  </Stack.Navigator>
);

export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const App = () => {
  useEffect(() => {
    //createTables();
    initTables();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            //tabBarActiveTintColor: '#2196F3',
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              height: 70,
              paddingTop: 0,
              backgroundColor: '#3064f9',
            },
            safeAreaInsets: {bottom: 20},
            initialRouteName: 'Home',
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Calendar',
              tabBarIcon: ({color, focused}) => (
                <Calendar
                  size={focused ? 30 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentsStack}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => (
                <AddSquare
                  size={focused ? 30 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Contacts"
            component={ContactsStack}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => (
                <Personalcard
                  size={focused ? 30 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              ),
              unmountOnBlur: true,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
