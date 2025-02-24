import React, {useCallback, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
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

import {
  Button,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Cihaz ekran genişliği
const screenWidth = Dimensions.get('window').width;

// Sekme başına düşen genişlik
const tabWidth = screenWidth / 3; // 3 sekme olduğu için bölüyoruz

// Dinamik `top` hesaplama
const tabBarHeight = 70; // tabBarStyle.height değeri ile aynı olmalı
const iconSize = 30; // İkonun aktifkenki boyutu
const activeIndicatorHeight = 3; // Çizginin yüksekliği

// Dinamik top değeri
const dynamicTop = -iconSize / 2 - activeIndicatorHeight / 2 + 11;

const AppointmentsStack = () => (
  <PaperProvider>
    <Stack.Navigator
      initialRouteName="AppointmentsList"
      screenOptions={{
        headerStyle: {
          backgroundColor: 'rgb(44, 83, 192)',
        },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen
        name="AppointmentsList"
        component={AppointmentsScreen}
        options={({navigation}) => ({
          title: 'Appointments',
          headerRight: () => (
            <Button
              title="Go to Archive >"
              onPress={() => navigation.navigate('PastAppointmentsScreen')}
              color={Platform.OS === 'ios' ? 'white' : 'rgb(44, 83, 192)'}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddAppointmentScreen"
        component={AddAppointmentScreen}
        options={({route}) => ({
          title: route.params?.appointment
            ? 'Edit Appointment'
            : 'New Appointment',
        })}
      />
      <Stack.Screen
        name="PastAppointmentsScreen"
        component={PastAppointmentsScreen}
        options={{title: 'Past Appointments'}}
      />
    </Stack.Navigator>
  </PaperProvider>
);

const ContactsStack = () => (
  <Stack.Navigator
    initialRouteName="ContactsList"
    screenOptions={{
      headerStyle: {
        backgroundColor: 'rgb(44, 83, 192)',
      },
      headerTintColor: '#fff',
    }}>
    <Stack.Screen
      name="ContactsList"
      component={ContactListScreen}
      options={{title: 'Contacts'}}
    />
    <Stack.Screen
      name="AddContactScreen"
      component={AddContactScreen}
      options={({route}) => ({
        title: route.params?.contact ? 'Edit Contact' : 'New Contact',
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

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('rgb(44, 83, 192)');
    }
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
              //backgroundColor: '#3064f9',
              backgroundColor: 'rgb(44, 83, 192)',
            },
            tabBarItemStyle: {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
            safeAreaInsets: {bottom: 20},
            initialRouteName: 'Home',
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Calendar',
              headerStyle: {
                backgroundColor: 'rgb(44, 83, 192)',
              },
              headerTintColor: '#fff',
              tabBarIcon: ({color, focused}) => (
                <View style={styles.iconContainer}>
                  {focused && <View style={styles.activeIndicator} />}
                  <Calendar
                    size={focused ? 30 : 24}
                    color={color}
                    variant={focused ? 'Bold' : 'Outline'}
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentsStack}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: 'rgb(44, 83, 192)',
              },
              headerTintColor: '#fff',
              tabBarIcon: ({color, focused}) => (
                <View style={styles.iconContainer}>
                  {focused && <View style={styles.activeIndicator} />}
                  <AddSquare
                    size={focused ? 30 : 24}
                    color={color}
                    variant={focused ? 'Bold' : 'Outline'}
                  />
                </View>
              ),
            }}
          />

          <Tab.Screen
            name="Contacts"
            component={ContactsStack}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: 'rgb(44, 83, 192)',
              },
              headerTintColor: '#fff',
              tabBarIcon: ({color, focused}) => (
                <View style={styles.iconContainer}>
                  {focused && <View style={styles.activeIndicator} />}
                  <Personalcard
                    size={focused ? 30 : 24}
                    color={color}
                    variant={focused ? 'Bold' : 'Outline'}
                  />
                </View>
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

const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: dynamicTop,
    width: tabWidth,
    height: activeIndicatorHeight,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  customButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
