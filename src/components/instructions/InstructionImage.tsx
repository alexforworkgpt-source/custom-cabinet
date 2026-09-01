interface InstructionImageProps {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export function InstructionImage({ src, alt, caption, width, height }: InstructionImageProps) {
  return (
    <figure className="mt-4 md:mx-auto md:max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-dark-700 bg-white p-1 sm:p-2">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="mx-auto block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-dark-500">{caption}</figcaption>
    </figure>
  );
}
