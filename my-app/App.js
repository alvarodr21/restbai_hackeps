import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {Button, StyleSheet, Text, View, TextInput} from 'react-native';

export default function App() {
  const [addressText, setAddressText] = useState('');
  const [cityText, setCityText] = useState('');
  const [codeText, setCodeText] = useState('');
  const [stateText, setStateText] = useState('');
  const [countryText, setCountryText] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handleAddressChange = (text) => {
    setAddressText(text);
  };
  const handleCityChange = (text) => {
    setCityText(text);
  };
  const handleCodeChange = (text) => {
    setCodeText(text);
  };
  const handleStateChange = (text) => {
    setStateText(text);
  };
  const handleCountryChange = (text) => {
    setCountryText(text);
  };

  const handleButtonPress = () => {
    const location = {
      "location": {
        "street_address": addressText.trim() === '' ? '1646 E ELMORE AVE' : addressText,
        "city": cityText.trim() === '' ? 'Dallas' : cityText,
        "postal_code": codeText.trim() === '' ? '75216' : codeText,
        "state": stateText.trim() === '' ? 'TX' : stateText,
        "country": countryText.trim() === '' ? 'US' : countryText
      }
    };
    const api_url = 'https://intelligence.restb.ai/v1/search/comparables?client_key=8aea16ffd5b8c063504c71d62870abd980fa001c70d530fe6c33345bfdfb8191';
    fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location)
      })
    .then(response => response.json())
    .then(data => {
      setDisplayText(data.correlation_id);
      console.log(data.response.comparables[0]);
    }).catch(error => {
      console.log(location);
      console.error('Error fetching data from the API:', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />

      <TextInput
        style={styles.input}
        placeholder="Type address..."
        onChangeText={handleAddressChange}
        value={addressText}
      />
      <TextInput
        style={styles.input}
        placeholder="Type city..."
        onChangeText={handleCityChange}
        value={cityText}
      />
      <TextInput
        style={styles.input}
        placeholder="Type postal code..."
        onChangeText={handleCodeChange}
        value={codeText}
      />
      <TextInput
        style={styles.input}
        placeholder="Type state..."
        onChangeText={handleStateChange}
        value={stateText}
      />
      <TextInput
        style={styles.input}
        placeholder="Type country..."
        onChangeText={handleCountryChange}
        value={countryText}
      />

      <Button title="Press me" onPress={handleButtonPress} />

      <Text>Response: {displayText}</Text>
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
