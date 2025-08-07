import React from 'react';
import { Text } from 'react-native';
import { responsiveFont } from '../utils/responsive';

export default function AppText(props) {
  const { style, fontSize, ...restProps } = props;
  
  // Apply responsive font size if fontSize is provided in style
  const responsiveStyle = style && style.fontSize 
    ? { ...style, fontSize: responsiveFont(style.fontSize) }
    : style;

  return (
    <Text {...restProps} style={[{ fontFamily: 'Inter-Variable' }, responsiveStyle]}>
      {props.children}
    </Text>
  );
}