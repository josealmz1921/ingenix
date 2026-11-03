import type { SweetAlertOptions } from 'sweetalert2';
import styles from './confirmation.module.css';

/** Shared presentation for body-level portals, including the page builder. */
export function confirmationTheme(danger = false): SweetAlertOptions {
  return {
    iconColor: '#9bc5ff',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    focusCancel: true,
    buttonsStyling: false,
    scrollbarPadding: false,
    heightAuto: false,
    customClass: {
      popup: styles.popup,
      title: styles.title,
      htmlContainer: styles.text,
      actions: styles.actions,
      confirmButton: danger ? styles.danger : styles.confirm,
      cancelButton: styles.cancel,
    },
  };
}
