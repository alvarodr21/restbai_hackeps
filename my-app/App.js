import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {Button, StyleSheet, Text, View, TextInput, Image} from 'react-native';
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

  const getMediaList = async (location) => {
    const api_url = 'https://intelligence.restb.ai/v1/search/comparables?client_key=8aea16ffd5b8c063504c71d62870abd980fa001c70d530fe6c33345bfdfb8191';
    return fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location)
      })
    .then(response => response.json())
    .then(data => {
      return data.response.comparables[0].media;
    }).catch(error => {
      console.log(location);
      console.error('Error fetching data from the API:', error);
    });
  }

  const getDataFromImg = async (imageUrl) => {
    const vision_url = 'https://api-us.restb.ai/vision/v2/multipredict?client_key=8aea16ffd5b8c063504c71d62870abd980fa001c70d530fe6c33345bfdfb8191&model_id=re_features_v5,re_roomtype_global_v2&image_url='+imageUrl;
    return fetch(vision_url, {
        method: 'GET'
    })
    .then(response => {return response.json()});
  }

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

    const mediaList = await getMediaList(location);
    console.log(mediaList);

    // Iterate through each image URL in the 'media' array
    for (const mediaItem of mediaList) {
        const imageUrl = mediaItem.image_url;
        console.log(imageUrl);

        const data2 = await getDataFromImg(imageUrl);
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
        // You can perform further actions with each image URL here
    }
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
      
      <Image
      source={require('./assets/a.png')}  
      style={styles.imageStyle} />

      <Text style={styles.welcomeText}>Welcome to our accessibility checker</Text>
      <StatusBar style="auto" />
      <Text>To check how accessible is a property use one of our two options:</Text>
      <Text style={styles.Text}>SUBMIT THE FOLLOWING LOCATION INFORMATION:</Text>

      <TextInput
        style={styles.input}
        placeholder="Write address here..."
        onChangeText={handleAddressChange}
        value={addressText}
      />
      <TextInput
        style={styles.input}
        placeholder="Write city here..."
        onChangeText={handleCityChange}
        value={cityText}
      />
      <TextInput
        style={styles.input}
        placeholder="Write postal code here..."
        onChangeText={handleCodeChange}
        value={codeText}
      />
      <TextInput
        style={styles.input}
        placeholder="Write state here..."
        onChangeText={handleStateChange}
        value={stateText}
      />
      <TextInput
        style={styles.input}
        placeholder="Write country here..."
        onChangeText={handleCountryChange}
        value={countryText}
      />

      <Button 
      title="Submit location" 
      onPress={handleButtonPress}
      color="orange"
       />
      <Text>Response: {displayText}</Text>

      <Text style={styles.Text}>SUBMIT THE LINK TO A HOUSE INTERIOR'S PICTURE:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Write link here..."
        onChangeText={handleCountryChange}
        value={countryText}
      />

      <Button 
      title="Submit link" 
      onPress={handleButtonPress}
      color="orange"
       />
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
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    margin: 10,
    width: '60%',
  },
  imageStyle: {
    width: 400,
    height: 100,
    marginVertical: 0,
  },
  customButton: {
    backgroundColor: 'orange',
    borderRadius: 15, 
    padding: 10,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24, 
    marginVertical: 0,
  },
  Text: {
    fontSize: 21, 
    color: 'orange',
    fontWeight: 'bold', 
    marginVertical: 10,
  },
});
