import {StyleSheet} from 'react-native';
import React from 'react';
import {ClipboardTick, Home3, People, User} from 'iconsax-react-native';

const TabIcons = ({focused, color, size, name}) => {
  if (name == 'Anasayfa') {
    return (
      <Home3
        color={color}
        size={focused ? 33 : size}
        variant={focused ? 'Bold' : 'Outline'}
      />
    );
  } else if (name == 'Randevularım') {
    return (
      <ClipboardTick
        color={color}
        size={focused ? 33 : size}
        variant={focused ? 'Bold' : 'Outline'}
      />
    );
  } else if (name == 'Kişiler') {
    return (
      <People
        color={color}
        size={focused ? 33 : size}
        variant={focused ? 'Bold' : 'Outline'}
      />
    );
  } else {
    return (
      <User
        color={color}
        size={focused ? 33 : size}
        variant={focused ? 'Bold' : 'Outline'}
      />
    );
  }
};

export default TabIcons;

const styles = StyleSheet.create({});
