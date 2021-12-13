import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import { Icon, Input, Button } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';

export default function SolveTimerScreen({ route, navigation }) {
	
	const [startTimer, setStartTimer] = useState(true);
	
	const db = SQLite.openDatabase('solves.db');	
	
	useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("CREATE TABLE IF NOT EXISTS solve (id INTEGER PRIMARY KEY NOT NULL, time INTEGER, penalty INTEGER, dnf INTEGER);");
		}, null, null);
	}, []);
	
	var currentTime;
	
	const processInspectionEvents = (time) => {
		if (time > 15000) {
			stopInspectionTimer();
		}
	}
	
	const goToStats = () => {
		navigation.navigate("Stats");
	}
	
	const stopAndStoreTime = () => {
		setStartTimer(false);
		db.transaction(tx => {
			tx.executeSql("INSERT INTO solve (time, penalty, dnf) VALUES (?, ?, ?);", [currentTime, 0, 0]);
		}, null, goToStats);
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
				msecs
				start={startTimer}
				getMsecs={(time) => currentTime = time}
				options={options}
			/>
			<Button raised icon={{name: "timer", color: "white"}} onPress={stopAndStoreTime} title="STOP" />
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
