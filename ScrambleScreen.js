import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Icon, Input, Button } from 'react-native-elements';
import { Canvas, useFrame } from 'react-three-fiber';
import { useIsFocused } from "@react-navigation/native";

function Cubelet(props) {

	const mesh = useRef();
	
	// Define the positions for each of the 26 cubelets.
	const locationPositions = [
		[-1, 1, -1],
		[0,  1, -1],
		[1,  1, -1],
		[-1, 1, 0],
		[0,  1, 0],
		[1,  1, 0],
		[-1, 1, 1],
		[0,  1, 1],
		[1,  1, 1],
		
		[-1, 0, -1],
		[0,  0, -1],
		[1,  0, -1],
		[-1, 0, 0],
		[1,  0, 0],
		[-1, 0, 1],
		[0,  0, 1],
		[1,  0, 1],
		
		[-1, -1, -1],
		[0,  -1, -1],
		[1,  -1, -1],
		[-1, -1, 0],
		[0,  -1, 0],
		[1,  -1, 0],
		[-1, -1, 1],
		[0,  -1, 1],
		[1,  -1, 1],
	];
	
	// Define which tiles are on each side of each of the 26 cubelets.
	// There are 54 possible colored tiles. We also include the "insides"
	// of the cubelets as a 55th location, which will be colored black.
	
	var locationTiles = [
		[54, 36,  9, 54, 54, 29],
		[54, 54, 10, 54, 54, 28],
		[47, 54, 11, 54, 54, 27],
		[54, 37, 12, 54, 54, 54],
		[54, 54, 13, 54, 54, 54],
		[46, 54, 14, 54, 54, 54],
		[54, 38, 15, 54, 18, 54],
		[54, 54, 16, 54, 19, 54],
		[45, 54, 17, 54, 20, 54],
		
		[54, 39, 54, 54, 54, 32],
		[54, 54, 54, 54, 54, 31],
		[50, 54, 54, 54, 54, 30],
		[54, 40, 54, 54, 54, 54],
		[49, 54, 54, 54, 54, 54],
		[54, 41, 54, 54, 21, 54],
		[54, 54, 54, 54, 22, 54],
		[48, 54, 54, 54, 23, 54],
		
		[54, 42, 54, 6,  54, 35],
		[54, 54, 54, 7,  54, 34],
		[53, 54, 54, 8,  54, 33],
		[54, 43, 54, 3,  54, 54],
		[54, 54, 54, 4,  54, 54],
		[52, 54, 54, 5,  54, 54],
		[54, 44, 54, 0,  24, 54],
		[54, 54, 54, 1,  25, 54],
		[51, 54, 54, 2,  26, 54],
	];
	
	// This array defines where each of the 55 tile locations (including the black virtual tile)
	// will move on a clockwise counter turn of each face. For example, [35, 0, 0, 2, 38, 0 ]
	// means that the tile at location 0 will move to location 35, 2 or 8 on a left, down or
	// front turn respectively, and stay where it is on any other turn.
	
	const turnRules = [
			
		//yellow
		[35, 0,  0,  2,  38, 0 ],
		[1,  1,  1,  5,  41, 1 ],
		[2,  20, 2,  8,  44, 2 ],
		[32, 3,  3,  1,  3,  3 ],
		[4,  4,  4,  4,  4,  4 ],
		[5,  23, 5,  7,  5,  5 ],
		[29, 6,  6,  0,  6,  53],
		[7,  7,  7,  3,  7,  50],
		[8,  26, 8,  6,  8,  47],
		
		//white
		[18, 9,  11, 9,  9,  42],
		[10, 10, 14, 10, 10, 39],
		[11, 33, 17, 11, 11, 36],
		[21, 12, 10, 12, 12, 12],
		[13, 13, 13, 13, 13, 13],
		[14, 30, 16, 14, 14, 14],
		[24, 15, 9,  15, 45, 15],
		[16, 16, 12, 16, 48, 16],
		[17, 27, 15, 17, 51, 17],

		//green
		[0,  18, 36, 18, 20, 18],
		[19, 19, 37, 19, 23, 19],
		[20, 11, 38, 20, 26, 20],
		[3,  21, 21, 21, 19, 21],
		[22, 22, 22, 22, 22, 22],
		[23, 14, 23, 23, 25, 23],
		[6,  24, 24, 51, 18, 24],
		[25, 25, 25, 52, 21, 25],
		[26, 17, 26, 53, 24, 26],

		//blue
		[27, 8,  45, 27, 27, 29],
 		[28, 28, 46, 28, 28, 32],
		[15, 29, 47, 29, 29, 35],
		[30, 5,  30, 30, 30, 28],
		[31, 31, 31, 31, 31, 31],
		[12, 32, 32, 32, 32, 34],
		[33, 2,  33, 42, 33, 27],
		[34, 34, 34, 43, 34, 30],
		[9,  35, 35, 44, 35, 33],

		//orange
		[38, 36, 27, 36, 36, 6 ],
		[41, 37, 28, 37, 37, 37],
		[44, 38, 29, 38, 17, 38],
		[37, 39, 39, 39, 39, 7 ],
		[40, 40, 40, 40, 40, 40],
		[43, 41, 41, 41, 16, 41],
		[36, 42, 42, 24, 42, 8 ],
		[39, 43, 43, 25, 43, 43],
		[42, 44, 44, 26, 15, 44],

		//red
		[45, 47, 18, 45, 2,  45],
		[46, 50, 19, 46, 46, 46],
		[47, 53, 20, 47, 47, 9 ],
		[48, 46, 48, 48, 1,  48],
		[49, 49, 49, 49, 49, 49],
		[50, 52, 50, 50, 50, 10],
		[51, 45, 51, 33, 0,  51],
		[52, 48, 52, 34, 52, 52],
		[53, 51, 53, 35, 53, 11],
		
		//black
		[54, 54, 54, 54, 54, 54]
			
	];

	// Create a starting list of all location indices.
	var scrambledLocationTiles = [];
	for (var i = 0; i < 55; i++) {
		scrambledLocationTiles[i] = i;
	}
	
	// Iterate through all location indices and scramble them.
	for (var i = 0; i < 55; i++) {
		// Define the starting location.
		var tileLocation = i;
		// For each turn in the scramble sequence, move the starting location.
		props.scrambleSequence.forEach(turn => {
			for (var j = 0; j < turn.quarterTurns; j++) {
				tileLocation = turnRules[tileLocation][turn.face];
			}
		});
		// Set the location index at the resulting location to be our starting location index.
		scrambledLocationTiles[tileLocation] = i;
	}
	
	// Set the color number for the tiles so that tiles 0-8 will use color 0, tiles 9-15 will use color 1 etc.	
	var tileColors = [];
	for (var i = 0; i < 26; i++) {
		for (var j = 0; j < 6; j++) {
			tileColors = [...tileColors, Math.floor(scrambledLocationTiles[locationTiles[i][j]] / 9)];
		}
	}
	
	// Draw the cubelet. Set six materials, one for each side of the cubelet.
	const tileMaterials = () => {
		var table = [];
		for (var i = 0; i <= 5; i++) {
			table.push(<TileMaterial tileColor={tileColors[props.location * 6 + i]} displayColors={props.displayColors}/>)
		}
		return table;
	}
	
	return (
		<mesh
			position={locationPositions[props.location]}
			ref={mesh}
			scale={[1, 1, 1]}
		>
			<boxBufferGeometry attach="geometry" args={[.97, .97, .97]} />
			{tileMaterials()}
		</mesh>
	);
	
}

function TileMaterial(props) {
	
	const colorScheme = [
		0xffd500, //yellow
		0xf0f0f0, //white
		0x009b48, //green
		0x0046ad, //blue
		0xff6800, //orange
		0xb71234, //red
		0x000000  //black
	];
	
	// Color the title according to its tile color if displayColors is true, or if the color number is 6 (ie. black).
	// Otherwise, color it white.
	
	if (props.tileColor == 6 || props.displayColors) {
		return (
			<meshBasicMaterial attachArray="material" color={colorScheme[props.tileColor]} />
		)
	} else {
		return (
			<meshBasicMaterial attachArray="material" color={colorScheme[1]} />
		)
	}
	
}	

function Cube(props) {
	
	const group = useRef();
	
	useFrame(() => {
		if (group && group.current) {
			group.current.rotation.y = group.current.rotation.y + 0.013;			
			group.current.rotation.x = group.current.rotation.x - 0.007;
		}
	});
	
	// Draw an inner black cube. This, in addition to the black inner tiles of the cubelets, will create a rectangular groove.
	// Then, draw each of the cubelets, passing the scramble sequence, the location, and the boolean determining if the cube
	// colors will be displayed as props.
	
	const cubelets = () => {
		var table = [];
		for (var i = 0; i <= 25; i++) {
			table.push(<Cubelet scrambleSequence={props.scrambleSequence} displayColors={props.displayColors} location={i} />)
		}
		return table;
	}
	
	return (
		<group ref={group}>
			<mesh>
				<boxBufferGeometry attach="geometry" args={[2.95, 2.95, 2.95]} />
				<meshBasicMaterial attach="material" color={"black"} />
			</mesh>
			{cubelets()}
		</group>
	);
	
}

export default function ScrambleScreen({ navigation, route }) {
	
	const [scrambleSequence, setScrambleSequence] = useState([]);
	const [scrambleSequenceInTurnNotation, setScrambleSequenceInTurnNotation] = useState("");
	
	const [displayColors, setDisplayColors] = useState(true);
	const [displayColorsIcon, setDisplayColorsIcon] = useState("check-box");
	
	const [useInspectionTimer, setUseInspectionTimer] = useState(true);
	const [useInspectionTimerIcon, setUseInspectionTimerIcon] = useState("check-box");
	
	const isFocused = useIsFocused();
	
	const generateScrambleSequence = () => {
		var newScrambleSequence = [];
		var prevFace = -1;
		for (var i = 0; i < 20; i++) {
			do {
				var newFace = Math.floor(6 * Math.random());
			} while (newFace == prevFace);
			newScrambleSequence = [...newScrambleSequence, {face: newFace, quarterTurns: 1 + Math.floor(3 * Math.random())}];
			prevFace = newFace;
		}
		setScrambleSequence(newScrambleSequence);
		
		var sequenceString = "";
		newScrambleSequence.forEach((turn, i) => {
			sequenceString = sequenceString + ["L", "R", "U", "D", "F", "B"][turn.face];
			sequenceString = sequenceString + ["", "2", "'"][turn.quarterTurns - 1];
			if ((i + 1) % 8 == 0) {
				sequenceString = sequenceString + "\n";
			} else if (i < newScrambleSequence.length - 1) {
				sequenceString = sequenceString + " ";
			}
		});
		sequenceString = sequenceString + "";
		setScrambleSequenceInTurnNotation(sequenceString);
		
	}
	
	useEffect(() => {
        if (isFocused) { 
            generateScrambleSequence();
        }		
	}, [isFocused]);
	
	const toggleDisplayColors = () => {
		if (displayColors) {
			setDisplayColors(false);
			setDisplayColorsIcon("check-box-outline-blank");
		} else {
			setDisplayColors(true);
			setDisplayColorsIcon("check-box");
		}
	}
	
	const toggleUseInspectionTimer = () => {
		if (useInspectionTimer) {
			setUseInspectionTimer(false);
			setUseInspectionTimerIcon("check-box-outline-blank");
		} else {
			setUseInspectionTimer(true);
			setUseInspectionTimerIcon("check-box");
		}
	}
	
	const startTimer = () => {
		if (useInspectionTimer) {
			navigation.navigate("InspectionTimer");
		} else {
			navigation.navigate("SolveTimer");
		}
	}
	
	return (
		<View style={styles.container}>
			<View style={styles.notationContainer}>
				<Text style={styles.notationText}>{scrambleSequenceInTurnNotation}</Text>
				<Button containerStyle={{margin: 5}} raised icon={{name: "refresh", color: "white"}} onPress={generateScrambleSequence} title="SCRAMBLE" />
			</View>
			<View style={styles.cubeContainer}>
				<Canvas>
					<Cube scrambleSequence={scrambleSequence} displayColors={displayColors} />
				</Canvas>
			</View>
			<View style={{marginTop: 10, flexDirection: "row"}}>
				<Button containerStyle={{margin: 5}} raised icon={{name: displayColorsIcon, color: "white"}} onPress={toggleDisplayColors} title="Display colors" />
				<Button containerStyle={{margin: 5}} raised icon={{name: useInspectionTimerIcon, color: "white"}} onPress={toggleUseInspectionTimer} title="Use inspection timer" />
			</View>
			<View>
				<Button containerStyle={{margin: 5}} raised icon={{name: "timer", color: "white"}} onPress={startTimer} title="START" />
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
	notationContainer: {
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	notationText: {
		fontSize: 30,
		fontWeight: "bold",
		textAlign: "center"
	},
	cubeContainer: {
		width: "75%",
		aspectRatio: 1
	}
});
