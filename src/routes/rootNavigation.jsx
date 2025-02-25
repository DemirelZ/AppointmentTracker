import React from 'react';
import {StyleSheet} from 'react-native';
import TabNavigation from './tabNavigation';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import PastAppointmentsScreen from '../screens/PastAppointmentScreen';
import AddContactScreen from '../screens/AddContactScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3674B5',
        },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="TabNavigation"
        component={TabNavigation}
      />
      <Stack.Screen
        name="AddAppointmentScreen"
        component={AddAppointmentScreen}
        options={({route}) => ({
          title: route.params?.appointment
            ? 'Edit Appointment'
            : 'New Appointment',
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="AddContactScreen"
        component={AddContactScreen}
        options={({route}) => ({
          title: route.params?.contact ? 'Edit Contact' : 'New Contact',
          headerShown: true,
          unmountOnBlur: true,
        })}
      />
      <Stack.Screen
        name="PastAppointmentsScreen"
        component={PastAppointmentsScreen}
        options={{title: 'Past Appointments', headerShown: true}}
      />
    </Stack.Navigator>
  );
};

export default RootNavigation;
