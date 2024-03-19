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
import YaMap, {Animation} from 'react-native-yamap';

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.containerHomeScreen} >
      <StatusBar translucent={false} hidden={false} backgroundColor='#A5A5A5' />
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
      this.mymap.current.setZoom(camera.zoom * 0.8, 0.5, Animation.SMOOTH)
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
          showUserPosition={true}
          initialRegion={{
            lon: 42,
            lat: 43,
            zoom: 2.2,
            azimuth: 0,
            tilt: 0
          }}
        >
        </YaMap>
      </View>
    </>
  )
}

export default function App() {
  const Stack = createNativeStackNavigator();
  Yamap.init('8f655fe3-2522-4a4b-8212-616ec8071856');

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
              backgroundColor: '#A5A5A5'
            },
            headerTitleStyle: {
              fontWeight: '300',
              fontSize: 24,
              color: '#fff'
            },
            navigationBarColor: '#A5A5A5',
          }}
        />
        <Stack.Screen
          name='Map'
          component={MapScreen}
          options={{
            headerShown: false,
            navigationBarColor: '#0004',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  containerHomeScreen: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerMapScreen: {
    flex: 1,
    backgroundColor: '#48f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toMapButton: {
    backgroundColor: '#EEE8AA',
    height: 75,
    width: 150,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  toMapButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000'
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});