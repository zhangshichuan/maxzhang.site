export interface PhotoWorkSummary {
  slug: string
  caption: string
  takenAt: string
  location: string | null
  tags: string[]
  photoCount: number
  coverUrl: string
  thumbUrl: string
  commentCount: number
}

export interface PhotoDetail {
  largeUrl: string
  thumbUrl: string
  width: number
  height: number
  camera: string | null
  lens: string | null
  focal: string | null
  aperture: string | null
  shutter: string | null
  iso: string | null
}

export interface PhotoWorkDetail extends PhotoWorkSummary {
  photos: PhotoDetail[]
}
