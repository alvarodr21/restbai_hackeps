import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {Button, StyleSheet, Text, View, TextInput} from 'react-native';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handleInputChange = (text) => {
    setInputText(text);
  };

  const handleButtonPress = () => {
    setDisplayText(inputText);
    // You can perform other actions here based on the entered text if needed
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />

      <TextInput
        style={styles.input}
        placeholder="Type here..."
        onChangeText={handleInputChange}
        value={inputText}
      />

      <Button title="Press me" onPress={handleButtonPress} />

      <Text>Entered text: {displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
