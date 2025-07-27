export type photoType = {
    id: string,
    original_filename: string,
    image_url: string, // Corrected from Imageurl
    alt: string,
    date?: string,
    location?: string,
    groupId ?: number,
}