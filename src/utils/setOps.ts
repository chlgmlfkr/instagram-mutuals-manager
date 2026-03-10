export type SetOpsResult = {
  unfollowers: string[];
  fans: string[];
  mutuals: string[];
};

function normalize(list: string[]) {
  return Array.from(new Set(list.map((item) => item.trim().toLowerCase()).filter(Boolean)));
}

export function setOps(followers: string[], following: string[]): SetOpsResult {
  const followersSet = new Set(normalize(followers));
  const followingSet = new Set(normalize(following));

  const unfollowers: string[] = [];
  const fans: string[] = [];
  const mutuals: string[] = [];

  for (const user of followingSet) {
    if (followersSet.has(user)) {
      mutuals.push(user);
    } else {
      unfollowers.push(user);
    }
  }

  for (const user of followersSet) {
    if (!followingSet.has(user)) {
      fans.push(user);
    }
  }

  return { unfollowers, fans, mutuals };
}
