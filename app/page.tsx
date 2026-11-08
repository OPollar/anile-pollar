import { getChapterList, getIsMaster, getSheet, getStory, configured } from "@/lib/data";
import { HomeView } from "./HomeView";

export default async function Home() {
  const [story, chapters, isMaster, sheet] = await Promise.all([getStory(), getChapterList(), getIsMaster(), getSheet()]);
  return (
    <HomeView
      configured={configured()}
      story={story}
      chapters={chapters.filter((c) => c.published || isMaster)}
      isMaster={isMaster}
      sheet={sheet}
    />
  );
}
