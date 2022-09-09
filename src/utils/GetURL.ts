export default function getUrl() {
  if (import.meta.env.MODE === "production") {
    return import.meta.env.SITE;
  }
  return "http://localhost:3000/"; // I'm not sure how to change this according to the config
}

export const url = getUrl();