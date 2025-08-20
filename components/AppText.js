import React from 'react';
import { Text } from 'react-native';
import { DEVICE_CONFIG } from '../config/responsive';

export default function AppText(props) {
  const { style, fontSize, children, ...restProps } = props;
  
  const baseStyle = { fontFamily: 'Inter-Variable' };

   const responsiveFontSize = fontSize
    ? DEVICE_CONFIG.isTablet
      ? fontSize * 1.2
      : DEVICE_CONFIG.isSmallPhone
      ? fontSize * 0.9
      : fontSize
    : undefined;
    
  // Χρήση του υπάρχοντος responsive system
  const responsiveStyle = style && style.fontSize 
    ? { 
        ...style, 
        fontSize: DEVICE_CONFIG.isTablet 
          ? style.fontSize * 1.2 
          : DEVICE_CONFIG.isSmallPhone 
            ? style.fontSize * 0.9 
            : style.fontSize 
      }
    : style;

  return (
    <Text {...restProps} style={[baseStyle, responsiveStyle, responsiveFontSize && { fontSize: responsiveFontSize }]}>
      {children}
    </Text>
  );
}