// src/app/photo/[id]/page.tsx
import PhotoDetail from "@/components/PhotoDetail";

type PhotoPageProps = {
  params: {
    id: string;
  };
};

// This page will render the detailed view of a single photo
export default function PhotoPage({ params }: PhotoPageProps) {
  const photoId = parseInt(params.id, 10);

  if (isNaN(photoId)) {
    return <div className="text-center text-red-500">Invalid Photo ID</div>;
  }

  return <PhotoDetail photoId={photoId} />;
}
