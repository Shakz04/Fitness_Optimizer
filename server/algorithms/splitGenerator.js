// Greedy constraint scheduler. For each of d training days, scan up to t
// template nodes to choose the first candidate that does not violate the
// posterior-chain recovery constraint. Time is O(d * t), space is O(d).

const templates = {
  strength: [
    { name: "Upper Strength", muscleGroups: ["chest", "back", "shoulders", "triceps", "biceps"] },
    { name: "Lower Strength", muscleGroups: ["quads", "hamstrings", "glutes", "core"] },
    { name: "Push", muscleGroups: ["chest", "shoulders", "triceps"] },
    { name: "Pull", muscleGroups: ["back", "biceps"] },
    { name: "Legs", muscleGroups: ["quads", "hamstrings", "glutes", "calves"] }
  ],
  hypertrophy: [
    { name: "Push", muscleGroups: ["chest", "shoulders", "triceps"] },
    { name: "Pull", muscleGroups: ["back", "biceps"] },
    { name: "Legs", muscleGroups: ["quads", "hamstrings", "glutes", "calves"] },
    { name: "Upper Volume", muscleGroups: ["chest", "back", "shoulders", "arms"] },
    { name: "Lower Volume", muscleGroups: ["quads", "hamstrings", "glutes", "core"] },
    { name: "Arms and Delts", muscleGroups: ["shoulders", "biceps", "triceps"] }
  ],
  powerlifting: [
    { name: "Squat Focus", muscleGroups: ["quads", "glutes", "core"] },
    { name: "Bench Focus", muscleGroups: ["chest", "shoulders", "triceps"] },
    { name: "Deadlift Focus", muscleGroups: ["hamstrings", "glutes", "back"] },
    { name: "Bench Volume", muscleGroups: ["chest", "triceps", "back"] },
    { name: "Secondary Lower", muscleGroups: ["quads", "hamstrings", "core"] }
  ]
};

const exercises = {
  barbell: {
    chest: ["Bench Press", "Incline Barbell Press"],
    back: ["Barbell Row", "Pull-up"],
    shoulders: ["Overhead Press", "Lateral Raise"],
    triceps: ["Close-Grip Bench Press", "Skull Crusher"],
    biceps: ["Barbell Curl", "Hammer Curl"],
    quads: ["Back Squat", "Front Squat"],
    hamstrings: ["Romanian Deadlift", "Good Morning"],
    glutes: ["Hip Thrust", "Deadlift"],
    calves: ["Standing Calf Raise"],
    core: ["Plank", "Hanging Knee Raise"],
    arms: ["Barbell Curl", "Cable Pressdown"]
  },
  dumbbell: {
    chest: ["Dumbbell Press", "Dumbbell Fly"],
    back: ["One-Arm Row", "Chest-Supported Row"],
    shoulders: ["Dumbbell Shoulder Press", "Lateral Raise"],
    triceps: ["Overhead Extension", "Dumbbell Kickback"],
    biceps: ["Dumbbell Curl", "Incline Curl"],
    quads: ["Goblet Squat", "Bulgarian Split Squat"],
    hamstrings: ["Dumbbell RDL", "Leg Curl"],
    glutes: ["Dumbbell Hip Thrust", "Reverse Lunge"],
    calves: ["Single-Leg Calf Raise"],
    core: ["Dead Bug", "Side Plank"],
    arms: ["Dumbbell Curl", "Overhead Extension"]
  },
  bodyweight: {
    chest: ["Push-up", "Decline Push-up"],
    back: ["Inverted Row", "Pull-up"],
    shoulders: ["Pike Push-up", "Wall Walk"],
    triceps: ["Diamond Push-up", "Bench Dip"],
    biceps: ["Chin-up", "Towel Curl"],
    quads: ["Split Squat", "Step-up"],
    hamstrings: ["Single-Leg Hip Hinge", "Hamstring Walkout"],
    glutes: ["Glute Bridge", "Walking Lunge"],
    calves: ["Calf Raise"],
    core: ["Plank", "Mountain Climber"],
    arms: ["Chin-up", "Diamond Push-up"]
  }
};

const posteriorChain = new Set(["hamstrings", "glutes", "back"]);

function conflicts(previous, candidate) {
  if (!previous) return false;
  const previousHeavyPosterior = previous.muscleGroups.some((group) => posteriorChain.has(group));
  const candidateHeavyPosterior = candidate.muscleGroups.some((group) => posteriorChain.has(group));
  return previousHeavyPosterior && candidateHeavyPosterior;
}

function pickExercises(muscleGroups, equipment) {
  const available = equipment?.length ? equipment : ["bodyweight"];
  const library = available.includes("barbell")
    ? exercises.barbell
    : available.includes("dumbbell")
      ? exercises.dumbbell
      : exercises.bodyweight;

  return muscleGroups.flatMap((group) => (library[group] ?? []).slice(0, 2)).slice(0, 8);
}

export function generateTrainingSplit({ daysPerWeek, goal, equipment }) {
  const days = Math.max(1, Math.min(7, Number(daysPerWeek)));
  const pool = templates[goal] ?? templates.hypertrophy;
  const schedule = [];

  for (let day = 1; day <= days; day += 1) {
    const previous = schedule[schedule.length - 1];
    let chosen = null;
    for (let offset = 0; offset < pool.length; offset += 1) {
      const candidate = pool[(day - 1 + offset) % pool.length];
      if (!conflicts(previous, candidate)) {
        chosen = candidate;
        break;
      }
    }
    chosen ??= pool[(day - 1) % pool.length];

    schedule.push({
      dayNumber: day,
      title: chosen.name,
      muscleGroups: chosen.muscleGroups,
      suggestedExercises: pickExercises(chosen.muscleGroups, equipment)
    });
  }

  return schedule;
}
