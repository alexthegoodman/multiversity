interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export const getYouTubeVideos = async (
  lessonTitle: string,
  sectionTitle: string
): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch("/api/youtube/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${lessonTitle} ${sectionTitle}`,
        maxResults: 3,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch YouTube videos");
    }

    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
};