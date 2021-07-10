export type Tier = "webtoon" | "challenge" | "bestChallenge";

export function getTier(url: URL): Tier {
  if (url.pathname.startsWith("/webtoon/")) {
    return "webtoon";
  } else if (url.pathname.startsWith("/bestChallenge/")) {
    return "bestChallenge";
  } else if (url.pathname.startsWith("/challenge/")) {
    return "challenge";
  } else {
    throw new Error(`unknown URL: ${url}`);
  }
}
