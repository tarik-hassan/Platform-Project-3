import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, getDocs, deleteDoc } from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Reset completionsToday if lastCompleted is not today
  const resetDailyCompletions = async () => {
    const today = getTodayString();
    const habitsRef = collection(db, "habits");
    const snapshot = await getDocs(habitsRef);

    snapshot.forEach(async (docSnap) => {
      const habit = docSnap.data();
      if (habit.lastCompleted !== today) {
        const habitRef = doc(db, "habits", docSnap.id);
        await updateDoc(habitRef, { completionsToday: 0 });
      }
    });
  };

  useEffect(() => {
    const habitsRef = collection(db, "habits");

    // Listen for real-time updates
    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setHabits(data);
    });

    resetDailyCompletions();

    return () => unsubscribe();
  }, []);

  const completeHabitToday = async (habit) => {
    const today = getTodayString();
    const goal = habit.goalPerDay || 1;
    const current = habit.completionsToday || 0;

    let completionsToday = current + 1;
    let newStreak = habit.streak || 0;

    if (habit.lastCompleted === today) {
      newStreak = habit.streak;
    } else {
      if (habit.lastCompleted) {
        const lastDate = new Date(habit.lastCompleted);
        const t = new Date(today);
        const diff = Math.floor((t - lastDate) / (1000 * 60 * 60 * 24));
        newStreak = diff === 1 ? newStreak + 1 : 1;
      } else {
        newStreak = 1;
      }
    }

    try {
      const habitRef = doc(db, "habits", habit.id);
      await updateDoc(habitRef, {
        lastCompleted: today,
        completionsToday,
        streak: newStreak,
        totalCompletions: (habit.totalCompletions || 0) + 1,
      });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not complete habit.");
    }
  };

  const deleteHabit = (habitId) => {
    Alert.alert(
      "Delete Habit?",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const habitRef = doc(db, "habits", habitId);
              await deleteDoc(habitRef);
              Alert.alert("Deleted", "Habit has been deleted.");
            } catch (e) {
              console.log(e);
              Alert.alert("Error", "Could not delete habit.");
            }
          },
        },
      ]
    );
  };

  const getFlames = (streak) => {
    if (streak >= 10) return "🔥🔥🔥";
    if (streak >= 5) return "🔥🔥";
    if (streak >= 2) return "🔥";
    return "";
  };

  const renderHabit = ({ item }) => {
    const flames = getFlames(item.streak || 0);
    const goal = item.goalPerDay || 1;
    const progress = Math.min((item.completionsToday || 0) / goal, 1) * 100;

    return (
      <View style={styles.habitCard}>
        <View style={styles.headerRow}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.flames}>{flames}</Text>
        </View>

        {item.goalPerDay ? (
          <>
            <Text style={styles.habitText}>
              Daily Goal: {item.goalPerDay} | Today: {item.completionsToday || 0}
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </>
        ) : null}

        <Text style={styles.habitText}>Streak: {item.streak || 0} days</Text>
        <Text style={styles.habitText}>
          Total completions: {item.totalCompletions || 0}
        </Text>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => completeHabitToday(item)}
          disabled={item.completionsToday >= item.goalPerDay}
        >
          <Text style={styles.completeButtonText}>
            {item.completionsToday >= item.goalPerDay ? "Complete ✅" : "Complete Today ✔️"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: "#FF4C4C", marginTop: 8 }]}
          onPress={() => deleteHabit(item.id)}
        >
          <Text style={styles.completeButtonText}>Delete Habit 🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
  container: { flex: 1, padding: 16, backgroundColor: "#FAFAFA" },

  habitCard: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between" },

  habitName: { fontSize: 20, fontWeight: "700" },
  flames: { fontSize: 22 },
  habitText: { fontSize: 14, marginTop: 4, color: "#444" },

  progressBarBackground: {
    marginTop: 8,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },

  completeButton: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  completeButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
});
