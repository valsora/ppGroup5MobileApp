import { useState } from 'react';
import {
    View,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import requestLocPermission from '../common/requestLocationPermission';
import { colors } from '../resources/colors';
import { consts } from '../constants/consts';

const HomeScreen = ({navigation}) => {
  const [tokenInputText, changeTokenInputText] = useState('');
  const [buttonDisabled, changeDisabled] = useState(true);
  const [buttonColor, changeButtonColor] = useState(colors.pr300c);

  const getIfTokenExists = async (token) => { // move to common
    try {
      const response = await fetch('http://10.147.17.88:8000/token_mobile/' + token);
      return response.status;
    } catch (error) {
      console.error(error);
      return 'ERROR';
    }
  }
    
  return (
    <View style={styles.containerHomeScreen}>
      <StatusBar translucent={false} hidden={false} backgroundColor={colors.bg200c} />
      <View style={styles.containerBgc1}>
        <Text style={styles.containerBgc1Text}>Чтобы начать запись маршрута, введите уникальный код из своего личного кабинета на сайте</Text>
      </View>
      <TextInput
        style={styles.tokenInput}
        onChangeText={(text) => {
          changeTokenInputText(text)
          if (text.length === consts.tokenLength) {
            changeDisabled(false)
            changeButtonColor(colors.prc)
          } else {
            changeDisabled(true)
            changeButtonColor(colors.pr300c)
          }
        }}
        value={tokenInputText}
        placeholder='ваш код'
        placeholderTextColor={colors.tx200c}
        keyboardType='numeric'
      />
      <TouchableOpacity 
        style={styles.toMapButton}
        disabled={buttonDisabled}
        onPress={() => {
          // navigation.navigate('Map', {userToken: tokenInputText}); //temp
          getIfTokenExists(tokenInputText).then((respStatus) => {
            if (respStatus === 'ERROR') {
              Alert.alert('Ошибка', 'Нет доступа к серверу');
            } else {
              if (respStatus === 200) {
                requestLocPermission().then((permission) => {
                  if (permission) {
                    navigation.navigate('Map', {userToken: tokenInputText});
                  } else {
                    Alert.alert('Нет разрешения на использование локации', 'Пожалуйста, в настройках предоставьте приложению доступ к местоположению устройства');
                  }
                })
              } else {
                if (respStatus === 404) {
                  Alert.alert('Ошибка', 'Такого кода не существует');
                } else {
                  Alert.alert('Ошибка', 'Проблемы с сервером');
                }
                changeTokenInputText('');
                changeDisabled(true);
                changeButtonColor(colors.pr300c);
              }
            }
          })
        }}
      >
        <View style={styles.toMapButtonView} backgroundColor={buttonColor}>
          <Text style={styles.toMapButtonText}>НАЧАТЬ</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    containerHomeScreen: {
        flex: 1,
        backgroundColor: colors.bgc,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    containerBgc1: {
        backgroundColor: colors.bg300c,
        height: 'auto',
        width: '80%',
        marginTop: '50%',
        marginBottom: 16,
        padding: '4%',
        borderRadius: 20,
    },
    containerBgc1Text: {
        fontSize: 20,
        fontWeight: '200',
        color: colors.txc,
        textAlign: 'center',
    },
    tokenInput: {
        backgroundColor: colors.bg300c,
        height: 50,
        width: '42%',
        marginBottom: 24,
        borderRadius: 20,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '200',
        color: colors.txc,
    },
    toMapButton: {
        height: '10%',
        width: '42%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.acc,
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
        color: colors.txc,
    },
});

export default HomeScreen;