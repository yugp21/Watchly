const hasChanged = (oldHash, newHash) => {
  if (!oldHash) return false; // First check — no baseline yet
  return oldHash !== newHash;
};

module.exports = { hasChanged };
