import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { db } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

export default function AddHabitScreen({ navigation }) {
  const [name, setName] = useState("");
  const [goalPerDay, setGoalPerDay] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a habit name.");
      return;
    }

    let goalNumber = parseInt(goalPerDay, 10);
    if (isNaN(goalNumber)) {
      goalNumber = null;
    }

    try {
      await addDoc(collection(db, "habits"), {
        name: name.trim(),
        goalPerDay: goalNumber,
        streak: 0,
        lastCompleted: null,
        totalCompletions: 0,
        createdAt: new Date(),
      });

      navigation.goBack();
    } catch (error) {
      console.log("Error adding habit:", error);
      Alert.alert("Error", "Could not save habit.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Drink Water"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Goal per day (optional number)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 8 (glasses)"
        value={goalPerDay}
        onChangeText={setGoalPerDay}
        keyboardType="numeric"
      />

      <Button title="Save Habit" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});