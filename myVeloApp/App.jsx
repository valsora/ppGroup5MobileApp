import HomeScreen from './src/screens/homeScreen';
import MapScreen from './src/screens/mapScreen';
import { colors } from './src/resources/colors';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function App() {
  const Stack = createNativeStackNavigator();

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
              backgroundColor: colors.bg200c
            },
            headerTitleStyle: {
              fontWeight: '300',
              fontSize: 24,
            },
            headerTintColor: colors.tx200c,
            navigationBarColor: colors.bg200c,
          }} 
        />
        <Stack.Screen 
          name='Map' 
          component={MapScreen} 
          options={{
            headerShown: false,
            navigationBarColor: colors.bg200c,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}