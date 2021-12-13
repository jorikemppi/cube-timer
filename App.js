import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack/';

import ScrambleScreen from './ScrambleScreen';
import InspectionTimerScreen from './InspectionTimerScreen';
import SolveTimerScreen from './SolveTimerScreen';
import StatsScreen from './StatsScreen';

const Stack = createStackNavigator();

export default function App() {
	
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="ScrambleScreen"
				screenOptions={{headerShown: false}}
			>
				<Stack.Screen name="Scramble" component={ScrambleScreen} />
				<Stack.Screen name="InspectionTimer" component={InspectionTimerScreen} />
				<Stack.Screen name="SolveTimer" component={SolveTimerScreen} />
				<Stack.Screen name="Stats" component={StatsScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
	
}