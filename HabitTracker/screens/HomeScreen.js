import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const habitsRef = collection(db, "habits");

    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setHabits(data);
    });

    return () => unsubscribe();
  }, []);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const completeHabitToday = async (habit) => {
    const today = getTodayString();
    const lastCompleted = habit.lastCompleted || null;

    let newStreak = habit.streak || 0;

    if (lastCompleted === today) {
      return;
    }

    if (!lastCompleted) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastCompleted);
      const t = new Date(today);
      const diff = (t - lastDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        newStreak = newStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    const habitRef = doc(db, "habits", habit.id);

    await updateDoc(habitRef, {
      lastCompleted: today,
      streak: newStreak,
      totalCompletions: (habit.totalCompletions || 0) + 1,
    });
  };

  const renderHabit = ({ item }) => (
    <View style={styles.habitCard}>
      <Text style={styles.habitName}>{item.name}</Text>
      {item.goalPerDay ? (
        <Text style={styles.habitText}>Goal per day: {item.goalPerDay}</Text>
      ) : null}
      <Text style={styles.habitText}>Streak: {item.streak || 0} days</Text>
      <Text style={styles.habitText}>
        Total completions: {item.totalCompletions || 0}
      </Text>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => completeHabitToday(item)}
      >
        <Text style={styles.completeButtonText}>Complete Today</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Add Habit"
        onPress={() => navigation.navigate("AddHabit")}
      />
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  habitCard: {
    backgroundColor: "#f0f0f5",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  habitText: {
    fontSize: 14,
    marginBottom: 2,
  },
  completeButton: {
    marginTop: 8,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});