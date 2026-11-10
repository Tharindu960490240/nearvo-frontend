// AFC-style loader: the Nearvo logo with spinning rings and "Loading..." dots.
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import { LuMapPin as MapPin } from 'react-icons/lu';
import { useThemeMode } from '../context/ThemeContext.jsx';
import '../styles/loadingSpinner.css';

/** The animated logo + rings + "Loading..." text */
export function LoaderVisual({ text = 'Loading' }) {
  const dark = useThemeMode().mode === 'dark';
  return (
    <>
      <div className="afc-loader">
        <span className="afc-loader-glow" />
        <span className="afc-loader-ring" />
        <span className="afc-loader-ring afc-loader-ring-slow" />
        {/* blue tile on light backgrounds, white mark on dark */}
        <span className="afc-loader-icon">
          <span className={`afc-loader-mark${dark ? ' white' : ''}`}><MapPin size={dark ? 30 : 24} strokeWidth={2.5} /></span>
        </span>
      </div>
      <p className="loading-text">
        {text}
        <span className="loading-dots" aria-hidden="true"><i /><i /><i /></span>
      </p>
    </>
  );
}

/** Full-screen overlay: <LoadingSpinner open={busy} text="Posting your job" /> */
export default function LoadingSpinner({ open, text }) {
  const dark = useThemeMode().mode === 'dark';
  return (
    <Modal open={Boolean(open)} closeAfterTransition disableAutoFocus disableEnforceFocus disableRestoreFocus
      slotProps={{ backdrop: { className: 'loading-modal-backdrop' } }}>
      <Fade in={Boolean(open)}>
        <Box className={`loading-spinner-box${dark ? ' dark' : ''}`} role="status" aria-live="polite">
          <LoaderVisual text={text} />
        </Box>
      </Fade>
    </Modal>
  );
}

/** Same loader inside the page (for screens that are still loading their data) */
export function InlineLoader({ compact, text }) {
  return (
    <div className={`loading-spinner-inline${useThemeMode().mode === 'dark' ? ' dark' : ''}`} role="status" aria-live="polite" style={compact ? { minHeight: 0, padding: '24px 16px' } : undefined}>
      <LoaderVisual text={text} />
    </div>
  );
}
