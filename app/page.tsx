import { getChapterList, getRole, getSheet, getStory, configured } from "@/lib/data";
import { HomeView } from "./HomeView";

export default async function Home() {
  const [story, chapters, role, sheet] = await Promise.all([getStory(), getChapterList(), getRole(), getSheet()]);
  return (
    <HomeView
      configured={configured()}
      story={story}
      chapters={chapters.filter((c) => c.published || role === "player")}
      role={role}
      sheet={sheet}
    />
  );
}
