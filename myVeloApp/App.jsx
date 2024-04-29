import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YaMap,{ Marker, Animation } from 'react-native-yamap';
import Geolocation from 'react-native-geolocation-service';

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

const requestLocPermission = async () => {
  try {
    const isGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (isGranted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}

const HomeScreen = ({navigation}) => {
  const [tokenInputText, changeTokenInputText] = React.useState('');
  const [buttonDisabled, changeDisabled] = React.useState(true);
  const [buttonColor, changeButtonColor] = React.useState(pr300c);
  
  return (
    <View style={styles.containerHomeScreen}>
      <StatusBar translucent={false} hidden={false} backgroundColor={bg200c} />
      <View style={styles.containerBgc1}>
        <Text style={styles.containerBgc1Text}>Чтобы начать запись маршрута, введите уникальный код из своего личного кабинета на сайте</Text>
      </View>
      <TextInput
        style={styles.tokenInput}
        onChangeText={(text) => {
          changeTokenInputText(text)
          if (text.length === 5) {
            changeDisabled(false)
            changeButtonColor(prc)
          } else {
            changeDisabled(true)
            changeButtonColor(pr300c)
          }
        }}
        value={tokenInputText}
        placeholder='ваш код'
        placeholderTextColor={tx200c}
        keyboardType='numeric'
      />
      <TouchableOpacity 
        style={styles.toMapButton}
        disabled={buttonDisabled}
        onPress={() => {
          const existingToken = '42424'
          //array of tokens from database
          if (tokenInputText === existingToken) {
            const response = requestLocPermission().then(res => {
              if (res) {
                navigation.navigate('Map', {userToken: tokenInputText})
              }
            })
          } else {
            Alert.alert('Ошибка', 'Данного кода не существует');
            changeTokenInputText('');
            changeDisabled(true)
            changeButtonColor(pr300c)
          }
        }}
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
  const [isRecordOn, changeIsRecordOn] = React.useState(false);
  const [arrayOfCoords, changeArrayOfCoords] = useState([]);
  const getLoc = () => {
    const response = requestLocPermission().then(res => {
      if (res) {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('position', position)
            const newArr = arrayOfCoords
            newArr.push(position.coords)
            changeArrayOfCoords(newArr)
            console.log(arrayOfCoords)
          },
          (error) => {
            console.log('error', error.code, error.message)
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 10,}
        );
      }
    })
  }
  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      if (isRecordOn) { //return ! before isRecordOn for correct logic (! is missed for tests)
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Прервать запись?',
        'Уверены, что хотите выйти? Запись маршрута будет завершена, а данные не сохранятся',
        [
          {
            text: 'Остаться',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Выйти',
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(e.data.action)
            },
          },
        ]
      );
    });
  }, [navigation]);

  return (
    <>
      <StatusBar translucent={true} hidden={false} backgroundColor='#0004' />
      <View style={styles.containerMapScreen}>
        <YaMap
          ref={this.mymap}
          style={styles.map}
          mapType='vector'
          showUserPosition={true}
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
            onPress={() => getLoc()}
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
    marginBottom: 8,
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
    width: '42%',
    marginBottom: 24,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '200',
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