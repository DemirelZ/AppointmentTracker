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

const AppointmentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AppointmentsList"
      component={AppointmentsScreen}
      options={({navigation}) => ({
        title: 'Randevular',
        headerRight: () => (
          <Button
            title="Geçmiş"
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
);

const ContactsStack = () => (
  <Stack.Navigator>
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
      })}
    />
  </Stack.Navigator>
);

const App = () => {
  useEffect(() => {
    //createTables();
    initTables();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            height: 66,
            paddingTop: 10,
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Takvim',
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
  );
};

export default App;
