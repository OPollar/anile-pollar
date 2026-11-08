import { notFound } from "next/navigation";
import { getStory } from "@/lib/data";
import { StoryForm } from "@/components/admin/StoryForm";

export default async function StoryPage() {
  const story = await getStory();
  if (!story) notFound();
  return <StoryForm story={story} />;
}
