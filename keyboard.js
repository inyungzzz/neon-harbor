function shouldOpenMissionFromEnter(activeTag, isContentEditable = false) {
  if (isContentEditable) return false;
  return !['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA'].includes(activeTag);
}

if (typeof window !== 'undefined') window.shouldOpenMissionFromEnter = shouldOpenMissionFromEnter;
if (typeof module !== 'undefined' && module.exports) module.exports = { shouldOpenMissionFromEnter };
