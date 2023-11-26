import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {Button, StyleSheet, Text, View, TextInput} from 'react-native';
import {waitFor} from "@babel/core/lib/gensync-utils/async";


export default function App() {
  const [addressText, setAddressText] = useState('');
  const [cityText, setCityText] = useState('');
  const [codeText, setCodeText] = useState('');
  const [stateText, setStateText] = useState('');
  const [countryText, setCountryText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [stairsNum, setNumStairs] = useState(0);
  const [hasElevator, setHasElevator] = useState(false);
  const [score, setScore] = useState(7);
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

  const getLatLonFromLocation = (location) => {
    console.log(location);
    const { street_address, city, postal_code, state, country } = location.location;
    const address = `${street_address}, ${city}, ${postal_code}, ${state}, ${country}`;
    const geocode_key = 'eb043604731044e1a72e47936d0f0c47';
    const geocode_url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${geocode_key}`;
  
    return fetch(geocode_url)
      .then(response => response.json())
      .then(data => {
        const lat = data.results[0].geometry.lat;
        const lon = data.results[0].geometry.lng;
        return { lat, lon };
      });
  };

  const getDataFromLatLon = async (overpassQuery) => {
    return fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })
    .then(response => response.json())
    .then(data => {
      return data.elements.length;
    });
  };

  const handleButtonPress = async () => {
    const location = {
      "location": {
        "street_address": addressText.trim() === '' ? '1646 E ELMORE AVE' : addressText,
        "city": cityText.trim() === '' ? 'Dallas' : cityText,
        "postal_code": codeText.trim() === '' ? '75216' : codeText,
        "state": stateText.trim() === '' ? 'TX' : stateText,
        "country": countryText.trim() === '' ? 'US' : countryText
      }
    };

    //const { lat, lon } = await getLatLonFromLocation(location);
    const lat = '32.7175991';
    const lon = '-96.7981047'
    console.log(`Latitude: ${lat}, Longitude: ${lon}`);


    const overpassTemplate = `[out:json];(nodeQUESTION(around:1000,${lat},${lon}););out;`;
    const overpassQuery = overpassTemplate.replace('QUESTION', '["public_transport"]["wheelchair"="yes"]');
    const busCount = await getDataFromLatLon(overpassQuery);
    console.log(busCount);

    //const api_url = 'https://intelligence.restb.ai/v1/search/comparables?client_key=8aea16ffd5b8c063504c71d62870abd980fa001c70d530fe6c33345bfdfb8191';
  
    
    fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location)
      })
    .then(response => response.json())
    .then(data => {
      //setDisplayText(data.correlation_id);
      console.log(data.response.comparables[0].media);
        // Access the 'comparables' array
        const mediaList = data.response.comparables[0].media;

        // Iterate through each image URL in the 'media' array
        mediaList.forEach((mediaItem) => {
            const imageUrl = mediaItem.image_url;
            console.log(imageUrl);
            const vision_url = 'https://api-us.restb.ai/vision/v2/multipredict?client_key=8aea16ffd5b8c063504c71d62870abd980fa001c70d530fe6c33345bfdfb8191&model_id=re_features_v5,re_roomtype_global_v2&'+imageUrl;
            fetch(vision_url, {
                method: 'GET'
            })
            .then(response => response.json())
           .then(data2 => {
                    console.log(data2);
                    const listPredictions = data2.response?.solutions.re_roomtype_global_v2.predictions;
                    listPredictions.forEach((item) => {
                        if(item.label=="stairs" && item.confidence > 0.7) setNumStairs(stairsNum+1);
                    })

                    const listDetections = data2.response?.solutions.re_features_v5.detections;
                    for (const item of listDetections){
                        if(item.label == "elevator"){
                            setHasElevator(true);
                            break;
                        }
                    }
                })
            // You can perform further actions with each image URL here
        });

    }).catch(error => {
      console.log(location);
      console.error('Error fetching data from the API:', error);
    });
    setScore(score-3*stairsNum);
    if(hasElevator){
        if(stairsNum<3) setScore(score + 3.5);
        else setScore(score + 2.5);
    }
    if(score < 0) setScore(0);
    else if(score > 10) setScore(10);
    setDisplayText(score);
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
