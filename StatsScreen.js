import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { Card, Icon, Input, Button } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';

export default function StatsScreen({ route, navigation }) {
	
	const [solves, setSolves] = useState([]);
	const [bestSolve, setBestSolve] = useState("");
	const [worstSolve, setWorstSolve] = useState("");
	const [averageSolve, setAverageSolve] = useState("");
	
	const [lastHundredSolves, setLastHundredSolves] = useState([]);
	const [bestOfHundred, setBestOfHundred] = useState("");
	const [worstOfHundred, setWorstOfHundred] = useState("");
	const [averageOfHundred, setAverageOfHundred] = useState("");
	
	const [lastFiveSolves, setLastFiveSolves] = useState([]);
	const [averageThreeOfFive, setAverageThreeOfFive] = useState("");
	
	const [lastTwelveSolves, setLastTwelveSolves] = useState([]);
	const [averageTenOfTwelve, setAverageTenOfTwelve] = useState("");
	
	const [deletedLastSolve, setDeletedLastSolve] = useState(false);
	
	const db = SQLite.openDatabase('solves.db');	

	useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("CREATE TABLE IF NOT EXISTS solve (id INTEGER PRIMARY KEY NOT NULL, time INTEGER, penalty INTEGER, dnf INTEGER);");
		}, null, updateSolves);
	}, []);
	
	const updateSolves = () => {
		db.transaction(tx => {
			tx.executeSql("SELECT * FROM solve WHERE dnf != 1;", [], (_, { rows }) =>
				setSolves(rows._array)
			);
		});	
		db.transaction(tx => {
			tx.executeSql("SELECT * FROM solve ORDER BY id DESC LIMIT 5;", [], (_, { rows } ) =>
				setLastFiveSolves(rows._array)
			);
		});
		db.transaction(tx => {
			tx.executeSql("SELECT * FROM solve ORDER BY id DESC LIMIT 12;", [], (_, { rows } ) =>
				setLastTwelveSolves(rows._array)
			);
		});
		db.transaction(tx => {
			tx.executeSql("SELECT * FROM (SELECT * FROM solve ORDER BY id DESC LIMIT 100) WHERE dnf != 1;", [], (_, { rows } ) =>
				setLastHundredSolves(rows._array)
			);
		});
	}
	
	// make a copy a of a results array where +2 second penalties are applied
	const copyAndApplyPenalty = (list) => {
		var newList = []
		for (i = 0; i < list.length; i++) {
			newList[i] = list[i];
			if (newList[i].penalty == 1) {
				newList[i].time = newList[i].time + 2000;
			}
		}
		return newList;
	}
	
	const setStatistics = (solveList, setBest, setWorst, setAverage) => {
		var times = copyAndApplyPenalty(solveList);
		// if there are no solves, set everything to --
		if (times.length == 0) {
			setBest("--");
			setWorst("--");
			setAverage("--");
		} else {
			times.sort((a, b) => a.time - b.time);
			var sum = times.reduce((sum, current) => sum + current.time, 0);
			var average = Math.round(sum / times.length);
			setAverage(average);
			setBest(times[0].time);
			setWorst(times.pop().time);
		}
	}
	
	// get statistics from all solves
	useEffect(() => {
		setStatistics(solves, setBestSolve, setWorstSolve, setAverageSolve);
	}, [solves]);
	
	// get statistics from 100 solves
	useEffect(() => {
		setStatistics(lastHundredSolves, setBestOfHundred, setWorstOfHundred, setAverageOfHundred);
	}, [lastHundredSolves]);
	
	// set WCA average of an amount of solves
	// (ie. the best and the worst time is ignored, and if there are two DNF solves, the average is DNF)
	
	const setWCAAverage = (solveList, solveAmount, setResult) => {
		
		if (solveList.length < solveAmount) {
			setResult("--");
		} else {
			
			var times = copyAndApplyPenalty(solveList);
			
			times.sort((a, b) => a.time - b.time);
			
			//sort times
			times.sort((a, b) => a.time - b.time);
			
			//remove best time
			times.shift();
				
			//filter out dnfs
			times = times.filter(item => item.dnf == 0);
				
			//if only one time was removed, remove worst time
			if (times.length == solveAmount - 1) {
				times.pop();
			}
			
			//if more than two times have been removed, average is DNF, else average is average
			if (times.length < solveAmount - 1) {
				setResult("DNF");
			} else {
				const reducer = (sum, current) => sum + current.time;
				var sum = times.reduce((sum, current) => sum + current.time, 0);
				var result = Math.round(sum / times.length);
				setResult(result);
			}
			
		}
		
	}
	
	useEffect(() => {		
		setWCAAverage(lastFiveSolves, 5, setAverageThreeOfFive);		
	}, [lastTwelveSolves]);
	
	useEffect(() => {		
		setWCAAverage(lastTwelveSolves, 12, setAverageTenOfTwelve);		
	}, [lastTwelveSolves]);
	
	const deleteAll = () => {
		Alert.alert(
			"Do you want to delete ALL times?",
			"This action cannot be undone!",
			[
				{
					text: "Cancel",
					style: "cancel"
				},
				{
					text: "Ok",
					onPress: () => db.transaction(tx => {
						tx.executeSql("DROP TABLE IF EXISTS solve;");
					}, null, goToScramble)
				}
			]
		);
	}
	
	const deleteTime = (item) => {
		Alert.alert(
			"Do you want to delete the time?",
			"This action cannot be undone!",
			[
				{
					text: "Cancel",
					style: "cancel"
				},
				{
					text: "Ok",
					onPress: () => db.transaction(tx => {
						tx.executeSql('DELETE FROM solve WHERE id = ?;', [item.id]);
						setDeletedLastSolve(true);
					}, null, updateSolves)
				}
			]
		);
	}
	
	const goToScramble = () => {
		navigation.navigate("Scramble");
	}
	
	const toggleDNF = (item) => {
		var newDNF;
		if (item.dnf == 1) {
			newDNF = 0;
		} else {
			newDNF = 1;
		}
		item.dnf = newDNF;
		db.transaction(tx => {
			tx.executeSql("UPDATE solve SET dnf = (?) WHERE id = (?);", [newDNF, item.id]);
			}, null, updateSolves
		);		
	}
	
	const togglePenalty = (item) => {
		var newPenalty;
		if (item.penalty == 1) {
			newPenalty = 0;
		} else {
			newPenalty = 1;
		}
		item.penalty = newPenalty;
		db.transaction(tx => {
			tx.executeSql("UPDATE solve SET penalty = (?) WHERE id = (?);", [newPenalty, item.id]);
			}, null, updateSolves
		);		
	}
	
	const FormattedTime = (props) => {
		var timeString = "";
		if (isNaN(props.time)) {
			timeString = props.time;
		} else {				
			var mins = Math.floor(props.time / 60000);
			var secs = Math.floor((props.time / 1000) % 60);
			var msecs = ("000" + props.time % 1000).slice(-3);
			var timeString = "";
			if (mins > 0) {
				timeString = timeString + mins + ":";
				secs = ("0" + secs).slice(-2);
			}
			timeString = timeString + secs + "." + msecs;
		}
		return (
			<Text {...props}>{timeString}</Text>
		);
	}	
	
	const SolveResult = () => {
		
		if (deletedLastSolve || lastFiveSolves.length == 0) {
			return (
				<View>
				</View>
			)
		} else {
			const item = lastFiveSolves[0];
			const time = lastFiveSolves[0].time
			
			var penaltyColor;
			var DNFColor;
			
			if (item.penalty == 1) {
				penaltyColor = "red";
			} else {
				penaltyColor = "gray";
			}
			
			if (item.dnf == 1) {
				DNFColor = "red";
			} else {
				DNFColor = "gray";
			}
			
			return (
				<View style={styles.latestResultContainer}>
					<View>
						<FormattedTime time={time} style={{fontSize: 40}} />
					</View>
					<View style={{flexDirection: "row"}}>
						<Text
							style={{fontSize: 30, color: penaltyColor}}
							onPress={() => {togglePenalty(item)}}
						>+2</Text>
						<Text
							style={{fontSize: 30, color: DNFColor}}
							onPress={() => {toggleDNF(item)}}
						> DNF </Text>
						<Text
							style={{fontSize: 30, color: "red"}}
							onPress={() => {deleteTime(item)}}
						>X</Text>
					</View>					
				</View>
			);
			
		}
		
	}
	
	return (
		<View style={styles.container}>
			<SolveResult />
			<View>
				<Card containerStyle={styles.cardContainer}>
					<Card.Title>ALL SOLVES</Card.Title>
					<Card.Divider />
					<View style={styles.resultsContainer}>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Best of all: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={bestSolve} /></View>
						</View>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Worst of all: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={worstSolve} /></View>
						</View>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Average of all: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={averageSolve} /></View>
						</View>
					</View>
				</Card>
				<Card containerStyle={styles.cardContainer}>
					<Card.Title>LAST 100 SOLVES</Card.Title>
					<Card.Divider />
					<View style={styles.resultsContainer}>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Best of 100: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={bestOfHundred} /></View>
						</View>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Worst of 100: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={worstOfHundred} /></View>
						</View>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Average of 100: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={averageOfHundred} /></View>
						</View>
					</View>
				</Card>
				<Card containerStyle={styles.cardContainer}>
					<Card.Title>LAST 5 SOLVES</Card.Title>
					<Card.Divider />
					<View style={styles.resultsContainer}>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Avg 3 of 5: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={averageThreeOfFive} /></View>
						</View>
					</View>
				</Card>
				<Card containerStyle={styles.cardContainer}>
					<Card.Title>LAST 12 SOLVES</Card.Title>
					<Card.Divider />
					<View style={styles.resultsContainer}>
						<View style={styles.singleResultContainer}>
							<View style={styles.resultNameContainer}><Text>Avg 10 of 12: </Text></View>
							<View style={styles.resultValueContainer}><FormattedTime time={averageTenOfTwelve} /></View>
						</View>
					</View>
				</Card>
			</View>
			<View>
				<Button raised buttonStyle={{backgroundColor: "red"}} containerStyle={{marginTop: 20}} icon={{name: "delete-forever", color: "white"}} onPress={deleteAll} title="Delete all times" />
				<Button raised containerStyle={{marginTop: 20}} icon={{name: "add-circle-outline", color: "white"}} onPress={goToScramble} title="Start new solve" />
			</View>
		</View>
	);	
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	cardContainer: {
		margin: 3
	},
	latestResultContainer: {
		alignItems: "center",
		justifyContent: "center"
	},
	resultsContainer: {
		alignItems: "center",
		justifyContent: "center"
	},
	singleResultContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	resultNameContainer: {
		width: 100,
		alignItems: "flex-end"
	},
	resultValueContainer: {
		width: 70
	}
		
});
