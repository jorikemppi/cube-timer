# Cube Timer

A Rubik's Cube speedcubing timer for smartphones. Created in React Native for a mobile programming course at Haaga-Helia University of Applied Sciences.

Features:

- Generates a scramble
- Optionally creates a post-scramble visualization of the cube for checking if you scrambled correctly
- Optional inspection timer with voice notifications at 8 and 12 seconds
- Records your solve times
- Provides statistics (best/worst/average of all and the last 100 solves, plus WCA averages of 5 and 12 solves)

Using:

- react-three-fiber: to draw the cube
- @react-navigation/native: for stack navigation
- react-native-elements: for UI elements
- react-native-stopwatch-timer: for the timer
- expo-speech: for alerts during inspection time
- expo-sqlite: to store solve times