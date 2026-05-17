interface PostImageProps {
  src: string
  alt: string
  caption?: string
}

export function PostImage({ src, alt, caption }: PostImageProps) {
  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-2xl shadow-sm border border-slate-100"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
