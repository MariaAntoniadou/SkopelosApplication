import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function CameraComponent({ onPhotoTaken, onClose }) {
  const [facing, setFacing] = useState('back');
  const [hasPermission, setHasPermission] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Ελέγχουμε τα permissions χωρίς να τα ζητήσουμε
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setPermissionChecked(true);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
      setPermissionChecked(true);
    }
  };

  if (!permissionChecked) {
    // Φορτώνουν τα permissions
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.message}>Έλεγχος αδειών κάμερας...</Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    // Δεν έχει άδεια κάμερας
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.message}>Η κάμερα χρειάζεται άδεια χρήσης</Text>
          <Text style={styles.subMessage}>
            Πηγαίνετε στις Ρυθμίσεις - Εφαρμογές - SkopelosApp - Άδειες και ενεργοποιήστε την κάμερα
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Κλείσιμο</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        onPhotoTaken && onPhotoTaken(photo);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subMessage: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 25,
    minWidth: 60,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});