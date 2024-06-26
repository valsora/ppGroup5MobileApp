import React, { useEffect, useState } from 'react';
import {
    View,
    StatusBar,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import YaMap, { Animation, Polyline } from 'react-native-yamap';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../resources/colors';
import { consts } from '../constants/consts';


const MapScreen = ({route, navigation}) => {
    const {userToken} = route.params;
    YaMap.init('8f655fe3-2522-4a4b-8212-616ec8071856');
    const zoomPlus = () => {
      this.mymap.getCameraPosition((position) => {
        const zoom = position.zoom;
        this.mymap.setZoom(zoom <= consts.zoomLim ? zoom * consts.zoomB : zoom * consts.zoomS, consts.zoomDur, Animation.SMOOTH);
      })
    }
    const zoomMinus = () => {
      this.mymap.getCameraPosition((position) => {
        const zoom = position.zoom;
        this.mymap.setZoom(zoom <= consts.zoomLim ? zoom / consts.zoomB : zoom / consts.zoomS, consts.zoomDur, Animation.SMOOTH);
      })
    }
    const [isRecordOn, changeIsRecordOn] = useState(-1);
    const startRecord = () => {
      if (currentTime === 0) {
        changeIsRecordOn(1);
      }
    }
    const pauseRecord = () => {
      changeIsRecordOn(isRecordOn===0?1:0);
    }
    const stopRecord = () => {
      changeIsRecordOn(-1);
      setPauseButtonText('ПОЕЗДКА');
      setStopButtonText('ЗАВЕРШЕНА');
      console.log(arrayOfCoords); // temp
      console.log(arrIfAfterPause); // temp
      postCoordsToDB(userToken, currentTime, arrayOfCoords).then((respStatus) => {
        if (respStatus === 'ERROR') {
          Alert.alert('Ошибка', 'Нет доступа к серверу');
        } else {
          if (respStatus === 200) {
            Alert.alert('Запись завершена', 'Ваш маршрут сохранен');
          } else {
            Alert.alert('Запись завершена', 'Проблемы с сохранением маршрута');
          }
        }
      });
    }
    const postCoordsToDB = async (tokenMobile, travelTime, arrOfCoords) => { // move to common
      try {
        const response = await fetch('http://10.147.17.88:8000/route/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_mobile: tokenMobile,
            users_travel_time: travelTime,
            latitude_longitude: arrOfCoords,
          }),
        });
        return response.status;
      } catch (error) {
        console.error(error);
        return 'ERROR';
      }
    }
    const [currentTime, setCurrentTime] = useState(0);
    const [startButtonText, setStartButtonText] = useState('СТАРТ');
    const [pauseButtonText, setPauseButtonText] = useState('ПАУЗА');
    const [stopButtonText, setStopButtonText] = useState('СТОП');
    const [ifTracking, setIfTracking] = useState(false);
    useEffect(() => {
      if (currentTime !== 0) {
        const hours = ('0' + Math.floor(currentTime / 3600000)).slice(-2);
        const min = ('0' + Math.floor(currentTime / 60000) % 60).slice(-2);
        const sec = ('0' + Math.floor(currentTime / 1000) % 60).slice(-2);
        setStartButtonText(hours + ':' + min + ':' + sec);
        if (ifTracking) findMeOnMap(consts.camDurWhileTracking);
        if (currentTime % consts.addCoordInterval === 0) addCoord();
      }
    }, [currentTime])
    useEffect(() => {
      let timerInterval;
      if (isRecordOn === 1) {
        setPauseButtonText('ПАУЗА');
        timerInterval = setInterval(() => {
          setCurrentTime((t) => t + 100);
        }, 100)
      } else {
        clearInterval(timerInterval)
        if (isRecordOn === 0) {
          setPauseButtonText('ПРОДОЛЖИТЬ');
          setAfterPauseFlag(true);
        }
      }
      return () => {clearInterval(timerInterval)}
    }, [isRecordOn]);
    const [arrayOfCoords, changeArrayOfCoords] = useState([]);
    const [forPolyline, changeCoordsForPolyline] = useState([]);
    const [arrIfAfterPause, changeArrIfAfterPause] = useState([]);
    const [afterPauseFlag, setAfterPauseFlag] = useState(false);
    class Coord {
      lat
      lon
      constructor (latitude, longitude) {
        this.lat = latitude;
        this.lon = longitude;
      }
    }
    const addCoord = () => {
      Geolocation.getCurrentPosition(
        (position) => {
            changeArrayOfCoords(arr => [...arr, [position.coords.latitude, position.coords.longitude]]);
            changeCoordsForPolyline(arr => [...arr, new Coord(position.coords.latitude, position.coords.longitude)]);
            changeArrIfAfterPause(arr => [...arr, afterPauseFlag]);
            if (afterPauseFlag) setAfterPauseFlag(false);
        },
        (error) => {
            console.error(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 20,}
      );
    }
    const findMeOnMap = (duration) => {
      Geolocation.getCurrentPosition(
        (position) => {
          this.mymap.setCenter(new Coord(position.coords.latitude, position.coords.longitude), consts.findMeZoom, 0, 0, duration, Animation.LINEAR);
        },
        (error) => {
          console.error(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 20,}
      );
    }
    useEffect(() => {findMeOnMap(0)}, []);
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
                navigation.dispatch(e.data.action);
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
              ref={YaMap => {
                this.mymap = YaMap;
              }}
              style={styles.map}
              mapType='vector'
              showUserPosition={true}
              userLocationAccuracyFillColor={colors.pr300c + 'aa'}
              userLocationIcon={require('../img/locicon.png')}
              userLocationIconScale={0.1}
              nightMode={true}
              tiltGesturesEnabled={false}
              initialRegion={{
                lon: 42,
                lat: 43,
                zoom: 2.2,
                azimuth: 0,
                tilt: 0
              }}
            >
              <Polyline
                points={forPolyline}
                strokeColor={colors.acc}
                strokeWidth={1.5}
                outlineColor={colors.prc}
                outlineWidth={1}
              />
            </YaMap>
            <View style={styles.containerRightSideButtons}>
              <TouchableOpacity 
                style={styles.rightSideButtons}
                onPress={() => {zoomPlus()}}
              >
                <Text style={styles.rightSideButtonsText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rightSideButtons}
                onPress={() => {zoomMinus()}}
              >
                <Text style={styles.rightSideButtonsText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rightSideButtons}
                onPress={() => {findMeOnMap(0)}}
                onLongPress={() => {setIfTracking(prev => !prev)}} // upgrade tracking later
              >
                <Image
                  style={styles.findMeButtonImg}
                  source={require('../img/locicon.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.belowMapContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              disabled={isRecordOn !== -1}
              onPress={() => {startRecord()}}
            >
              <Text style={styles.belowMapButtonsText}>{startButtonText}</Text>
            </TouchableOpacity>
            <View style={styles.pauseStopContainer}>
              <TouchableOpacity 
                style={styles.pauseButton}
                disabled={isRecordOn === -1}
                onPress={() => {pauseRecord()}}
              >
                <Text style={styles.belowMapButtonsText}>{pauseButtonText}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.stopButton}
                disabled={isRecordOn === -1}
                onLongPress={() => {stopRecord()}}
                delayLongPress={700}
              >
                <Text style={styles.belowMapButtonsText}>{stopButtonText}</Text>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    mapContainer: {
      width: '100%',
      height: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    containerRightSideButtons: {
        paddingRight: 8,
        position: 'absolute',
        height: 184,
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
    rightSideButtons: {
        backgroundColor: colors.prc + 'cc',
        height: 56,
        width: 56,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.acc,
        borderWidth: 1.5,
    },
    rightSideButtonsText: {
        fontSize: 36,
        fontWeight: '200',
        color: colors.txc,
    },
    findMeButtonImg: {
      height: '140%',
      width: '140%',
    },
})

export default MapScreen;