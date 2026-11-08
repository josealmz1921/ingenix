export type PreviewFile = {
  preview: string;
  file?: File | null;
  name?: string;
  position?: number;
};

export type DropzoneProps = {
  label: string;
  values: PreviewFile[];
  onChange: (files: PreviewFile[]) => void;
  /** Notifies a confirmed local removal; does not delete a remote file. */
  onDelete?: (file: PreviewFile) => void | Promise<void>;
  maxFiles?: number;
  alt?: string;
  disabled?: boolean;
  uploading?: boolean;
};
