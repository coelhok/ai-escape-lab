type SceneImageProps = {
  imageUrl: string
  imageLoading: boolean
  alt: string
  onLoad: () => void
  onError: () => void
}

export default function SceneImage({
  imageUrl,
  imageLoading,
  alt,
  onLoad,
  onError,
}: SceneImageProps) {
  return (
    <div className="scene-card scene-card--image">
      <div className="scene-image-wrapper">
        {imageLoading && (
          <div className="scene-image-loader">
            <span>Gerando cena...</span>
          </div>
        )}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={alt}
            className={`scene-image ${imageLoading ? 'scene-image--hidden' : 'scene-image--visible'}`}
            onLoad={onLoad}
            onError={onError}
          />
        )}
      </div>
    </div>
  )
}
