import emojiData from "@emoji-mart/data/sets/15/all.json";
import { init } from 'emoji-mart';

export const initializeEmojiData = async () => {
  try {
    await init({ data: emojiData });
    return true;
  } catch (error) {
    console.error("Error initializing emoji data:", error);
  }
};
