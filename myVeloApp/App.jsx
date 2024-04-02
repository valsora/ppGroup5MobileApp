import React, {useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YaMap,{ Marker, Animation } from 'react-native-yamap';

// temporarily
const bgc = '#000000'
const bg200c = '#161616'
const bg300c = '#2c2c2c'
const prc = '#FF00FF'
const pr200c = '#ff63ff'
const pr300c = '#ffd6ff'
const acc = '#00FFFF'
const ac200c = '#00999b'
const txc = '#FFFFFF'
const tx200c = '#e0e0e0'
// temporarily

const HomeScreen = ({navigation}) => {
  const [tokenInputText, onChangeTokenInputText] = React.useState('');
  const [buttonColor, changeButtonColor] = React.useState(pr300c);
  const [buttonDisabled, changeDisabled] = React.useState(true);
  
  return (
    <View style={styles.containerHomeScreen}>
      <StatusBar translucent={false} hidden={false} backgroundColor={bg200c} />
      <View style={styles.containerBgc1}>
        <Text style={styles.containerBgc1Text}>Чтобы начать запись маршрута, введите уникальный код из своего личного кабинета на сайте</Text>
      </View>
      <TextInput
        style={styles.tokenInput}
        onChangeText={onChangeTokenInputText}
        onEndEditing={() => {
          if (tokenInputText.length == 5) {
            changeButtonColor(prc)
            changeDisabled(false)
          } else {
            changeButtonColor(pr300c)
            changeDisabled(true)
          }
        }}
        value={tokenInputText}
        placeholder='ваш код'
        placeholderTextColor={tx200c}
        keyboardType='numeric'
      />
      <TouchableOpacity 
        style={styles.toMapButton} 
        onPress={() => {
          const existingToken = '42424'
          if (tokenInputText == existingToken) {
            navigation.navigate('Map', {userToken: tokenInputText})
          } else {
            Alert.alert('Ошибка', 'Данного кода не существует')
          }
        }}
        disabled={buttonDisabled}
      >
        <View style={styles.toMapButtonView} backgroundColor={buttonColor}>
          <Text style={styles.toMapButtonText}>НАЧАТЬ</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const MapScreen = ({route, navigation}) => {
  mymap = React.createRef();
  const getCamera = () => {
    return new Promise((resolve, reject) => {
      if (this.mymap.current) {
        this.mymap.current.getCameraPosition((position) => {
          resolve(position)
        })
      } else {
        reject('ERROR')
      }
    })
  }
  const zoomPlus = async () => {
    const camera = await getCamera();
    if (camera != 'ERROR') {
      this.mymap.current.setZoom(camera.zoom * 1.2, 0.5, Animation.SMOOTH)
    }
  }
  const zoomMinus = async () => {
    const camera = await getCamera();
    if (camera != 'ERROR') {
      this.mymap.current.setZoom(camera.zoom / 1.2, 0.5, Animation.SMOOTH)
    }
  }
  const {userToken} = route.params;
  
  return (
    <>
      <StatusBar translucent={true} hidden={false} backgroundColor='#0004' />
      <View style={styles.containerMapScreen}>
        <YaMap
          ref={this.mymap}
          style={styles.map}
          mapType='vector'
          showUserPosition={false}
          nightMode={true}
          initialRegion={{
            lon: 42,
            lat: 43,
            zoom: 2.2,
            azimuth: 0,
            tilt: 0
          }}
        >
        </YaMap>
        <View style={styles.containerPlusMinus}>
          <TouchableOpacity 
            style={styles.plusMinusButton}
            onPress={() => zoomPlus()}
          >
            <Text style={styles.plusMinusButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.plusMinusButton}
            onPress={() => zoomMinus()}
          >
            <Text style={styles.plusMinusButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default function App() {
  const Stack = createNativeStackNavigator();
  YaMap.init('8f655fe3-2522-4a4b-8212-616ec8071856');

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name='Home' 
          component={HomeScreen} 
          options={{
            title: 'Добро пожаловать',
            headerShown: true,
            headerStyle: {
              backgroundColor: bg200c
            },
            headerTitleStyle: {
              fontWeight: '300',
              fontSize: 24,
            },
            headerTintColor: tx200c,
            navigationBarColor: bg200c,
          }} 
        />
        <Stack.Screen 
          name='Map' 
          component={MapScreen} 
          options={{
            headerShown: false,
            navigationBarColor: bg200c,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  containerHomeScreen: {
    flex: 1,
    backgroundColor: bgc,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerMapScreen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  containerBgc1: {
    backgroundColor: bg300c,
    height: 'auto',
    width: '80%',
    marginTop: '50%',
    marginBottom: 10,
    padding: '4%',
    borderRadius: 20,
  },
  containerBgc1Text: {
    fontSize: 20,
    fontWeight: '200',
    color: txc,
    textAlign: 'center',
  },
  tokenInput: {
    backgroundColor: bg300c,
    height: 50,
    width: '30%',
    marginBottom: 10,
    borderRadius: 20,
    textAlign: 'center',
    color: txc,
  },
  toMapButton: {
    height: '10%',
    width: '42%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: acc,
    borderWidth: 1.5,
  },
  toMapButtonView: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toMapButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: txc,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  containerPlusMinus: {
    paddingRight: 8,
    position: 'absolute',
    height: 128,
    width: 'auto',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  plusMinusButton: {
    backgroundColor: prc + 'cc',
    height: 56,
    width: 56,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: acc,
    borderWidth: 1.5,
  },
  plusMinusButtonText: {
    fontSize: 36,
    fontWeight: '200',
    color: txc,
  }
});