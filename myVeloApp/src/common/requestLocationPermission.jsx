import { PermissionsAndroid } from 'react-native';

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

export default requestLocPermission;