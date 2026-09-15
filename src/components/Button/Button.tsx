import type { FC } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children?: React.ReactNode;
  classes?: {[key: string]: string};
  type: 'button' | 'submit' | 'reset';
  priority?: 'primary' | 'secondary' | 'tertiary';
}

const Button: FC<ButtonProps> = ({ children, classes, type, priority }) => (
  <div className={styles[priority || 'primary']}>
    {children}
  </div>
);

export default Button;
