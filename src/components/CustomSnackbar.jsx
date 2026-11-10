// AFC-style toast: slides in from the right, coloured icon, title + message, close button,
// optional action (e.g. Undo) and a shrinking bar showing the time left.
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import {
  LuCircleAlert as CircleAlert,
  LuCircleCheck as CircleCheck,
  LuInfo as Info,
  LuTriangleAlert as TriangleAlert,
  LuX as X,
} from 'react-icons/lu';
import { useThemeMode } from '../context/ThemeContext.jsx';
import '../styles/customSnackbar.css';

const AUTO_HIDE = 4000;

const VARIANTS = {
  success: { title: 'Success', Icon: CircleCheck },
  error: { title: 'Something went wrong', Icon: CircleAlert },
  warning: { title: 'Please check', Icon: TriangleAlert },
  info: { title: 'Note', Icon: Info },
};

const SlideFromRight = (props) => <Slide {...props} direction="left" />;

//   <CustomSnackbar open severity message onClose anchorOrigin action={{ label, onClick }} title />
export default function CustomSnackbar({
  open, severity = 'info', message, title, onClose, action,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}) {
  const dark = useThemeMode().mode === 'dark';
  const v = VARIANTS[severity] || VARIANTS.info;
  const duration = action ? AUTO_HIDE + 2000 : AUTO_HIDE; // a little longer when there's something to tap

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return; // a stray click should not hide the message
    onClose?.(event, reason);
  };

  return (
    <Snackbar anchorOrigin={anchorOrigin} open={Boolean(open)} autoHideDuration={duration} onClose={handleClose}
      slots={{ transition: SlideFromRight }} sx={{ top: { xs: 12, sm: 78 } }}>
      <div className={`afc-toast afc-toast-${severity}${dark ? ' dark' : ''} toast`} role={severity === 'error' ? 'alert' : 'status'}>
        <span className="afc-toast-icon"><v.Icon size={20} /></span>
        <div className="afc-toast-body">
          <strong className="afc-toast-title">{title || v.title}</strong>
          <span className="afc-toast-message">{message}</span>
          {action && (
            <button type="button" className="afc-toast-action" onClick={(e) => { action.onClick(); handleClose(e, 'action'); }}>{action.label}</button>
          )}
        </div>
        <IconButton size="small" className="afc-toast-close" aria-label="Close" onClick={(e) => handleClose(e, 'closeButton')}>
          <X size={16} />
        </IconButton>
        {/* shrinking bar = time left before the message hides */}
        <span className="afc-toast-progress" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </Snackbar>
  );
}
