import React, { useEffect, useState } from 'react';
import {
    View,
    StatusBar,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import YaMap,{ Animation } from 'react-native-yamap';
import Geolocation from 'react-native-geolocation-service';
import requestLocPermission from '../common/requestLocationPermission';
import { colors } from '../resources/colors';


const MapScreen = ({route, navigation}) => {
    YaMap.init('8f655fe3-2522-4a4b-8212-616ec8071856');
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
    const [isRecordOn, changeIsRecordOn] = useState(-1);
    const startRecord = () => {
      changeIsRecordOn(1);
    }
    const pauseRecord = () => {
      changeIsRecordOn(isRecordOn===0?1:0);
    }
    const stopRecord = () => {
      changeIsRecordOn(-1);
      setStartButtonText('СТАРТ')
    }
    const [currentTime, setCurrentTime] = useState(0);
    const [startButtonText, setStartButtonText] = useState('СТАРТ');
    useEffect(() => {
      if (currentTime !== 0) {
        const hours = ('0' + Math.floor(currentTime / 3600000)).slice(-2);
        const min = ('0' + Math.floor(currentTime / 60000) % 60).slice(-2);
        const sec = ('0' + Math.floor(currentTime / 1000) % 60).slice(-2);
        setStartButtonText(min + ':' + sec);
        if (currentTime % 5000 === 0) {
          getLoc();
        }
      }
    }, [currentTime])
    useEffect(() => {
      let timerInterval;
      if (isRecordOn === 1) {
        timerInterval = setInterval(() => {
          setCurrentTime((t) => t + 100);
        }, 100)
      } else {
        clearInterval(timerInterval)
        if (isRecordOn === -1) {
          setCurrentTime(0);
          changeArrayOfCoords([]);
        }
      }
      return () => {clearInterval(timerInterval)}
    }, [isRecordOn]);
    const [arrayOfCoords, changeArrayOfCoords] = useState([]);
    const getLoc = () => {
      const response = requestLocPermission().then(res => {
        if (res) {
          Geolocation.getCurrentPosition(
            (position) => {
                const newArr = arrayOfCoords
                newArr.push(position.coords.latitude)
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
    useEffect(() => { //replace it later
      navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
        Alert.alert(
          'Закрыть карту?',
          'Уверены, что хотите выйти? Если вы начали запись маршрута, то она будет завершена, и данные не сохранятся',
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
          <View style={styles.mapContainer}>
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
                onPress={() => {zoomPlus()}}
              >
                <Text style={styles.plusMinusButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.plusMinusButton}
                onPress={() => {zoomMinus()}}
              >
                <Text style={styles.plusMinusButtonText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.belowMapContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => {startRecord()}}
            >
              <Text style={styles.belowMapButtonsText}>{startButtonText}</Text>
            </TouchableOpacity>
            <View style={styles.pauseStopContainer}>
              <TouchableOpacity 
                style={styles.pauseButton}
                disabled={isRecordOn===-1}
                onPress={() => {pauseRecord()}}
              >
                <Text style={styles.belowMapButtonsText}>ПАУЗА</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.stopButton}
                disabled={isRecordOn===-1}
                onLongPress={() => {stopRecord()}}
                delayLongPress={700}
              >
                <Text style={styles.belowMapButtonsText}>СТОП</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    )
}

const styles = StyleSheet.create({
    containerMapScreen: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
      flex: 1,
      width: '100%',
      height: '70%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    containerPlusMinus: {
        paddingRight: 8,
        position: 'absolute',
        height: 124,
        width: 'auto',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    belowMapContainer: {
      width: '100%',
      height: '10%',
      backgroundColor: colors.bg200c,
      flexDirection: 'column',
    },
    startButton: {
      width: '100%',
      height: '50%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.pr200c,
      borderTopWidth: 1,
    },
    pauseStopContainer: {
      width: '100%',
      height: '50%',
      flexDirection: 'row',
    },
    pauseButton: {
      width: '50%',
      height: '100%',
      alignItems: 'center',
      backgroundColor: colors.ac200c,
      borderRightWidth: 0.5,
      borderTopWidth: 1,
    },
    stopButton: {
      width: '50%',
      height: '100%',
      alignItems: 'center',
      backgroundColor: colors.ac200c,
      borderLeftWidth: 0.5,
      borderTopWidth: 1,
    },
    belowMapButtonsText: {
      fontSize: 26,
      fontWeight: '300',
      color: colors.txc,
    },
    plusMinusButton: {
        backgroundColor: colors.prc + 'cc',
        height: 56,
        width: 56,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.acc,
        borderWidth: 1.5,
    },
    plusMinusButtonText: {
        fontSize: 36,
        fontWeight: '200',
        color: colors.txc,
    },
})

export default MapScreen;