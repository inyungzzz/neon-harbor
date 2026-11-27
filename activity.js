function getNeonHarborActivityFee(kuiTrust) {
  return kuiTrust >= 2 ? 0 : 100;
}

if (typeof window !== 'undefined') window.getNeonHarborActivityFee = getNeonHarborActivityFee;
if (typeof module !== 'undefined' && module.exports) module.exports = { getNeonHarborActivityFee };
