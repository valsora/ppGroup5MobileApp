import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
  return (
    <View style={styles.containerHomeScreen} >
      <StatusBar translucent={false} hidden={false} backgroundColor={bg200c} />
      <TouchableOpacity 
        style={styles.toMapButton} 
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.toMapButtonText}>К КАРТЕ</Text>
      </TouchableOpacity>
    </View>
  )
}

const MapScreen = ({navigation}) => {
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
            style={styles.PlusMinusButton}
            onPress={() => zoomPlus()}
          >
            <Text style={styles.PlusMinusButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.PlusMinusButton}
            onPress={() => zoomMinus()}
          >
            <Text style={styles.PlusMinusButtonText}>-</Text>
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
              color: tx200c
            },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerMapScreen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  toMapButton: {
    backgroundColor: prc,
    height: 80,
    width: 180,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: acc,
    borderWidth: 2,
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
  PlusMinusButton: {
    backgroundColor: prc + 'cc',
    height: 56,
    width: 56,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: acc,
    borderWidth: 1.5,
  },
  PlusMinusButtonText: {
    fontSize: 36,
    fontWeight: '200',
    color: txc,
  }
});