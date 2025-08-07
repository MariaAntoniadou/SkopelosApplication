// Android Navigation Bar Fix
// Add this to your MainActivity.java or create a native module

import { Platform, StatusBar } from 'react-native';

export const AndroidNavigationBarFix = () => {
  if (Platform.OS === 'android') {
    // Hide the system navigation bar for immersive experience
    const hideNavigationBar = () => {
      // This would require native implementation
      // For now, we handle it in the layout
    };
    
    // Alternative: Use edge-to-edge layout
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }
};

// Usage in App.js:
// import { AndroidNavigationBarFix } from './utils/androidFix';
// AndroidNavigationBarFix();
