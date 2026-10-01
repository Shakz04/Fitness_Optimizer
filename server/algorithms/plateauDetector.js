// Sliding-window plateau detection. Sorting is O(m log m) for m logs of the
// exercise, and the final window scan is O(N). A plateau is flagged when
// neither load nor load*reps improves across the selected window.

function bestSessionScore(session) {
  return Number(session.weight) * Number(session.reps);
}

export function detectPlateau(logs, exerciseName, windowSize = 5) {
  const sessions = logs
    .filter((log) => log.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-windowSize);

  if (sessions.length < windowSize) {
    return { exerciseName, plateaued: false, reason: "Not enough sessions yet.", sessions };
  }

  let improved = false;
  for (let index = 1; index < sessions.length; index += 1) {
    const previous = sessions[index - 1];
    const current = sessions[index];
    if (Number(current.weight) > Number(previous.weight) || bestSessionScore(current) > bestSessionScore(previous)) {
      improved = true;
      break;
    }
  }

  return {
    exerciseName,
    plateaued: !improved,
    reason: improved ? "Recent sessions still show progression." : `No load or volume improvement across the last ${windowSize} sessions.`,
    sessions
  };
}
