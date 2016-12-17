'use strict';

const LOCKED = [
  /^\/special\//i, // Special pages/directores
  /^\/categor(?:y|ies)\//i // Categories
];

F.lockedPatterns = LOCKED;
F.locked = rt => {
  if (typeof rt !== 'string') return true;
  for (const pat of LOCKED)
    if (rt.match(pat)) return true;
  return false;
};
