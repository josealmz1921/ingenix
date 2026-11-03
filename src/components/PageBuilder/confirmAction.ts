import Swal from 'sweetalert2';
import { confirmationTheme } from '../Admin/confirmationTheme';

const confirmations = {
    load: {
        title: '¿Cargar el contenido actual?',
        text: 'Se reemplazará toda la edición local por los textos, imágenes, enlaces y SEO originales de Ingenix. El borrador guardado y la publicación no cambiarán hasta que guardes o publiques explícitamente.',
        confirmButtonText: 'Cargar contenido',
    },
    remove: {
        title: '¿Eliminar este bloque?',
        text: 'Se quitará de la edición local del borrador. Las imágenes no se borrarán de Cloudinary. Guarda el borrador para conservar la eliminación.',
        confirmButtonText: 'Eliminar bloque',
    },
    publish: {
        title: '¿Publicar los cambios?',
        text: 'La estructura y el SEO de la versión guardada serán públicos en Ingenix. Las tarjetas de servicios y proyectos se toman del catálogo publicado, no del borrador. El blog se administra por separado.',
        confirmButtonText: 'Sí, publicar',
    },
} as const;

export type BuilderConfirmation = keyof typeof confirmations;

export async function confirmBuilderAction(action: BuilderConfirmation): Promise<boolean> {
    const result = await Swal.fire({
        ...confirmationTheme(action === 'remove'),
        ...confirmations[action],
        icon: 'warning',
    });
    return result.isConfirmed === true;
}
