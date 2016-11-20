import React from 'react';
import { compose, withState } from 'recompose';

const colors = {
  regular: '#1D2D3C',
  hover: '#3899EC',
};

const styles = {
  container: {
    width: 36,
    height: 36,
  },
};

const icons = {
  Mobile: (
    <g fillRule="evenodd">
      <path d="M22 5c1.103 0 2 .897 2 2v20c0 1.103-.897 2-2 2h-9c-1.103 0-2-.897-2-2V7c0-1.103.897-2 2-2h9m0-1h-9a3 3 0 0 0-3 3v20a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3" />
      <path d="M13 8h9v15h-9V8zm9-1h-9a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 26h3v1h-3v-1z" />
    </g>
  ),
  Desktop: (
    <g fillRule="evenodd">
      <path d="M27 8c1.103 0 2 .897 2 2v12c0 1.103-1.336 2-2.439 2H8.105C7.002 24 6 23.103 6 22V10c0-1.103 1.002-2 2.105-2H27m-.439-1H8.105C6.448 7 5 8.343 5 10v12c0 1.657 1.448 3 3.105 3h18.456C28.218 25 30 23.657 30 22V10c0-1.657-1.562-3-3.219-3h-.22M14 29h7v.94h-7V29zM17 25h1v4h-1v-4z" />
      <path d="M6 20h23v1H6v-1z" />
    </g>
  ),
};

const MobileIconDef = ({ icon, hovered, setHover }) => {
  const IconComp = icons[icon];
  return (<div style={styles.container} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    <svg viewBox={`0 0 ${styles.container.width} ${styles.container.height}`} fill={hovered ? colors.hover : colors.regular}>
      {IconComp}
    </svg>
  </div>);
};

const { bool, func, oneOf } = React.PropTypes;
MobileIconDef.propTypes = {
  icon: oneOf(Object.keys(icons)),

  // State
  hovered: bool.isRequired,

  // State Actions
  setHover: func.isRequired,
};

const enhance = compose(
  withState('hovered', 'setHover', false)
);

const MobileIcon = enhance(MobileIconDef);
MobileIcon.displayName = 'MobileIcon';

export default MobileIcon;
