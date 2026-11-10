import { useEffect, useRef, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { LuMapPin as MapPin } from 'react-icons/lu';
import { api } from '../api.js';
import { localityLabel } from '../australia.js';
import { Spinner } from './ui.jsx';

/**
 * Australian suburb / postcode autocomplete (Material UI Autocomplete).
 * onSelect receives { id, name, state, postcode, latitude, longitude } or null when cleared.
 * bare = borderless input for use inside the search bar.
 */
export default function LocationInput({ value = '', onSelect, placeholder = 'Suburb or postcode', bare, id, required, label = 'Suburb or postcode', help }) {
  const [text, setText] = useState(value);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => { setText(value); if (!value) setSelected(null); }, [value]);

  useEffect(() => {
    const q = text.trim();
    if (q.length < 2 || q === value || (selected && q === localityLabel(selected))) { setLoading(false); return undefined; }
    const rid = ++reqId.current;
    setLoading(true);
    const t = setTimeout(() => {
      api('/suburbs', { params: { q } })
        .then((rows) => { if (rid === reqId.current) setItems(rows); })
        .catch(() => {})
        .finally(() => rid === reqId.current && setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [text, value, selected]);

  return (
    <Autocomplete
      id={id}
      options={items}
      value={selected}
      inputValue={text}
      filterOptions={(x) => x}
      autoHighlight
      forcePopupIcon={false}
      autoComplete
      includeInputInList
      noOptionsText={text.trim().length < 2 ? 'Type at least 2 letters' : loading ? 'Searching…' : 'No matching suburb'}
      getOptionLabel={(o) => (typeof o === 'string' ? o : localityLabel(o))}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onInputChange={(_, v, reason) => {
        if (reason === 'reset') return;
        setText(v);
        if (!v.trim()) { setSelected(null); onSelect(null); }
      }}
      onChange={(_, loc) => {
        setSelected(loc);
        if (loc) setText(localityLabel(loc));
        onSelect(loc || null);
      }}
      renderOption={({ key, ...props }, l) => (
        <li key={key} {...props} style={{ gap: 10 }}>
          <MapPin size={16} color="var(--brand)" />
          <span style={{ flex: 1 }}>{l.name}</span>
          <span className="small muted">{l.state} {l.postcode}</span>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={bare ? undefined : label}
          placeholder={placeholder}
          required={required}
          variant={bare ? 'standard' : 'outlined'}
          helperText={help}
          slotProps={{
            htmlInput: { ...params.inputProps, 'aria-label': label },
            inputLabel: { shrink: true },
            input: {
              ...params.InputProps,
              ...(bare ? { disableUnderline: true, sx: { fontSize: '1rem', py: 0.75 } } : {}),
              startAdornment: <InputAdornment position="start"><MapPin size={18} color="var(--brand)" /></InputAdornment>,
              endAdornment: <>{loading && <Spinner small />}{params.InputProps.endAdornment}</>,
            },
          }}
        />
      )}
    />
  );
}
