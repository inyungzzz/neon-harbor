function shouldOpenMissionFromEnter(activeTag, isContentEditable = false) {
  if (isContentEditable) return false;
  return !['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA'].includes(activeTag);
}

function getMissionChoiceFromKey(key, activeTag, isContentEditable = false, choicesVisible = false) {
  if (!choicesVisible || isContentEditable || ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA'].includes(activeTag)) return null;
  const index = { a: 0, A: 0, b: 1, B: 1 }[key];
  return index === undefined ? null : index;
}

if (typeof window !== 'undefined') window.shouldOpenMissionFromEnter = shouldOpenMissionFromEnter;
if (typeof window !== 'undefined') window.getMissionChoiceFromKey = getMissionChoiceFromKey;
if (typeof module !== 'undefined' && module.exports) module.exports = { shouldOpenMissionFromEnter, getMissionChoiceFromKey };
