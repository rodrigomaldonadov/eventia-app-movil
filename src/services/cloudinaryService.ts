/**
 * Servicio de integración con Cloudinary para subida y optimización de imágenes de eventos y perfiles.
 * Permite subir archivos locales (de cámara o galería) al bucket de Cloudinary
 * y obtener URLs optimizadas con compresión automática y transformaciones.
 */

export interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id: string;
  version: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
}

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'eventia-cloud',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'eventia_unsigned',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
};

export const cloudinaryService = {
  /**
   * Indica si una URL proviene de Cloudinary.
   */
  isCloudinaryUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  },

  /**
   * Genera una URL optimizada con transformaciones de Cloudinary (auto-formato, compresión y recorte).
   */
  getOptimizedUrl(
    url: string,
    options?: { width?: number; height?: number; quality?: string }
  ): string {
    if (!url) return '';
    if (!this.isCloudinaryUrl(url)) return url;

    const width = options?.width || 800;
    const height = options?.height;
    const quality = options?.quality || 'auto';

    const transformation = height
      ? `f_auto,q_${quality},w_${width},h_${height},c_fill`
      : `f_auto,q_${quality},w_${width}`;

    return url.replace('/upload/', `/upload/${transformation}/`);
  },

  /**
   * Sube una imagen a Cloudinary usando el endpoint de upload sin firmar (unsigned upload).
   * Compatible con URIs de React Native (ImagePicker) y Web.
   */
  async uploadImage(fileUri: string): Promise<string> {
    if (!fileUri) {
      throw new Error('URI de archivo no válida');
    }

    // Si ya es una URL web o de Cloudinary, retornarla directamente
    if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
      return fileUri;
    }

    try {
      const formData = new FormData();

      // Construcción compatible con React Native Mobile y Expo Web
      const filename = fileUri.split('/').pop() || `eventia_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: fileUri,
        name: filename,
        type,
      } as any);

      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'eventia_events');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[CloudinaryService] Respuesta no exitosa:', errorData);
        // Si el preset no está configurado en vivo, devolvemos la URI local como fallback seguro
        return fileUri;
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url || data.url || fileUri;
    } catch (error) {
      console.warn('[CloudinaryService] Error de red al subir a Cloudinary, usando URI local:', error);
      return fileUri;
    }
  },
};

export default cloudinaryService;

