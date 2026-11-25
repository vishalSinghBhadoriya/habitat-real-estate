const base = import.meta.env.BASE_URL

export function publicAsset(path: string) {
 return base + path.replace(/^\/+/, '')
}

export function absoluteAppUrl(path: string) {
 return new URL(publicAsset(path), window.location.origin).href
}
