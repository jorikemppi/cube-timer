import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import { Icon, Input, Button } from 'react-native-elements';
import * as Speech from 'expo-speech';

export default function InspectionTimerScreen({ route, navigation }) {
	
	const [startTimer, setStartTimer] = useState(true);
	const [eightSecondsPassed, setEightSecondsPassed] = useState(false);
	const [twelveSecondsPassed, setTwelveSecondsPassed] = useState(false);
	
	const processInspectionEvents = (time) => {
		if (time > 8000) {
			setEightSecondsPassed(true);
		}
		if (time > 12000) {
			setTwelveSecondsPassed(true);
		}
		if (time > 15000) {
			stopInspectionTimer();
		}
	}
	
	useEffect(() => {
		if (eightSecondsPassed) {
			Speech.speak("eight seconds");
		}
	}, [eightSecondsPassed]);
	
	useEffect(() => {
		if (twelveSecondsPassed) {
			Speech.speak("twelve seconds");
		}
	}, [twelveSecondsPassed]);
	
	const stopInspectionTimer = () => {
		setStartTimer(false);
		navigation.navigate("SolveTimer");
	}
	
	const options = {
		container: {
			borderRadius: 10
		},
		text: {
			fontSize: 60
		}
	}
	
	return (
		<View style={styles.container}>
			<Stopwatch
				start={startTimer}
				getMsecs={(time) => processInspectionEvents(time)}
				options={options}
			/>
			<Button raised icon={{name: "timer", color: "white"}} onPress={stopInspectionTimer} title="BEGIN SOLVE" />
		</View>
	);
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	}
});
