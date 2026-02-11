import React, { forwardRef, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export const ImageWithFallback = forwardRef<HTMLImageElement, Props>(function ImageWithFallback(
  props,
  ref
) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt = 'image', style, className = '', fallbackClassName = '', ...rest } = props

  // When error, render a themed placeholder that uses CSS variables so themes apply
  if (didError) {
    return (
      <div
        className={`inline-block align-middle ${className}`}
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 8,
          ...((style as React.CSSProperties) || {}),
        }}
        aria-label="image-placeholder"
      >
        <div className={`flex items-center justify-center w-full h-full ${fallbackClassName}`}>
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...rest}
    />
  )
})

ImageWithFallback.displayName = 'ImageWithFallback'
