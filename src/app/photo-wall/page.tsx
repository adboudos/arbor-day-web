import type { Metadata } from "next";
import PhotoWall from "./PhotoWall";

export const metadata: Metadata = {
  title: "Photo Wall: 6th Annual Arbor Day",
  description:
    "Party photos from Arbor Days past, uploaded by the people who were there. Add yours.",
};

export default function PhotoWallPage() {
  return <PhotoWall />;
}
