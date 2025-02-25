import {Dimensions, StyleSheet, View, Button} from 'react-native';
import React, {useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import {AddSquare, Calendar, Personalcard} from 'iconsax-react-native';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ContactListScreen from '../screens/ContactListScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <SafeAreaProvider>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#D3D3D3',
          tabBarStyle: {
            height: 70,
            paddingTop: 5,
            backgroundColor: '#3674B5',
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
              backgroundColor: '#3674B5',
            },
            headerTintColor: '#fff',
            tabBarIcon: ({color, focused}) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeIndicator} />}
                <Calendar
                  size={focused ? 32 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={({navigation}) => ({
            title: 'Appointments',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3674B5',
            },
            headerRight: () => (
              <Button
                title="Go to Archive >"
                onPress={() => navigation.navigate('PastAppointmentsScreen')}
                color={Platform.OS === 'ios' ? '#fff' : '#3674B5'} // iOS için beyaz, Android için mavi
              />
            ),
            headerTintColor: '#fff',
            tabBarIcon: ({color, focused}) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeIndicator} />}
                <AddSquare
                  size={focused ? 32 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              </View>
            ),
          })}
        />

        <Tab.Screen
          name="Contacts"
          component={ContactListScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3674B5',
            },
            headerTintColor: '#fff',
            tabBarIcon: ({color, focused}) => (
              <View style={styles.iconContainer}>
                {focused && <View style={[styles.activeIndicator]} />}
                <Personalcard
                  size={focused ? 32 : 24}
                  color={color}
                  variant={focused ? 'Bold' : 'Outline'}
                />
              </View>
            ),
            unmountOnBlur: true,
          }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default TabNavigation;

const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
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
