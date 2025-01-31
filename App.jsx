import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Calendar, Profile, AddSquare} from 'iconsax-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AddAppointmentScreen from './src/screens/AddAppointmentScreen';
import ContactListScreen from './src/screens/ContactListScreen';
import AddContactScreen from './src/screens/AddContactScreen';

// Database
import {createTables} from './src/service/database';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppointmentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AppointmentsList"
      component={AppointmentsScreen}
      options={{title: 'Randevular'}}
    />
    <Stack.Screen
      name="AddAppointmentScreen"
      component={AddAppointmentScreen}
      options={({route}) => ({
        title: route.params?.appointment ? 'Randevu Düzenle' : 'Yeni Randevu',
      })}
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
    createTables();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Takvim',
            tabBarIcon: ({color}) => <Calendar size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Appointments"
          component={AppointmentsStack}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => <AddSquare size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Contacts"
          component={ContactsStack}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => <Profile size={24} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
